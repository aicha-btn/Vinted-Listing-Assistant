export const capitalize = (value: string) =>
  value ? value.charAt(0).toUpperCase() + value.slice(1) : value

export const compactText = (value: string) => value.replace(/\s+/g, ' ').trim()

export const dedupeList = (items: string[], maxItems?: number) => {
  const uniqueItems = Array.from(new Set(items))

  return typeof maxItems === 'number'
    ? uniqueItems.slice(0, maxItems)
    : uniqueItems
}
