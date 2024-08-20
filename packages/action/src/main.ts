import { renderFrom } from '@pssbletrngle/assets-renderer'
import { FolderResolver } from '@pssbletrngle/pack-resolver'
import { createDefaultMergers } from '@pssbletrngle/resource-merger'
import { createCache } from './cache'
import getInputs from './input'

export default async function run() {
   const inputs = getInputs()
   const { from, output, exclude, include } = inputs

   const cache = createCache(inputs)
   await cache?.restore()

   await renderFrom(
      from,
      { keep: true, output: cache?.paths.icons ?? output },
      { cachedResources: cache?.paths.resources, overwrite: false, exclude, include },
   )

   if (cache) {
      const cachedIcons = new FolderResolver(cache.paths.icons, inputs)
      const mover = createDefaultMergers({ silent: true, output })
      await mover.run(cachedIcons)
   }
}
