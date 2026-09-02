export const BLOG_PREVIEW_HOST_SELECTOR =
  ".collection-edit--blogs .collection-edit__main";
export const CASE_STUDY_PREVIEW_HOST_SELECTOR =
  ".collection-edit--case-studies .collection-edit__main";

export function resolvePreviewHost(
  root: ParentNode = document,
  selector: string,
) {
  return root.querySelector<HTMLElement>(selector) ?? null;
}
