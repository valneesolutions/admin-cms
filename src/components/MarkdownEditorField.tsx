'use client'

import { Button, TextareaInput, toast, useField, useListDrawer } from '@payloadcms/ui'
import React, { useCallback, useEffect, useRef, useState } from 'react'
import type { ChangeEvent, KeyboardEvent, MouseEvent as ReactMouseEvent } from 'react'
import type { TextFieldClientProps } from 'payload'

import { getMediaImageMarkdown } from '@/lib/media-url.ts'

type MediaDoc = {
    alt?: string
    filename?: string
    url?: string
}

type CaretPosition = { top: number; left: number }

const LAYOUT_PROPS = [
    'boxSizing',
    'fontFamily',
    'fontSize',
    'fontWeight',
    'fontStyle',
    'letterSpacing',
    'lineHeight',
    'tabSize',
    'textIndent',
    'textTransform',
    'whiteSpace',
    'wordBreak',
    'overflowWrap',
    'wordSpacing',
    'padding',
    'borderWidth',
    'borderStyle',
] as const

/**
 * Measures the caret's viewport position inside a textarea using a mirror
 * element, so the insert popup can be placed right at the text cursor.
 */
function getCaretPosition(textarea: HTMLTextAreaElement): CaretPosition {
    const style = getComputedStyle(textarea)
    const mirror = document.createElement('div')
    for (const prop of LAYOUT_PROPS) {
        mirror.style[prop] = style[prop]
    }
    mirror.style.position = 'fixed'
    mirror.style.top = '-9999px'
    mirror.style.left = '0'
    mirror.style.width = style.width
    mirror.style.overflow = 'hidden'
    mirror.style.visibility = 'hidden'

    const caret = textarea.selectionStart ?? 0
    mirror.textContent = textarea.value.slice(0, caret)
    const marker = document.createElement('span')
    marker.textContent = textarea.value.slice(caret) || '.'
    mirror.appendChild(marker)
    document.body.appendChild(mirror)

    const mirrorRect = mirror.getBoundingClientRect()
    const markerRect = marker.getBoundingClientRect()
    const textareaRect = textarea.getBoundingClientRect()
    document.body.removeChild(mirror)

    return {
        top: textareaRect.top + (markerRect.top - mirrorRect.top) - textarea.scrollTop,
        left: textareaRect.left + (markerRect.left - mirrorRect.left) - textarea.scrollLeft,
    }
}

const insertInto = (source: string, snippet: string, start: number, end: number) => {
    const safeStart = Math.min(Math.max(start, 0), source.length)
    const safeEnd = Math.min(Math.max(end, safeStart), source.length)
    return source.slice(0, safeStart) + snippet + source.slice(safeEnd)
}

