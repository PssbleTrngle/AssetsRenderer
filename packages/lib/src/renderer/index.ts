import {
   createFilter,
   createMergedResolver,
   createResolver,
   IResolver,
   mergeResolvers,
   Options as ResolverOptions,
} from '@pssbletrngle/pack-resolver'
import { createDefaultMergers, Options as MergerOptions } from '@pssbletrngle/resource-merger'
import chalk from 'chalk'
import { readdirSync } from 'fs'
import { emptyDirSync, ensureDirSync } from 'fs-extra'
import { uniqBy } from 'lodash-es'
import { join, resolve } from 'path'
import { dirSync } from 'tmp'
import { fileURLToPath } from 'url'
import Options from '../cli/options.js'
import ModelRenderer from '../renderer/ModelRenderer.js'
import { idOf, Named } from '../renderer/models.js'

export async function renderUsing(assetsDir: string, to: MergerOptions, options: Options) {
   const renderer = new ModelRenderer(join(assetsDir, 'assets'))

   const filePattern = '$namespace/$path'
   const fileName = (named: Named) => filePattern.replace('$namespace', named.mod).replace('$path', named.id) + '.png'

   interface PromiseSkippedResult<T> {
      status: 'skipped'
      value: T
   }
   type Result<T> = PromiseSettledResult<T> | PromiseSkippedResult<T>
   const results: Result<Named>[] = []

   const output = createDefaultMergers({ ...to, silent: true })
   const all = uniqBy([...renderer.getBlocks(), ...renderer.getItems()], it => `${it.mod}:${it.id}`)
   console.log(`Found ${all.length} total models`)

   const filter = createFilter(options)

   const models = all
      .map(it => ({ ...it, file: fileName(it) }))
      .filter(it => filter(idOf(it)))
      .filter(it => {
         const cached = !options.overwrite && output.exists(it.file)
         if (cached) results.push({ status: 'skipped', value: it })
         return !cached
      })

   const renderResolver: IResolver = {
      extract: async acceptor => {
         for (const block of models)
            try {
               const rendered = await renderer.render(block)
               acceptor(block.file, rendered)
               results.push({ status: 'fulfilled', value: block })
            } catch (e) {
               results.push({ status: 'rejected', reason: (e as Error).message })
            }
      },
   }

   console.log()
   console.group(`Rendering ${models.length} models...`)
   await output.run(renderResolver)

   const fulfilled = results.filter(it => it.status === 'fulfilled')
   const skipped = results.filter(it => it.status === 'skipped')
   const rejected = results.filter(it => it.status === 'rejected') as PromiseRejectedResult[]
   console.log(`🌄 Success: ${chalk.green(fulfilled.length)}`)
   console.log(`🗻 Skipped: ${chalk.yellow(skipped.length)}`)
   console.group(`🌋 Failed:  ${chalk.red(rejected.length)}`)
   if (options.printErrors) rejected.forEach(it => console.log(chalk.red(it.reason)))
   console.groupEnd()

   console.groupEnd()
}

function getTmpDir(options: Options) {
   if (options.cachedResources) {
      ensureDirSync(options.cachedResources)
      return { name: options.cachedResources }
   }
   const { name, removeCallback } = dirSync()
   return {
      name,
      cleanup: () => {
         emptyDirSync(name)
         removeCallback()
      },
   }
}

function createBuiltinResolver(): IResolver {
   const fileName = fileURLToPath(import.meta.url)
   const from = resolve(fileName, '..', '..', '..', 'overwrites')
   return createResolver({ from })
}

export async function renderFrom(from: ResolverOptions['from'], to: MergerOptions, options: Options) {
   const resolvers: IResolver[] = []
   const merged = createMergedResolver({ from, include: ['assets/**'] })

   if (options.includeBuiltinOverrides !== false) {
      resolvers.push(createBuiltinResolver())
      console.log('<built-in overwrites>')
   }
   resolvers.push(merged)
   // TODO fix in PackResolver
   return generateAndRender(mergeResolvers(resolvers, { async: false } as any), to, options)
}

async function generateAndRender(from: IResolver, to: MergerOptions, options: Options) {
   const tmpDir = getTmpDir(options)

   if (options.cachedResources && readdirSync(tmpDir.name).length > 0) {
      console.log('Using cached assets')
      return renderUsing(options.cachedResources, to, options)
   }

   const extractor = createDefaultMergers({ output: tmpDir.name, overwrite: false, silent: true })
   await extractor.run(from)

   await renderUsing(tmpDir.name, to, options)

   tmpDir.cleanup?.()
}
