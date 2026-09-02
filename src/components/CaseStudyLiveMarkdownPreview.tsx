"use client";

import { useFormFields } from "@payloadcms/ui";
import { createPortal } from "react-dom";
import { useEffect, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { useCaseStudyPreviewMode } from "./case-study-preview-mode";
import {
  CASE_STUDY_PREVIEW_HOST_SELECTOR,
  resolvePreviewHost,
} from "./preview-host";

function slugifyHeading(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/[\s-]+/g, "-");
}

function useStringField(path: string): string {
  const formValue = useFormFields(([fields]) => {
    const value = fields?.[path]?.value;
    return typeof value === "string" ? value : "";
  });
  const [domValue, setDomValue] = useState("");

  useEffect(() => {
    const readValue = () => {
      const field = document.getElementsByName(path)[0] as
        | HTMLInputElement
        | HTMLTextAreaElement
        | undefined;
      setDomValue(field?.value ?? "");
    };

    readValue();
    document.addEventListener("input", readValue, true);
    document.addEventListener("change", readValue, true);

    return () => {
      document.removeEventListener("input", readValue, true);
      document.removeEventListener("change", readValue, true);
    };
  }, [path]);

  return formValue || domValue;
}

export function CaseStudyLiveMarkdownPreview() {
  const [host, setHost] = useState<HTMLElement | null>(null);
  const isPreviewing = useCaseStudyPreviewMode();
  const title = useStringField("title");
  const description = useStringField("description");
  const content = useStringField("content");

  useEffect(() => {
    const syncHost = () =>
      setHost(resolvePreviewHost(document, CASE_STUDY_PREVIEW_HOST_SELECTOR));

    syncHost();

    if (typeof MutationObserver !== "undefined") {
      const observer = new MutationObserver(syncHost);
      observer.observe(document.body, { childList: true, subtree: true });
      return () => observer.disconnect();
    }
  }, []);

  if (!isPreviewing || !host) return null;

  return createPortal(
    <main className="case-study-document-preview">
      <article className="case-study-document-preview__article">
        <header className="case-study-document-preview__header">
          <span>Case Study preview</span>
          <h1>{title || "Untitled case study"}</h1>
          {description && <p>{description}</p>}
        </header>
        <div className="case-study-document-preview__body">
          {content ? (
            <ReactMarkdown
              components={{
                a: ({ href, children, ...props }) => {
                  const external = Boolean(href && /^https?:\/\//.test(href));
                  return (
                    <a
                      href={href}
                      {...props}
                      {...(external
                        ? { target: "_blank", rel: "noopener noreferrer" }
                        : {})}
                    >
                      {children}
                    </a>
                  );
                },
                h1: ({ children, ...props }) =>
                  title.trim() === String(children).trim() ? null : (
                    <h1 {...props}>{children}</h1>
                  ),
                h2: ({ children, ...props }) => (
                  <h2 id={slugifyHeading(String(children))} {...props}>
                    {children}
                  </h2>
                ),
                h3: ({ children, ...props }) => (
                  <h3 id={slugifyHeading(String(children))} {...props}>
                    {children}
                  </h3>
                ),
                table: ({ children }) => (
                  <div className="case-study-document-preview__table-wrap">
                    <table>{children}</table>
                  </div>
                ),
              }}
              remarkPlugins={[remarkGfm]}
            >
              {content}
            </ReactMarkdown>
          ) : (
            <p className="case-study-document-preview__empty">
              This case study has no content yet.
            </p>
          )}
        </div>
      </article>
    </main>,
    host,
  );
}
