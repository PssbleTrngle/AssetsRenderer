import chalk from 'chalk';
import { renderFrom } from '../renderer/index.js';
import getOptions from './config.js';
async function run() {
    const options = getOptions();
    await renderFrom(options, options, options);
}
run().catch(async (e) => {
    console.error(chalk.red(e.message));
});
//# sourceMappingURL=index.js.map