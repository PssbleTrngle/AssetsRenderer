import { createFilter, createResolver } from '@pssbletrngle/pack-resolver';
import { createDefaultMergers } from '@pssbletrngle/resource-merger';
import chalk from 'chalk';
import { readdirSync } from 'fs';
import { emptyDirSync, ensureDirSync } from 'fs-extra';
import { join } from 'path';
import { dirSync } from 'tmp';
import ModelRenderer from '../renderer/ModelRenderer.js';
import { idOf } from '../renderer/models.js';
export async function renderUsing(assetsDir, to, options) {
    const renderer = new ModelRenderer(join(assetsDir, 'assets'));
    const filePattern = '$namespace/$path';
    const fileName = (named) => filePattern.replace('$namespace', named.mod).replace('$path', named.id) + '.png';
    const results = [];
    const output = createDefaultMergers({ ...to, silent: true });
    const all = renderer.getBlocks();
    console.log(`Found ${all.length} total models`);
    const filter = createFilter(options);
    const models = all
        .map(it => ({ ...it, file: fileName(it) }))
        .filter(it => filter(idOf(it)))
        .filter(it => {
        const cached = !options.overwrite && output.exists(it.file);
        if (cached)
            results.push({ status: 'skipped', value: it });
        return !cached;
    });
    const renderResolver = {
        extract: async (acceptor) => {
            for (const block of models)
                try {
                    const rendered = await renderer.render(block);
                    acceptor(block.file, rendered);
                    results.push({ status: 'fulfilled', value: block });
                }
                catch (e) {
                    results.push({ status: 'rejected', reason: e.message });
                }
        },
    };
    console.log();
    console.group(`Rendering ${models.length} models...`);
    await output.run(renderResolver);
    const fulfilled = results.filter(it => it.status === 'fulfilled');
    const skipped = results.filter(it => it.status === 'skipped');
    const rejected = results.filter(it => it.status === 'rejected');
    console.log(`🌄 Success: ${chalk.green(fulfilled.length)}`);
    console.log(`🗻 Skipped: ${chalk.yellow(skipped.length)}`);
    console.group(`🌋 Failed:  ${chalk.red(rejected.length)}`);
    if (options.printErrors)
        rejected.forEach(it => console.log(chalk.red(it.reason)));
    console.groupEnd();
    console.groupEnd();
}
function getTmpDir(options) {
    if (options.cachedResources) {
        ensureDirSync(options.cachedResources);
        return { name: options.cachedResources };
    }
    const { name, removeCallback } = dirSync();
    return {
        name,
        cleanup: () => {
            emptyDirSync(name);
            removeCallback();
        },
    };
}
export async function renderFrom(from, to, options) {
    const resolver = createResolver({ ...from, include: ['assets/**'] });
    return generateAndRender(resolver, to, options);
}
async function generateAndRender(from, to, options) {
    var _a;
    const tmpDir = getTmpDir(options);
    if (options.cachedResources && readdirSync(tmpDir.name).length > 0) {
        console.log('Using cached assets');
        return renderUsing(options.cachedResources, options, options);
    }
    const extractor = createDefaultMergers({ output: tmpDir.name, overwrite: false, silent: true });
    await extractor.run(from);
    await renderUsing(tmpDir.name, to, options);
    (_a = tmpDir.cleanup) === null || _a === void 0 ? void 0 : _a.call(tmpDir);
}
//# sourceMappingURL=index.js.map