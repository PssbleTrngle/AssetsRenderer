import { RenderOptions } from '@pssbletrngle/assets-renderer';
export interface ActionInputs extends Omit<RenderOptions, 'overwrite' | 'cachedResources'> {
    from: string[];
    output: string;
    cache: boolean;
    include?: string[];
    exclude?: string[];
}
export default function getInputs(): ActionInputs;
