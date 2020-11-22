/* eslint-disable no-param-reassign */
/**
 * Renames a property on a given object by creating a new object with the original
 * value of the key being duplicated to the new object with the new label
 * with the original key and value being deleted from the new object
 * @param obj
 * @param oldKey
 * @param newKey
 */
const renameProperty = (obj: any, oldKey: string, newKey: string): any => {
  if (oldKey !== newKey) {
    Object.defineProperty(obj, newKey,
      Object.getOwnPropertyDescriptor(obj, oldKey) ?? ``)
    delete obj[oldKey]
  }
}

export default renameProperty
