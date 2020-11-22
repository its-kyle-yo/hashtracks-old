// Modules
import util from 'util'

/**
 * Console logs an object and all nested content in its entirety
 * @param obj - Any object
 * @param label - A descriptive signal to see in the console
 */
const deepLogObject = (obj: any, label?: string) => {
  console.group()
  console.warn(`[ 🛠️  ] ${label ?? `Logged Object`}:`)
  console.warn(util.inspect(obj, false, null, true /* Enables Color */))
  console.groupEnd()
}

export default deepLogObject
