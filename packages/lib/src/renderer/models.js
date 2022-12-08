"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.idOf = void 0;
function idOf(named) {
    return "".concat(named.mod, ":").concat(named.id);
}
exports.idOf = idOf;
//export interface Renderer {
//   scene: THREE.Scene
//   renderer: THREE.WebGLRenderer
//   canvas: rawCanvas.Canvas
//   camera: THREE.OrthographicCamera
//   textureCache: { [key: string]: any }
//   animatedCache: { [key: string]: AnimationMeta | null }
//   options: RendererOptions
//}
