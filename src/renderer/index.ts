import { ResolverInfo } from '@pssbletrngle/pack-resolver'
import { createDefaultMergers, Options as MergerOptions } from '@pssbletrngle/resource-merger'
import { existsSync } from 'fs'
import { emptyDirSync } from 'fs-extra'
import match from 'minimatch'
import { join } from 'path'
import { dirSync } from 'tmp'
import Options from '../cli/options.js'
import ModelRenderer from '../renderer/ModelRenderer.js'
import { idOf, Named } from '../renderer/models.js'

export default async function render(from: ResolverInfo[], to: MergerOptions, options: Options) {
   const tmpDir = dirSync()

   const extractor = createDefaultMergers({ includeAssets: true, output: tmpDir.name })
   await extractor.run(from)

   const renderer = new ModelRenderer(join(tmpDir.name, 'assets'))

   const filePattern = 'assets/$namespace/$path'
   const fileName = (named: Named) => filePattern.replace('$namespace', named.mod).replace('$path', named.id) + '.png'
   const exists = (named: Named) => to.output && existsSync(join(to.output, fileName(named)))

   interface PromiseSkippedResult<T> {
      status: 'skipped'
      value: T
   }
   type Result<T> = PromiseSettledResult<T> | PromiseSkippedResult<T>
   const results: Result<Named>[] = []

   const output = createDefaultMergers({ ...to, includeAssets: true })
   const all = renderer.getBlocks()
   const models = all
      .filter(it => {
         if (options.include?.length) return options.include.some(pattern => match(idOf(it), pattern))
         return !options.exclude?.some(pattern => match(idOf(it), pattern))
      })
      .filter(it => {
         const cached = !options.overwrite && exists(it)
         if (cached) results.push({ status: 'skipped', value: it })
         return !cached
      })

   const renderResolver: ResolverInfo = {
      name: 'renderer',
      resolver: {
         extract: async acceptor => {
            for (let block of models)
               try {
                  const rendered = await renderer.render(block)
                  acceptor(fileName(block), rendered)
                  results.push({ status: 'fulfilled', value: block })
               } catch (e) {
                  results.push({ status: 'rejected', reason: (e as Error).message })
               }
         },
      },
   }

   console.log()
   console.group(`Rendering ${models.length} models`)
   await output.run([renderResolver])

   const fulfilled = results.filter(it => it.status === 'fulfilled')
   const skipped = results.filter(it => it.status === 'skipped')
   const rejected = results.filter(it => it.status === 'rejected')
   console.log(`🌄 Success: ${fulfilled.length}`)
   console.log(`🗻 Skipped: ${skipped.length}`)
   console.log(`🌋 Error:   ${rejected.length}`)

   console.groupEnd()

   emptyDirSync(tmpDir.name)
   tmpDir.removeCallback()
}
