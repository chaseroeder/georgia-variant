import { evaluate } from "@mdx-js/mdx";
import * as runtime from "react/jsx-runtime";

/**
 * Renders an MDX string (the body of a content file) as styled HTML.
 *
 * `prose` comes from the Tailwind Typography plugin: it gives headings,
 * paragraphs, lists, and quotes nice editorial defaults. We tune its
 * colors to our brand tokens in app/globals.css.
 */
export async function Mdx({ source }: { source: string }) {
  const { default: Content } = await evaluate(source, { ...runtime });
  return (
    <div className="prose prose-ledger max-w-none">
      <Content />
    </div>
  );
}