export const MarkdownEditorField: React.FC<TextFieldClientProps> = (props) => {
    const { field, path } = props
    const {
        disabled,
        setValue,
        showError,
        value,
    } = useField<string>({ path: path ?? field.name })

    const wrapperRef = useRef<HTMLDivElement>(null)
    const popupRef = useRef<HTMLDivElement>(null)
    const fileInputRef = useRef<HTMLInputElement>(null)
    const [uploading, setUploading] = useState(false)
    const [popup, setPopup] = useState<CaretPosition | null>(null)

    const [ListDrawer, , { openDrawer }] = useListDrawer({
        collectionSlugs: ['media'],
    })

    const admin = field.admin as
        | { rows?: number; placeholder?: string; className?: string; description?: string }
        | undefined

    const openPopup = useCallback(() => {
        const textarea = wrapperRef.current?.querySelector('textarea')
        if (!textarea) return
        const { top, left } = getCaretPosition(textarea)
        const lineHeight = parseFloat(getComputedStyle(textarea).lineHeight) || 22
        setPopup({
            top: Math.min(top + lineHeight + 6, window.innerHeight - 60),
            left: Math.max(8, Math.min(left, window.innerWidth - 280)),
        })
    }, [])

    // Close the popup when clicking anywhere outside of it.
    useEffect(() => {
        if (!popup) return
        const onDocMouseDown = (event: globalThis.MouseEvent) => {
            if (popupRef.current && !popupRef.current.contains(event.target as Node)) {
                setPopup(null)
            }
        }
        document.addEventListener('mousedown', onDocMouseDown)
        return () => document.removeEventListener('mousedown', onDocMouseDown)
    }, [popup])

    // Keep the popup anchored to the caret while the textarea scrolls.
    useEffect(() => {
        if (!popup) return
        const textarea = wrapperRef.current?.querySelector('textarea')
        if (!textarea) return
        const onScroll = () => openPopup()
        textarea.addEventListener('scroll', onScroll)
        return () => textarea.removeEventListener('scroll', onScroll)
    }, [popup, openPopup])

    const closePopup = useCallback(() => setPopup(null), [])

    const onKeyDown = useCallback(
        (event: KeyboardEvent<HTMLDivElement>) => {
            const isInsertShortcut =
                (event.ctrlKey || event.metaKey) &&
                !event.shiftKey &&
                !event.altKey &&
                event.key.toLowerCase() === 'm'
            if (isInsertShortcut) {
                event.preventDefault()
                if (popup) {
                    closePopup()
                } else {
                    openPopup()
                }
                return
            }
            if (event.key === 'Escape' && popup) {
                event.preventDefault()
                closePopup()
            }
        },
        [closePopup, openPopup, popup],
    )

    // Let clicks inside the popup keep the textarea caret (and its position) intact.
    const preserveCaret = useCallback((event: ReactMouseEvent<HTMLDivElement>) => {
        event.preventDefault()
    }, [])

    const insertAtCursor = useCallback(
        (snippet: string) => {
            const textarea = wrapperRef.current?.querySelector('textarea')
            const current = value ?? ''
            const start = textarea?.selectionStart ?? current.length
            const end = textarea?.selectionEnd ?? start
            const next = insertInto(current, snippet, start, end)
            setValue(next)
            const caret = start + snippet.length
            requestAnimationFrame(() => {
                if (!textarea) return
                textarea.focus()
                textarea.setSelectionRange(caret, caret)
            })
        },
        [setValue, value],
    )

    const handleSelect = useCallback(
        ({ doc }: { doc: Record<string, unknown> }) => {
            closePopup()
            insertAtCursor(getMediaImageMarkdown(doc as MediaDoc))
            toast.success(`Inserted ${String((doc as MediaDoc).filename ?? 'image')}`)
        },
        [closePopup, insertAtCursor],
    )

    const handleUpload = useCallback(
        async (event: ChangeEvent<HTMLInputElement>) => {
            const files = Array.from(event.target.files ?? [])
            event.target.value = ''
            if (!files.length) return

            const textarea = wrapperRef.current?.querySelector('textarea')
            const current = value ?? ''
            const start = textarea?.selectionStart ?? current.length
            const end = textarea?.selectionEnd ?? start

            setUploading(true)
            closePopup()
            let result = current
            let offset = start
            try {
                for (const file of files) {
                    const formData = new FormData()
                    formData.append('file', file)
                    // Payload REST expects non-file fields as a JSON string in `_payload`
                    formData.append(
                        '_payload',
                        JSON.stringify({
                            alt: file.name.replace(/\.[^.]+$/, '').replace(/[-_]+/g, ' '),
                        }),
                    )

                    const res = await fetch('/api/media', {
                        method: 'POST',
                        body: formData,
                        credentials: 'same-origin',
                    })

                    if (!res.ok) {
                        const err = await res.json().catch(() => null)
                        const message =
                            err?.errors?.[0]?.message || err?.message || res.statusText
                        toast.error(`Upload failed for ${file.name}: ${message}`)
                        continue
                    }

                    const { doc } = (await res.json()) as { doc: MediaDoc }
                    const snippet = getMediaImageMarkdown(doc)
                    result = insertInto(result, snippet, offset, offset)
                    offset += snippet.length
                    setValue(result)
                    toast.success(`Inserted ${doc.filename ?? file.name}`)
                }
            } finally {
                setUploading(false)
                requestAnimationFrame(() => {
                    const el = wrapperRef.current?.querySelector('textarea')
                    if (el) {
                        el.focus()
                        el.setSelectionRange(offset, offset)
                    }
                })
            }
        },
        [closePopup, setValue, value],
    )

    return (
        <div ref={wrapperRef} onKeyDown={onKeyDown}>
            <TextareaInput
                AfterInput={
                    <span
                        style={{
                            display: 'block',
                            marginTop: 8,
                            fontSize: 12,
                            color: 'var(--theme-elevation-400)',
                        }}
                    >
                        Press{' '}
                        <strong style={{ color: 'var(--theme-elevation-500)' }}>Ctrl+M</strong>{' '}
                        inside the editor to insert an image at the cursor.
                    </span>
                }
                className={admin?.className}
                description={admin?.description}
                label={field.label ?? undefined}
                localized={field.localized}
                onChange={(e) => setValue(e.target.value)}
                path={path ?? field.name}
                placeholder={admin?.placeholder}
                readOnly={disabled}
                required={field.required}
                rows={admin?.rows}
                showError={showError}
                value={value ?? ''}
            />
            {popup && (
                <div
                    ref={popupRef}
                    onMouseDown={preserveCaret}
                    style={{
                        position: 'fixed',
                        top: popup.top,
                        left: popup.left,
                        zIndex: 50,
                        display: 'flex',
                        gap: 6,
                        padding: 6,
                        background: 'var(--theme-bg, white)',
                        border: '1px solid var(--theme-elevation-150, #e4e4e4)',
                        borderRadius: 6,
                        boxShadow: '0 4px 14px rgba(0, 0, 0, 0.14)',
                    }}
                >
                    <Button
                        size="small"
                        buttonStyle="secondary"
                        onClick={() => {
                            closePopup()
                            fileInputRef.current?.click()
                        }}
                        disabled={disabled || uploading}
                    >
                        {uploading ? 'Uploading…' : 'Upload image'}
                    </Button>
                    <Button
                        size="small"
                        buttonStyle="secondary"
                        onClick={() => {
                            closePopup()
                            openDrawer()
                        }}
                        disabled={disabled}
                    >
                        Use existing media
                    </Button>
                </div>
            )}
            <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                hidden
                onChange={handleUpload}
            />
            <ListDrawer onSelect={handleSelect} enableRowSelections={false} />
        </div>
    )
}
