declare module 'node-canvas-webgl' {
   interface Canvas extends HTMLCanvasElement {
      toBuffer(): Buffer
   }

   interface Image {
      width: number
      height: number
   }

   export function createCanvas(width: number, height: number): Canvas
   export function loadImage(buffer: Buffer): Promise<Image>
}
