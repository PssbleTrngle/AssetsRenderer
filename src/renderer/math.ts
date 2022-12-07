export type Vector = readonly [number, number, number]
export type Vector4 = readonly [number, number, number, number]

export function size(from: Vector, to: Vector) {
   return [to[0] - from[0], to[1] - from[1], to[2] - from[2]] as Vector
}
