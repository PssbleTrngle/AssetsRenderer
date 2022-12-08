/// <reference types="node" />
import { AnimationMeta, BlockModel, Named } from './models.js'
export default class ModelRenderer {
   private readonly dir
   private size
   private distance
   private scene
   private camera
   private canvas
   private renderer
   constructor(dir: string)
   getNamespaces(): string[]
   getItems(): Named[]
   getBlocks(): Named[]
   getBlockModel(block: Named): BlockModel
   render(block: Named): Promise<Buffer>
   renderModel(model: BlockModel): Promise<Buffer>
   private modelPath
   private keyFrom
   getModel(block: Named, type: string): BlockModel
   getTexture({ mod, id }: Named): Promise<Buffer>
   getMetadata({ mod, id }: Named): Promise<AnimationMeta | null>
   private decodeFace
   private constructBlockMaterial
   private decodeTexture
   private constructTextureMaterial
}
//# sourceMappingURL=ModelRenderer.d.ts.map
