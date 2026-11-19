# Adding an alumni profile

1. Copy `_template.mdx` (or any profile) and rename it `firstname-lastname.mdx`.
   The file name becomes the URL: `/founders/firstname-lastname`.
2. Fill in every field between the `---` lines. `industry` must be exactly one of:
   Investment Banking, Private Equity, Hedge Funds, Venture Capital, Startups, Quant.
3. Optional photo: put a square image in `public/alumni/` and set `photo: /alumni/your-file.jpg`.
   Without one, the page shows their initials.
4. Write the Q&A below the second `---`. Use `##` for each question.
5. Delete the `placeholder: true` line.

Files starting with `_` (like `_template.mdx`) are never published.
If you make a mistake in a field, `npm run dev` shows an error naming the file and field.
