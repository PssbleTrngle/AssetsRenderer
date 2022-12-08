import { info, setFailed } from '@actions/core'
import run from './main'

run().catch(error => {
   setFailed(error?.toString())
   if (error instanceof Error && error.stack) info(error.stack)
})
