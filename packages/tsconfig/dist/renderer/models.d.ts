import { Vector, Vector4 } from './math.js'
export interface Named {
   mod: string
   id: string
}
export declare function idOf(named: Named): string
export interface Transform {
   rotation: Vector
   translation: Vector
   scale: Vector
}
export interface Rotation {
   angle?: number
   axis?: string
   origin?: Vector
}
export type BlockFaces = 'north' | 'south' | 'east' | 'west' | 'up' | 'down'
export type BlockSides =
   | 'all'
   | 'top'
   | 'bottom'
   | 'side'
   | 'front'
   | 'particle'
   | 'pane'
   | 'wood'
   | 'back'
   | BlockFaces
export interface BlockModel {
   blockName?: string
   parents?: string[]
   animationMaxTicks?: number
   animationCurrentTick?: number
   parent?: string
   textures?: Record<string, string>
   gui_light?: 'front' | 'side'
   display?: {
      gui?: Transform
      ground?: Transform
      fixed?: Transform
      thirdperson_righthand?: Transform
      firstperson_righthand?: Transform
      firstperson_lefthand?: Transform
   }
   elements?: Element[]
}
export interface Element {
   from: Vector
   to: Vector
   rotation?: Rotation
   faces?: {
      [key in BlockFaces]?: Face
   }
}
export interface Face {
   uv?: Vector4
   texture: string
   rotation?: number
   cullface?: string
}
export type AnimationMeta = {
   interpolate?: boolean
   width?: number
   height?: number
   frametime?: number
   frames?: (
      | number
      | {
           index: number
           time: number
        }
   )[]
}
//# sourceMappingURL=models.d.ts.map
