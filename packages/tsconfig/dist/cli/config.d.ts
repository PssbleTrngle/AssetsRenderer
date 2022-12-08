import { Options as ResolverOptions } from '@pssbletrngle/pack-resolver'
import { Options as MergerOptions } from '@pssbletrngle/resource-merger'
import Options from './options.js'
export interface CliOptions extends Options, MergerOptions, ResolverOptions {}
export declare function readConfig(configFile?: string): Partial<CliOptions> | null
export default function getOptions(configFile?: string): CliOptions
//# sourceMappingURL=config.d.ts.map
