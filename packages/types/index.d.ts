declare module 'node-canvas-webgl' {
   import type { Image } from 'canvas'

   interface Canvas extends HTMLCanvasElement {
      toBuffer(): Buffer
   }

   export function createCanvas(width: number, height: number): Canvas
   export function loadImage(buffer: Buffer): Promise<Image>
}
