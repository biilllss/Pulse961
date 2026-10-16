import Link from "next/link";

/**
 * Root 404. The site's language is a client-side preference, so this
 * server page greets the lost visitor in both languages — EN voice,
 * with the Arabic line set explicitly rtl so it renders correctly
 * even inside an LTR document.
 */
export default function NotFound() {
  return (
    // dir="ltr" on purpose: the client language provider may have set
    // <html dir="rtl"> from a previous visit — the 404 is bilingual and
    // keeps its own internal direction (the Arabic line flips back with
    // dir="rtl" below).
    <main
      dir="ltr"
      className="flex min-h-screen flex-col items-center justify-center bg-ink px-6 py-16 text-center text-white"
    >
      <p
        aria-hidden="true"
        className="font-display text-[clamp(6rem,28vw,15rem)] leading-[0.8] text-volt"
      >
        404
      </p>
      <h1 className="font-display mt-4 text-4xl leading-tight tracking-wide sm:text-5xl">
        This page skipped leg day.
      </h1>
      <p className="mt-2 text-white/60" lang="ar" dir="rtl">
        الصفحة اللي عم تدوّر عليها ما موجودة — بس حصتك المجانية لسا موجودة.
      </p>
      <p className="mt-4 max-w-md text-sm leading-relaxed text-white/50">
        The page you&apos;re looking for doesn&apos;t exist — but your first
        free session does.
      </p>
      <Link
        href="/"
        className="mt-10 inline-flex items-center gap-2 bg-volt px-7 py-3 text-base font-bold text-ink transition-colors hover:bg-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-volt"
      >
        Back to Pulse 961
      </Link>
    </main>
  );
}
