import rawCanvas from 'canvas';
import { existsSync, readdirSync, readFileSync, statSync } from 'fs';
import { merge } from 'lodash-es';
import { createCanvas, loadImage } from 'node-canvas-webgl';
import { join, parse } from 'path';
import { BoxGeometry, DirectionalLight, MathUtils, Mesh, MeshBasicMaterial, NearestFilter, OrthographicCamera, Scene, Texture, Vector3, WebGLRenderer, } from 'three';
import { size } from './math.js';
import { idOf } from './models.js';
const FACES = ['east', 'west', 'up', 'down', 'south', 'north'];
const BUILTIN = {
    display: {
        gui: {
            rotation: [-15, -90, 0],
            scale: [0.625, 0.625, 0.625],
            translation: [0, 0, 0],
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
};
export default class ModelRenderer {
    constructor(dir) {
        this.dir = dir;
        this.size = 512;
        this.distance = 15;
        this.scene = new Scene();
        this.camera = new OrthographicCamera(-this.distance, this.distance, this.distance, -this.distance, 0.01, 20000);
        this.canvas = createCanvas(this.size, this.size);
        this.renderer = new WebGLRenderer({
            canvas: this.canvas,
            alpha: true,
            antialias: true,
            logarithmicDepthBuffer: true,
        });
        const light = new DirectionalLight(0xffffff, 1.2);
        light.position.set(-15, 30, -25);
        this.scene.add(light);
        this.renderer.sortObjects = false;
    }
    getNamespaces() {
        return readdirSync(this.dir).filter(it => statSync(join(this.dir, it)).isDirectory());
    }
    getItems() {
        const namespaces = this.getNamespaces();
        return namespaces.flatMap(mod => {
            const dir = join(this.dir, mod, 'models', 'item');
            if (!existsSync(dir))
                return [];
            const models = readdirSync(dir).filter(it => it.endsWith('.json'));
            return models.map(file => ({ mod, id: parse(file).name }));
        });
    }
    getBlocks() {
        const namespaces = this.getNamespaces();
        return namespaces.flatMap(mod => {
            const dir = join(this.dir, mod, 'blockstates');
            if (!existsSync(dir))
                return [];
            const models = readdirSync(dir).filter(it => it.endsWith('.json'));
            return models.map(file => ({ mod, id: parse(file).name }));
        });
    }
    getBlockModel(block) {
        try {
            return this.getModel(block, 'item');
        }
        catch (_a) {
            return this.getModel(block, 'block');
        }
    }
    async render(block) {
        const model = this.getBlockModel(block);
        try {
            return await this.renderModel(model);
        }
        catch (e) {
            if (e instanceof Error)
                throw new Error(`Error rendering ${idOf(block)}: ${e.message}`);
            else
                throw e;
        }
    }
    async renderModel(model) {
        const { elements, display } = model;
        const { gui } = display !== null && display !== void 0 ? display : {};
        if (!gui)
            throw new Error('No gui configuration');
        if (!elements)
            throw new Error('No elements');
        this.camera.zoom = 1 / Math.sqrt(gui.scale[0] ** 2 + gui.scale[1] ** 2 + gui.scale[2] ** 2);
        this.scene.clear();
        await Promise.all(elements.map(async (element, i) => {
            const calculatedSize = size(element.from, element.to);
            const geometry = new BoxGeometry(...calculatedSize, 1, 1, 1);
            const materials = await this.constructBlockMaterial(model, element);
            const cube = new Mesh(geometry, materials);
            cube.position.set(0, 0, 0);
            cube.position.add(new Vector3(...element.from));
            cube.position.add(new Vector3(...element.to));
            cube.position.multiplyScalar(0.5);
            cube.position.add(new Vector3(-8, -8, -8));
            cube.renderOrder = i;
            this.scene.add(cube);
        }));
        const rotation = new Vector3(...gui.rotation).add(new Vector3(195, -90, -45));
        this.camera.position.set(...rotation.toArray().map(x => Math.sin(x * MathUtils.DEG2RAD) * 16));
        this.camera.lookAt(0, 0, 0);
        this.camera.position.add(new Vector3(...gui.translation));
        this.camera.updateMatrix();
        this.camera.updateProjectionMatrix();
        this.renderer.render(this.scene, this.camera);
        return this.canvas.toBuffer();
    }
    modelPath({ id, mod }, type) {
        const path = id.includes('/') ? id : `${type}/${id}`;
        return join(this.dir, mod !== null && mod !== void 0 ? mod : 'minecraft', 'models', `${path}.json`);
    }
    keyFrom(key) {
        if (!key.includes(':'))
            return { mod: 'minecraft', id: key };
        const [mod, id] = key.split(':');
        return { mod, id };
    }
    getModel(block, type) {
        const path = this.modelPath(block, type);
        if (!existsSync(path))
            throw new Error(`Could not find model for ${idOf(block)}`);
        const raw = readFileSync(path).toString();
        const parsed = JSON.parse(raw);
        if (parsed.parent) {
            if (parsed.parent.includes('builtin'))
                merge(parsed, BUILTIN);
            else
                merge(parsed, this.getModel(this.keyFrom(parsed.parent), type));
        }
        return parsed;
    }
    async getTexture({ mod, id }) {
        const path = join(this.dir, mod !== null && mod !== void 0 ? mod : 'minecraft', 'textures', `${id}.png`);
        return readFileSync(path);
    }
    async getMetadata({ mod, id }) {
        const path = join(this.dir, mod !== null && mod !== void 0 ? mod : 'minecraft', 'textures', `${id}.png.mcmeta`);
        if (!existsSync(path))
            return null;
        const raw = readFileSync(path).toString();
        return JSON.parse(raw);
    }
    async decodeFace(face, block) {
        const decodedTexture = this.decodeTexture(face.texture, block);
        if (!decodedTexture)
            return null;
        return this.constructTextureMaterial(block, decodedTexture, face);
    }
    async constructBlockMaterial(block, element) {
        if (!(element === null || element === void 0 ? void 0 : element.faces))
            return [];
        const materials = await Promise.all(FACES.map(direction => {
            var _a;
            const face = (_a = element === null || element === void 0 ? void 0 : element.faces) === null || _a === void 0 ? void 0 : _a[direction];
            if (!face)
                return null;
            return this.decodeFace(face, block);
        }));
        return materials;
    }
    decodeTexture(texture, block) {
        var _a;
        if (!texture)
            return null;
        if (!texture.startsWith('#'))
            return texture;
        const correctedTextureName = (_a = block.textures) === null || _a === void 0 ? void 0 : _a[texture.substring(1)];
        if (!correctedTextureName)
            return null;
        return this.decodeTexture(correctedTextureName, block);
    }
    async constructTextureMaterial(block, path, face) {
        var _a;
        const image = await loadImage(await this.getTexture(this.keyFrom(path)));
        const animationMeta = await this.getMetadata(this.keyFrom(path));
        const width = image.width;
        const height = animationMeta ? width : image.height;
        const canvas = rawCanvas.createCanvas(width, height);
        const ctx = canvas.getContext('2d');
        ctx.imageSmoothingEnabled = false;
        if (face.rotation) {
            ctx.translate(width / 2, height / 2);
            ctx.rotate(face.rotation * MathUtils.DEG2RAD);
            ctx.translate(-width / 2, -height / 2);
        }
        const uv = (_a = face.uv) !== null && _a !== void 0 ? _a : [0, 0, width, height];
        ctx.drawImage(image, uv[0], uv[1], uv[2] - uv[0], uv[3] - uv[1], 0, 0, width, height);
        const texture = new Texture(canvas);
        texture.magFilter = NearestFilter;
        texture.minFilter = NearestFilter;
        texture.needsUpdate = true;
        return new MeshBasicMaterial({
            map: texture,
            //color: 0xffffff,
            transparent: true,
            //roughness: 1,
            //metalness: 0,
            //emissive: 1,
            alphaTest: 0.1,
        });
    }
}
//# sourceMappingURL=ModelRenderer.js.map