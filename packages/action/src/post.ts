import { info, setFailed } from '@actions/core'
import { createCache } from './cache'
import getInputs from './input'

export default async function run() {
   const inputs = getInputs()
   const cache = createCache(inputs)
   await cache?.save()
}

run().catch(error => {
   setFailed(error?.toString())
   if (error instanceof Error && error.stack) info(error.stack)
})
