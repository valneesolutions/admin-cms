'use client'

import { useEffect } from 'react'
import { setCaseStudyPreviewMode, useCaseStudyPreviewMode } from './case-study-preview-mode'

export function CaseStudyPreviewTabs() {
  const isPreviewing = useCaseStudyPreviewMode()

  useEffect(() => {
    const editor = document.querySelector('.collection-edit--case-studies')
    editor?.classList.toggle('case-study-editor--previewing', isPreviewing)
    return () => editor?.classList.remove('case-study-editor--previewing')
  }, [isPreviewing])

  return (
    <div className="case-study-preview-tabs" role="tablist" aria-label="Case study editor mode">
      <button aria-selected={!isPreviewing} className={!isPreviewing ? 'is-active' : ''} onClick={() => setCaseStudyPreviewMode(false)} role="tab" type="button">Edit</button>
      <button aria-selected={isPreviewing} className={isPreviewing ? 'is-active' : ''} onClick={() => setCaseStudyPreviewMode(true)} role="tab" type="button">Preview</button>
    </div>
  )
}
