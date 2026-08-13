'use client'

import { useEffect } from 'react'
import { setBlogPreviewMode, useBlogPreviewMode } from './blog-preview-mode'

export function BlogPreviewTabs() {
  const isPreviewing = useBlogPreviewMode()

  useEffect(() => {
    const editor = document.querySelector('.collection-edit--blogs')
    editor?.classList.toggle('blog-editor--previewing', isPreviewing)
    return () => editor?.classList.remove('blog-editor--previewing')
  }, [isPreviewing])

  return (
    <div className="blog-preview-tabs" role="tablist" aria-label="Blog editor mode">
      <button aria-selected={!isPreviewing} className={!isPreviewing ? 'is-active' : ''} onClick={() => setBlogPreviewMode(false)} role="tab" type="button">Edit</button>
      <button aria-selected={isPreviewing} className={isPreviewing ? 'is-active' : ''} onClick={() => setBlogPreviewMode(true)} role="tab" type="button">Preview</button>
    </div>
  )
}
