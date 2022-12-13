import { restoreCache, saveCache } from '@actions/cache'
import { hashFiles } from '@actions/glob'
import { join } from 'path'
import { ActionInputs } from './input'

export function createCache({ cache, from }: ActionInputs) {
   if (!cache) return undefined

   const path = '.cache/renderer'

   const resourceHash = hashFiles(from.join('\n'))
   const resourceKey = `renderer-resources-${resourceHash}`

   const restore = async () => {
      await restoreCache([path], resourceKey)
   }

   const save = async () => {
      await saveCache([path], resourceKey)
   }

   const paths = {
      resources: join(path, 'resources'),
      icons: join(path, 'icons'),
   }

   return { save, restore, paths }
}
