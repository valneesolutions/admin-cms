# Blog Article Content Preview Specification

This specification describes only how the blog article content is displayed inside the nested blog page at `/blogs/[slug]`. It is intended to reproduce the article reading experience in another project using a Markdown renderer.

## Reading Surface

- Use a white background with near-black text.
- Keep the article column centered within the page layout.
- Limit the article text width to approximately `680px` so paragraphs remain easy to read.
- Use body text around `0.98rem` with a `1.6` line height.
- Use body text color `#2d2d2d` and heading color `#000000`.
- Keep the article content in one continuous vertical flow. Do not place content blocks side by side inside the article.
- The article starts at the top of the reading column with no extra top margin before the first rendered heading.

## Content Order

Render Markdown in this order:

1. Article title as one `h1`.
2. Introductory paragraph or paragraphs.
3. Major article sections as `h2` headings.
4. Supporting subsections as `h3` headings.
5. Paragraphs, lists, quotes, tables, images, links, and dividers wherever they occur in the source Markdown.

The first heading in the Markdown article should be displayed as the article `h1`. Do not display a second copy of the title inside the body. The table of contents should begin with the `h2` sections and should not include the article `h1`.

## Vertical Spacing

Spacing is intentionally compact and consistent:

- Paragraph: `0` top margin, `12px` bottom margin.
- `h1`: `0` top margin, `20px` bottom margin.
- `h2`: `0` top margin, `20px` bottom margin, plus `8px` bottom padding.
- `h3`: `0` top margin, `20px` bottom margin.
- List: `0` top margin, `12px` bottom margin.
- List items: `12px` vertical separation through list item spacing.
- Blockquote: `0` top margin, `12px` bottom margin, compact `8px` vertical padding.
- Table wrapper: `0` top margin, `12px` bottom margin.
- Image: `0` top margin, `12px` bottom margin in the Markdown renderer. Global article styling may add larger separation around standalone images; keep the image visually separated from adjacent text.
- Horizontal rule: `0` top margin, `12px` bottom margin.

Do not add large blank gaps between ordinary paragraphs. Section separation comes from the heading's bottom margin and the paragraph rhythm below it.

## Headings

### Article Title (`h1`)

- Black, bold, approximately `1.75rem` to `2.15rem` depending on viewport width.
- Line height: `1.25`.
- Bottom spacing: `20px`.
- No top spacing, because it begins the reading column.

### Major Section (`h2`)

- Black, bold, approximately `1.65rem`.
- No top margin.
- `20px` bottom margin.
- `8px` bottom padding.
- A thin light-gray bottom border visually separates the section heading from its content.
- Give every `h2` a stable URL id generated from its text, for example `## How It Works` becomes `id="how-it-works"`.

### Subsection (`h3`)

- Black, bold, approximately `1.3rem`.
- No top margin.
- `20px` bottom margin.
- Give every `h3` a stable URL id using the same slugification rule as `h2`.

## Paragraphs

- Use regular-weight dark-gray text.
- Set line height to `1.6`.
- Keep each paragraph in the same readable column; do not justify the text.
- Separate consecutive paragraphs with `12px` bottom spacing.
- Preserve intentional inline emphasis such as **bold** and _italic_ without changing the paragraph's size or line height.

Example preview:

```markdown
# Building Software That Lasts

The strongest products begin with a clear understanding of the problem. Good technical decisions make that understanding easier to turn into progress.

The goal is not to add complexity. The goal is to create a system that can evolve as the business learns.
```

The rendered result is one large title followed by two closely spaced body paragraphs. There is no card or background panel around the text.

## Lists

### Unordered Lists

- Use standard disc bullets.
- Apply approximately `20px` left padding.
- Keep `12px` spacing between list items.
- Keep each item at `1.6` line height.
- Use unordered lists for grouped ideas without sequence.

### Ordered Lists

- Use standard decimal numbering.
- Apply approximately `20px` left padding.
- Keep `12px` spacing between list items.
- Use ordered lists when the order of actions or steps matters.

Example preview:

```markdown
## A Practical Starting Point

1. Define the business problem.
2. Map the smallest useful workflow.
3. Build the first version and measure what happens.

The same approach also works for a checklist:

- Identify the user.
- Confirm the desired outcome.
- Remove unnecessary steps.
```

