'use client'

import { useField } from '@payloadcms/ui'
import { createPortal } from 'react-dom'
import { useEffect, useState } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { useBlogPreviewMode } from './blog-preview-mode'

function useStringField(path: string): string {
  const { value } = useField<string>({ path })
  return typeof value === 'string' ? value : ''
}

export function BlogLiveMarkdownPreview() {
  const [host, setHost] = useState<HTMLElement | null>(null)
  const isPreviewing = useBlogPreviewMode()
  const title = useStringField('title')
  const summary = useStringField('summary')
  const content = useStringField('content')

  useEffect(() => {
    setHost(document.querySelector<HTMLElement>('.collection-edit--blogs .collection-edit__main'))
  }, [])

  if (!isPreviewing || !host) return null

  return createPortal(
    <main className="blog-document-preview">
      <article className="blog-document-preview__article">
        <header className="blog-document-preview__header">
          <span>Blog preview</span>
          <h1>{title || 'Untitled article'}</h1>
          {summary && <p>{summary}</p>}
        </header>
        <div className="blog-document-preview__body">
          {content ? <ReactMarkdown remarkPlugins={[remarkGfm]}>{content}</ReactMarkdown> : <p className="blog-document-preview__empty">This article has no content yet.</p>}
        </div>
      </article>
    </main>,
    host,
  )
}
