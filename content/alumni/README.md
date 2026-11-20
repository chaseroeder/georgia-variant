# Adding an alumni profile

1. Copy `_template.mdx` (or any profile) and rename it `firstname-lastname.mdx`.
   The file name becomes the URL: `/founders/firstname-lastname`.
2. Fill in every field between the `---` lines. `industry` must be exactly one of:
   Investment Banking, Private Equity, Hedge Funds, Venture Capital, Startups, Quant.
3. Optional photo: put a square image in `public/alumni/` and set `photo: /alumni/your-file.jpg`.
   Without one, the page shows their initials. The photo only appears once the file is actually in
   `public/alumni/`, so you can name it before you have it.
   - **Two co-founders in one profile:** write `name: "First Last & First Last"` (initials become one from
     each person) and put a photo of them together in `coverPhoto:`, with `coverCaption:` for the caption and photo credit.
   - **Only use photos the person sent you or OK'd.** Don't save pictures off the web.
   - `advice` is optional. Leave it out unless you have a real quote from them.
4. Write the Q&A below the second `---`. Use `##` for each question.
5. Delete the `placeholder: true` line.
6. Before publishing, send them the profile to review and get their OK (house rule in CONTRIBUTING.md).

Files starting with `_` (like `_template.mdx`) are never published.
If you make a mistake in a field, `npm run dev` shows an error naming the file and field.
