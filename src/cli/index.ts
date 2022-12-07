import { createResolvers } from '@pssbletrngle/pack-resolver'
import chalk from 'chalk'
import render from '../renderer/index.js'
import getOptions from './config.js'

async function run() {
   const options = getOptions()
   const resolvers = createResolvers(options)

   await render(resolvers, options, options)
}

run().catch(async e => {
   console.error(chalk.red(e.message))
})
