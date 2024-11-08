import rawCanvas from 'canvas'
import { existsSync, readdirSync, readFileSync, statSync } from 'fs'
import { merge } from 'lodash-es'
import { createCanvas, loadImage } from 'node-canvas-webgl'
import { join, parse } from 'path'
import {
   AmbientLight,
   BoxGeometry,
   DirectionalLight,
   Material,
   MathUtils,
   Mesh,
   MeshBasicMaterial,
   MeshStandardMaterial,
   MeshStandardMaterialParameters,
   NearestFilter,
   OrthographicCamera,
   Scene,
   Texture,
   Vector3,
   WebGLRenderer,
} from 'three'
import { size } from './math.js'
import { AnimationMeta, BlockModel, BlockSides, Element, Face, idOf, Named } from './models.js'

const FACES = ['east', 'west', 'up', 'down', 'south', 'north'] as const

const DEFAULT_TRANSLATION = [0, 0, 0] as const
const DEFAULT_SCALE = [1, 1, 0] as const
const DEFAULT_ROTATION = [0, 0, 0] as const

const BUILTIN: BlockModel = {
   display: {
      gui: {
         rotation: [-15, -90, 0],
         scale: DEFAULT_SCALE,
         translation: DEFAULT_TRANSLATION,
      },
   },
   elements: [
      {
         from: [0, 0, 0],
         to: [16, 16, 16],
         faces: {
            up: { texture: '#layer0' },
            down: { texture: '#layer0' },
            north: { texture: '#layer0' },
            east: { texture: '#layer0' },
            south: { texture: '#layer0' },
            west: { texture: '#layer0' },
         },
      },
   ],
}

export default class ModelRenderer {
   private readonly size = 512
   private readonly distance = 15

   private readonly scene = new Scene()
   private readonly camera = new OrthographicCamera(
      -this.distance,
      this.distance,
      this.distance,
      -this.distance,
      0.01,
      20000
   )
   private readonly canvas = createCanvas(this.size, this.size)
   private readonly renderer = new WebGLRenderer({
      canvas: this.canvas,
      alpha: true,
      antialias: true,
      logarithmicDepthBuffer: true,
   })

   constructor(private readonly dir: string) {
      this.renderer.sortObjects = false
   }

   private addLight() {
      const ambient = new AmbientLight(0xffffff, 0.8)
      this.scene.add(ambient)

      const directional = new DirectionalLight(0xffffff, 0.4)
      directional.position.set(25, 30, -15)
      this.scene.add(directional)
   }

   getNamespaces() {
      return readdirSync(this.dir).filter(it => statSync(join(this.dir, it)).isDirectory())
   }

   getItems(): Named[] {
      const namespaces = this.getNamespaces()

      return namespaces.flatMap(mod => {
         const dir = join(this.dir, mod, 'models', 'item')
         if (!existsSync(dir)) return []
         const models = readdirSync(dir).filter(it => it.endsWith('.json'))
         return models.map(file => ({ mod, id: parse(file).name }))
      })
   }

   getBlocks(): Named[] {
      const namespaces = this.getNamespaces()

      return namespaces.flatMap(mod => {
         const dir = join(this.dir, mod, 'blockstates')
         if (!existsSync(dir)) return []
         const models = readdirSync(dir).filter(it => it.endsWith('.json'))
         return models.map(file => ({ mod, id: parse(file).name }))
      })
   }

   getBlockModel(block: Named) {
      try {
         return this.getModel(block, 'item')
      } catch {
         return this.getModel(block, 'block')
      }
   }

   async render(block: Named) {
      const model = this.getBlockModel(block)
      try {
         return await this.renderModel(model)
      } catch (e) {
         if (e instanceof Error) throw new Error(`Error rendering ${idOf(block)}: ${e.message}`)
         else throw e
      }
   }

   async renderModel(model: BlockModel) {
      const { elements, display } = model
      const { gui } = display ?? {}
      if (!gui) throw new Error('No gui configuration')
      if (!elements) throw new Error('No elements')

      const scale = gui.scale ?? DEFAULT_SCALE
      this.camera.zoom = Math.sqrt(scale[0] ** 2 + scale[1] ** 2 + scale[2] ** 2)

      this.scene.clear()

      await Promise.all(
         elements.map(async (element, i) => {
            const calculatedSize = size(element.from, element.to)

            const geometry = new BoxGeometry(...calculatedSize, 1, 1, 1)
            const materials = await this.constructBlockMaterial(model, element)
            const cube = new Mesh(geometry, materials as Material[])
            cube.position.set(0, 0, 0)
            cube.position.add(new Vector3(...element.from))
            cube.position.add(new Vector3(...element.to))
            cube.position.multiplyScalar(0.5)
            cube.position.add(new Vector3(-8, -8, -8))

            cube.renderOrder = i

            this.scene.add(cube)
         })
      )

      if (this.shaded(model)) this.addLight()

      const [rotX, rotY, rotZ] = gui.rotation ?? DEFAULT_ROTATION
      const rotation = new Vector3(rotX, rotY, rotZ).add(new Vector3(195, -90, -45))
      this.camera.position.set(
         ...(rotation.toArray().map(it => Math.sin(it * MathUtils.DEG2RAD) * 16) as [number, number, number])
      )
      this.camera.lookAt(0, 0, 0)
      this.camera.position.sub(new Vector3(...(gui.translation ?? DEFAULT_TRANSLATION)))
      this.camera.updateMatrix()
      this.camera.updateProjectionMatrix()

      this.renderer.render(this.scene, this.camera)
      return this.canvas.toBuffer()
   }

