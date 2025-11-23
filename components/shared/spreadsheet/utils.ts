export const sortData = (data: Record<string, any>[], columnId: string, direction: "asc" | "desc") => {
  return [...data].sort((a, b) => {
    const aVal = a[columnId]
    const bVal = b[columnId]

    if (aVal === bVal) return 0
    if (aVal === null || aVal === undefined) return 1
    if (bVal === null || bVal === undefined) return -1

    const comparison = aVal < bVal ? -1 : 1
    return direction === "asc" ? comparison : -comparison
  })
}