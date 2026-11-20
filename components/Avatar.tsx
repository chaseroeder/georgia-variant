import Image from "next/image";

/**
 * Round profile photo, or the person's initials on navy if there's no photo.
 * Works in both Server and Client Components (no hooks, no Node APIs).
 */
export function Avatar({ name, photo, size = 56 }: { name: string; photo?: string; size?: number }) {
  if (photo) {
    return (
      <Image
        src={photo}
        alt={`Photo of ${name}`}
        width={size}
        height={size}
        className="shrink-0 rounded-full object-cover ring-2 ring-surface"
        style={{ width: size, height: size }}
      />
    );
  }

  // "Onu Okebie & Brian Boland" → "OB" (first initial of each person); "Jane Doe" → "JD"
  const people = name.split(/\s*(?:&|\band\b)\s*/).filter(Boolean);
  const words = (s: string) => s.replace(/[^A-Za-z\s-]/g, "").split(/[\s-]+/).filter(Boolean);
  const initials = (people.length > 1 ? people.map((p) => words(p)[0] ?? "") : words(name))
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]!.toUpperCase())
    .join("");

  return (
    <span
      aria-hidden="true"
      className="flex shrink-0 items-center justify-center rounded-full bg-navy font-serif font-semibold text-white ring-2 ring-light-blue/60 dark:bg-light-blue dark:text-navy"
      style={{ width: size, height: size, fontSize: size * 0.38 }}
    >
      {initials || "?"}
    </span>
  );
}
