import { useState, useCallback } from "react"
import type { HistoryState } from "../types"

export function useHistory(initialData: Record<string, any>[], initialColumns: any[]) {
  const [history, setHistory] = useState<HistoryState[]>([{ data: initialData, columns: initialColumns }])
  const [historyIndex, setHistoryIndex] = useState(0)

  const saveToHistory = useCallback(
    (newData: Record<string, any>[], newColumns: any[]) => {
      setHistory((prev) => {
        const newHistory = prev.slice(0, historyIndex + 1)
        newHistory.push({ data: newData, columns: newColumns })
        if (newHistory.length > 50) {
          newHistory.shift()
          return newHistory
        }
        return newHistory
      })
      setHistoryIndex((prev) => Math.min(prev + 1, 49))
    },
    [historyIndex],
  )

  const undo = useCallback(() => {
    if (historyIndex > 0) {
      const newIndex = historyIndex - 1
      setHistoryIndex(newIndex)
      return history[newIndex]
    }
    return null
  }, [historyIndex, history])

  const redo = useCallback(() => {
    if (historyIndex < history.length - 1) {
      const newIndex = historyIndex + 1
      setHistoryIndex(newIndex)
      return history[newIndex]
    }
    return null
  }, [historyIndex, history])

  return { saveToHistory, undo, redo, canUndo: historyIndex > 0, canRedo: historyIndex < history.length - 1 }
}