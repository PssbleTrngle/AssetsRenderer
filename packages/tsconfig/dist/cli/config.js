import arg from 'arg';
import commandLineUsage from 'command-line-usage';
import { existsSync, readFileSync } from 'fs';
const sections = [
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
];
export function readConfig(configFile) {
    const file = configFile !== null && configFile !== void 0 ? configFile : '.renderrc';
    if (existsSync(file)) {
        const buffer = readFileSync(file);
        return JSON.parse(buffer.toString());
    }
    return null;
}
export default function getOptions(configFile) {
    var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l;
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
    });
    if (args['--help']) {
        const usage = commandLineUsage(sections);
        console.log(usage);
        process.exit(0);
    }
    const config = readConfig(configFile !== null && configFile !== void 0 ? configFile : args['--config']);
    const output = (_b = (_a = args['--output']) !== null && _a !== void 0 ? _a : config === null || config === void 0 ? void 0 : config.output) !== null && _b !== void 0 ? _b : 'merged.zip';
    const overwrite = (_c = args['--overwrite']) !== null && _c !== void 0 ? _c : config === null || config === void 0 ? void 0 : config.overwrite;
    return {
        from: (_e = (_d = args['--from']) !== null && _d !== void 0 ? _d : config === null || config === void 0 ? void 0 : config.from) !== null && _e !== void 0 ? _e : 'resources',
        include: (_f = args['--include']) !== null && _f !== void 0 ? _f : config === null || config === void 0 ? void 0 : config.include,
        exclude: (_g = args['--exclude']) !== null && _g !== void 0 ? _g : config === null || config === void 0 ? void 0 : config.exclude,
        overwrite,
        keep: (_j = (_h = args['--keep']) !== null && _h !== void 0 ? _h : config === null || config === void 0 ? void 0 : config.keep) !== null && _j !== void 0 ? _j : !overwrite,
        cachedResources: (_k = args['--cached-resources']) !== null && _k !== void 0 ? _k : config === null || config === void 0 ? void 0 : config.cachedResources,
        printErrors: (_l = args['--print-errors']) !== null && _l !== void 0 ? _l : config === null || config === void 0 ? void 0 : config.printErrors,
        output,
    };
}
//# sourceMappingURL=config.js.map