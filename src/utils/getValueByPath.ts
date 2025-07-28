export function getValueByPath(obj: any, path: string[]): any {
  return path.reduce((acc, key) => acc?.[key], obj);
}
