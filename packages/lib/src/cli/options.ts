import { FilterOptions } from '@pssbletrngle/pack-resolver'

export default interface Options extends FilterOptions {
   overwrite?: boolean
   cachedResources?: string
   printErrors?: boolean
   includeBuiltinOverrides?: boolean
}