The `h2` has a bottom rule. The numbered list follows after the heading, then a paragraph, then the bulleted list, with `12px` separation between each block.

## Tables

Tables are incorporated as content blocks in the same article column. They do not float beside paragraphs.

- Wrap the table in a horizontally scrollable container so wide tables do not expand the page on mobile.
- Use a rounded `12px` outer border with a subtle shadow.
- Use a full-width collapsed table inside the wrapper.
- Align all cell content to the left.
- Use approximately `0.9rem` table text.
- Header cells use a pale gray background, black semibold text, `12px` horizontal padding, and `8px` vertical padding.
- Body cells use `12px` horizontal padding, `8px` vertical padding, and light-gray bottom borders.
- Keep cell content aligned to the top so multi-line values remain easy to compare.

Example Markdown:

```markdown
## Choosing the Right Approach

| Approach      | Best for                  | Trade-off             |
| ------------- | ------------------------- | --------------------- |
| Prototype     | Testing an idea quickly   | Limited scale         |
| Custom system | A differentiated workflow | Higher initial effort |
| Automation    | Repetitive operations     | Needs reliable inputs |
```

Visual flow:

```text
Section heading
20px gap
Introductory paragraph
12px gap
Scrollable table wrapper
12px gap
Next paragraph or section
```

On desktop, the table stays within the approximately `680px` article width. On mobile, the table keeps its natural minimum width and scrolls horizontally inside the wrapper; the page itself must not scroll sideways.

## Blockquotes

Use blockquotes for short editorial emphasis or cited statements.

- Add a `4px` gray left border.
- Use a very light gray background.
- Round only the right corners.
- Use italic gray text.
- Add compact vertical padding and `16px` left padding.
- Keep the standard `12px` bottom spacing after the quote.

Example:

```markdown
> The best system is the one that makes the next decision clearer.
```

The quote reads as a quiet inset strip, not as a large callout card.

## Images

- Keep images inside the article width with `max-width: 100%`.
- Preserve the source aspect ratio with automatic height.
- Center the image in the article column.
- Use `12px` rounded corners.
- Add a thin light border and a soft shadow.
- Keep the image visually separated from surrounding paragraphs.
- Use the Markdown alt text as the image's accessible description.

Example:

```markdown
![A product workflow moving from idea to launch](/images/product-workflow.png)
```

Images appear as full-width content within the readable column when their source is wide enough, but never cause the article or viewport to overflow.

## Links and Inline Formatting

- Internal and external links use blue `#0066cc` text.
- Links are semibold and underlined.
- Underline offset is approximately `2px`.
- On hover, links change to darker blue `#0052a3`.
- Internal links remain in the current application.
- External links open in a new tab and use `noopener noreferrer`.
- Bold and italic text keep the surrounding paragraph's size and spacing.

Example:

```markdown
Read the [technical audit guide](/services/technical-audits) before choosing an implementation path.
```

## Horizontal Rules

Render `---` as a thin light-gray horizontal rule. It should separate related content without creating a large section break.

## Complete Preview Example

Use this as the representative Markdown fixture when previewing the article style in another project:

```markdown
# Building Better Digital Products

Strong products come from clear decisions made at the right time. The process should create momentum without hiding important trade-offs.

## Start With the Problem

Before choosing a technology, describe the user's problem and the business outcome in plain language.

> Clarity in the problem creates flexibility in the solution.

### Make the First Workflow Small

1. Identify the person doing the work.
2. Remove steps that do not change the outcome.
3. Measure whether the new workflow is actually better.

| Decision    | Useful question                      | Result                    |
| ----------- | ------------------------------------ | ------------------------- |
| Scope       | What is the smallest useful version? | A focused first release   |
| Technology  | What will be easy to change later?   | Lower long-term risk      |
| Measurement | What should improve?                 | A concrete success signal |

The first version should be simple enough to learn from and structured enough to grow. Read the [technical audit guide](/services/technical-audits) for a deeper checklist.

---

## Build for the Next Decision

![A product workflow moving from idea to launch](/images/product-workflow.png)

The finished article continues in the same column, with each new section separated by its heading rather than by large decorative panels.
```

The preview should read as a single vertical article: title, paragraphs, section heading, quote, subsection, ordered list, table, paragraph with link, divider, next section, and image.
