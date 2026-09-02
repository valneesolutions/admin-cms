"use client";

import { useFormFields } from "@payloadcms/ui";
import type { ReactNode } from "react";
import { useEffect, useState } from "react";

function stringValue(path: string): string {
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

function Check({ passed, children }: { passed: boolean; children: ReactNode }) {
  return (
    <li
      className={passed ? "blog-seo-health__pass" : "blog-seo-health__warning"}
    >
      {children}
    </li>
  );
}

export function BlogSEOHealth() {
  const title = stringValue("title");
  const slug = stringValue("slug");
  const content = stringValue("content");
  const metaTitle = stringValue("metaTitle");
  const metaDescription = stringValue("metaDescription");
  const summary = stringValue("summary");

  const words = content.trim() ? content.trim().split(/\s+/).length : 0;
  const displayedTitle = metaTitle || title;
  const displayedDescription = metaDescription || summary;
  const checks = [
    words >= 300,
    Boolean(slug),
    displayedTitle.length >= 40 && displayedTitle.length <= 60,
    displayedDescription.length >= 120 && displayedDescription.length <= 160,
  ];
  const score = checks.filter(Boolean).length * 25;

  return (
    <section className="blog-seo-health">
      <div className="blog-seo-health__header">
        <strong>SEO health</strong>
        <span>{score}%</span>
      </div>
      <div
        className="blog-seo-health__meter"
        aria-label={`SEO health score: ${score}%`}
      >
        <span style={{ width: `${score}%` }} />
      </div>
      <ul>
        <Check passed={words >= 300}>
          {words} words {words >= 300 ? "— good" : "— aim for 300+"}
        </Check>
        <Check passed={Boolean(slug)}>
          {slug ? `/${slug}` : "Add a URL slug"}
        </Check>
        <Check
          passed={displayedTitle.length >= 40 && displayedTitle.length <= 60}
        >
          Title: {displayedTitle.length}/60 characters
        </Check>
        <Check
          passed={
            displayedDescription.length >= 120 &&
            displayedDescription.length <= 160
          }
        >
          Description: {displayedDescription.length}/160 characters
        </Check>
      </ul>
    </section>
  );
}
