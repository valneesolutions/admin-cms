import test from "node:test";
import assert from "node:assert/strict";

import {
  resolvePreviewHost,
  BLOG_PREVIEW_HOST_SELECTOR,
  CASE_STUDY_PREVIEW_HOST_SELECTOR,
} from "./preview-host.ts";

test("resolvePreviewHost returns the matching main editor host", () => {
  const element = { tagName: "MAIN" };
  const root = {
    querySelector: (selector: string) =>
      selector === BLOG_PREVIEW_HOST_SELECTOR ? element : null,
  } as unknown as ParentNode;

  assert.equal(resolvePreviewHost(root, BLOG_PREVIEW_HOST_SELECTOR), element);
});

test("resolvePreviewHost returns null when no host is found", () => {
  const root = {
    querySelector: () => null,
  } as unknown as ParentNode;

  assert.equal(resolvePreviewHost(root, BLOG_PREVIEW_HOST_SELECTOR), null);
});

test("resolvePreviewHost returns the case study editor host", () => {
  const element = { tagName: "MAIN" };
  const root = {
    querySelector: (selector: string) =>
      selector === CASE_STUDY_PREVIEW_HOST_SELECTOR ? element : null,
  } as unknown as ParentNode;

  assert.equal(
    resolvePreviewHost(root, CASE_STUDY_PREVIEW_HOST_SELECTOR),
    element,
  );
});
