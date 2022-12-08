import { getBooleanInput, getInput, getMultilineInput } from '@actions/core'
import { RenderOptions } from '@pssbletrngle/assets-renderer'

export interface ActionInputs extends Omit<RenderOptions, 'overwrite' | 'cachedResources'> {
   from: string[]
   output: string
   cache: boolean
   include?: string[]
   exclude?: string[]
}

function optionalMultiline<T>(key: string, defaultValue: T): string[] | T {
   const lines = getMultilineInput(key)
   return lines.length ? lines : defaultValue
}

export default function getInputs(): ActionInputs {
   return {
      from: optionalMultiline('from', ['resources']),
      output: getInput('output', { required: true }),
      cache: getBooleanInput('cache'),
      include: optionalMultiline('include', undefined),
      exclude: optionalMultiline('exclude', undefined),
   }
}
