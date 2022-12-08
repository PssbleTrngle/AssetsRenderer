import { ActionInputs } from './input';
export declare function createCache(inputs: ActionInputs): {
    save: () => Promise<void>;
    restore: () => Promise<void>;
    path: string;
} | undefined;
