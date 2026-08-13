'use client'

import { useSyncExternalStore } from 'react'

let previewMode = false
const listeners = new Set<() => void>()

function subscribe(listener: () => void) {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

function getSnapshot() {
  return previewMode
}

export function setBlogPreviewMode(nextValue: boolean) {
  previewMode = nextValue
  listeners.forEach((listener) => listener())
}

export function useBlogPreviewMode() {
  return useSyncExternalStore(subscribe, getSnapshot, () => false)
}
