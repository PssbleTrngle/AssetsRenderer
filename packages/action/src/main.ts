import { renderFrom } from '@pssbletrngle/assets-renderer'
import { createCache } from './cache'
import getInputs from './input'

export default async function run() {
   const inputs = getInputs()
   const { from, output, exclude, include } = inputs

   const cache = createCache(inputs)
   await cache?.restore()

   await renderFrom(
      { from },
      { overwrite: true, keep: true, output },
      { cachedResources: cache?.path, overwrite: false, exclude, include }
   )
}
