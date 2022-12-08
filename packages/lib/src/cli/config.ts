import { Options as ResolverOptions } from '@pssbletrngle/pack-resolver'
import { Options as MergerOptions } from '@pssbletrngle/resource-merger'
import arg from 'arg'
import commandLineUsage, { Section } from 'command-line-usage'
import { existsSync, readFileSync } from 'fs'
import Options from './options.js'

const sections: Section[] = [
   {
      header: 'Resource Merger',
      content: 'Merge multiple resource & datapack into single archive files',
   },
   {
      header: 'Options',
      optionList: [
         {
            name: 'config',
            alias: 'c',
            defaultValue: '.renderrc',
            typeLabel: '{underline file}',
            description: 'The to read additional options from',
         },
         {
            name: 'from',
            defaultValue: './resources',
            typeLabel: '{underline directory}',
            description: 'The folder to look in for resourcepacks',
         },
         {
            name: 'output',
            defaultValue: 'merged.zip',
            typeLabel: '{underline file}',
            description: 'The path of the output archive file',
         },
         {
            name: 'overwrite',
            defaultValue: false,
            type: Boolean,
            description: 'Wether or not overwrite already existing renders',
         },
         {
            name: 'keep',
            defaultValue: 'opposite of the {italic overwrite} value',
            type: Boolean,
            description: 'Do not empty the output directory at start',
         },
         {
            name: 'cached-resources',
            typeLabel: '{underline directory}',
            description: 'Locations of the cached resources',
         },
         {
            name: 'include',
            multiple: true,
            typeLabel: '{underline string} ...',
            description: 'Include patterns. If specified, excludes are ignored (ex: minecraft:acacia_*)',
         },
         {
            name: 'include',
            multiple: true,
            typeLabel: '{underline string} ...',
            description: 'Exclude patterns. Are ignored if --include is used  (ex: *:stone_*)',
         },
         {
            name: 'help',
            alias: 'h',
            type: Boolean,
            description: 'Print this usage guide.',
         },
      ],
   },
]

export interface CliOptions extends Options, MergerOptions, ResolverOptions {}

export function readConfig(configFile?: string) {
   const file = configFile ?? '.renderrc'
   if (existsSync(file)) {
      const buffer = readFileSync(file)
      return JSON.parse(buffer.toString()) as Partial<CliOptions>
   }
   return null
}

export default function getOptions(configFile?: string): CliOptions {
   const args = arg({
      '--include': [String],
      '--exclude': [String],
      '--config': String,
      '--overwrite': Boolean,
      '--keep': Boolean,
      '--from': String,
      '--output': String,
      '-c': '--config',
      '--print-errors': Boolean,
      '--help': Boolean,
      '--cached-resources': String,
      '-h': '--help',
   })

   if (args['--help']) {
      const usage = commandLineUsage(sections)
      console.log(usage)
      process.exit(0)
   }

   const config = readConfig(configFile ?? args['--config'])
   const output = args['--output'] ?? config?.output ?? 'merged.zip'

   const overwrite = args['--overwrite'] ?? config?.overwrite

   return {
      from: args['--from'] ?? config?.from ?? 'resources',
      include: args['--include'] ?? config?.include,
      exclude: args['--exclude'] ?? config?.exclude,
      overwrite,
      keep: args['--keep'] ?? config?.keep ?? !overwrite,
      cachedResources: args['--cached-resources'] ?? config?.cachedResources,
      printErrors: args['--print-errors'] ?? config?.printErrors,
      output,
   }
}
