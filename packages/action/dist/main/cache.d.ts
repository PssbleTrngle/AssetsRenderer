import { ActionInputs } from './input';
export declare function createCache({ cache, from }: ActionInputs): {
    save: () => Promise<void>;
    restore: () => Promise<void>;
    paths: {
        resources: string;
        icons: string;
    };
} | undefined;
