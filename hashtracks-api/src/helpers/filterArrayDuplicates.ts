/**
 * Filters duplicates from an array depending on the name of the key present on an object
 * @param arr
 * @param key
 */
const filterDuplicates = (arr: Array<any>, key: string): Array<any> => arr.reduce((acc, current) => {
  const x = acc.find((item: any) => item[key] === current[key])
  if (!x) {
    return acc.concat([current])
  }
  return acc
}, [])

export default filterDuplicates
