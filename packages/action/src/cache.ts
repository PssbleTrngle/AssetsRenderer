import { restoreCache, saveCache } from '@actions/cache'
import { hashFiles } from '@actions/glob'
import { createHash } from 'crypto'
import { ActionInputs } from './input'

function cacheKey({ from, exclude = [], include = [] }: ActionInputs) {
   const resourceHash = hashFiles(from.join('\n'))
   const filter = [...exclude.sort(), ...include.sort()].join('\n')
   const filterHash = exclude ? createHash('sha256').update(filter).digest('hex') : ''
   return {
      key: `renderer-resources-${resourceHash}-${filterHash}`,
      restoreKeys: [`renderer-resources-${resourceHash}-`],
   }
}

export function createCache(inputs: ActionInputs) {
   if (!inputs.cache) return undefined

   const path = '.cache/renderer'

   const restore = async () => {
      const { key, restoreKeys } = cacheKey(inputs)
      await restoreCache([path, inputs.output], key, restoreKeys)
   }

   const save = async () => {
      const { key } = cacheKey(inputs)
      await saveCache([path, inputs.output], key)
   }

   return { save, restore, path }
}