   private modelPath({ id, mod }: Named, type: string) {
      const path = id.includes('/') ? id : `${type}/${id}`
      return join(this.dir, mod ?? 'minecraft', 'models', `${path}.json`)
   }

   private keyFrom(key: string): Named {
      if (!key.includes(':')) return { mod: 'minecraft', id: key }
      const [mod, id] = key.split(':')
      return { mod, id }
   }

   getModel(block: Named, type: string): BlockModel {
      const path = this.modelPath(block, type)
      if (!existsSync(path)) throw new Error(`Could not find model for ${idOf(block)}`)
      const raw = readFileSync(path).toString()
      const { parent, ...parsed } = JSON.parse(raw) as BlockModel
      let merged = parsed

      if (parent) {
         if (parent === 'builtin/entity') throw new Error('block has custom entity-renderer')
         if (parent === 'builtin/generated') merged = merge({}, BUILTIN, merged)
         else merged = merge({}, this.getModel(this.keyFrom(parent), type), merged)

         merged.parents = [...(merged.parents ?? []), parent]
      }

      return merged
   }

   async getTexture({ mod, id }: Named) {
      const path = join(this.dir, mod ?? 'minecraft', 'textures', `${id}.png`)
      return readFileSync(path)
   }

   async getMetadata({ mod, id }: Named) {
      const path = join(this.dir, mod ?? 'minecraft', 'textures', `${id}.png.mcmeta`)
      if (!existsSync(path)) return null
      const raw = readFileSync(path).toString()
      return JSON.parse(raw) as AnimationMeta
   }

   private async decodeFace(face: Face, block: BlockModel): Promise<Material | null> {
      const decodedTexture = this.decodeTexture(face.texture, block)
      if (!decodedTexture) return null
      return this.constructTextureMaterial(block, decodedTexture, face)
   }

   private async constructBlockMaterial(block: BlockModel, element: Element): Promise<(Material | null)[]> {
      if (!element?.faces) return []
      const materials = await Promise.all(
         FACES.map(direction => {
            const face = element?.faces?.[direction]
            if (!face) return null
            return this.decodeFace(face, block)
         })
      )
      return materials
   }

   private shaded(block: BlockModel) {
      const root = this.keyFrom('block/block')
      return root.mod === 'minecraft' && block.parents?.[0] === root.id
   }

   private decodeTexture(texture: string, block: BlockModel): string | null {
      if (!texture) return null
      if (!texture.startsWith('#')) return texture

      const correctedTextureName = block.textures?.[texture.substring(1) as BlockSides]
      if (!correctedTextureName) return null

      return this.decodeTexture(correctedTextureName, block)
   }

   private async constructTextureMaterial(block: BlockModel, path: string, face: Face) {
      const image = await loadImage(await this.getTexture(this.keyFrom(path)))
      const animationMeta = await this.getMetadata(this.keyFrom(path))

      const width = image.width
      const height = animationMeta ? width : image.height

      const canvas = rawCanvas.createCanvas(width, height)
      const ctx = canvas.getContext('2d')

      ctx.imageSmoothingEnabled = false

      if (face.rotation) {
         ctx.translate(width / 2, height / 2)
         ctx.rotate(face.rotation * MathUtils.DEG2RAD)
         ctx.translate(-width / 2, -height / 2)
      }

      const uv = (face.uv ?? [0, 0, 16, 16]).map(it => it / 16)

      ctx.drawImage(
         image,
         uv[0] * width,
         uv[1] * height,
         (uv[2] - uv[0]) * width,
         (uv[3] - uv[1]) * height,
         0,
         0,
         width,
         height
      )

      const texture = new Texture(canvas as any)
      texture.magFilter = NearestFilter
      texture.minFilter = NearestFilter
      texture.needsUpdate = true

      const props: MeshStandardMaterialParameters = {
         map: texture,
         //color: 0xffffff,
         transparent: true,
         //roughness: 1,
         //metalness: 0,
         //emissive: 1,
         alphaTest: 0.1,
      }

      if (this.shaded(block)) {
         return new MeshStandardMaterial(props)
      } else {
         return new MeshBasicMaterial(props)
      }
   }
}
