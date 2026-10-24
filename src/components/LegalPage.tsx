import Link from "next/link";
import { Nav } from "@/components/Nav";
import { Footer } from "@/components/Footer";

type Props = {
  title: string;
  updated: string;
  children: React.ReactNode;
};

export function LegalPage({ title, updated, children }: Props) {
  return (
    <>
      <Nav />
      <main className="flex-1 border-t border-[color:var(--line)] bg-paper pt-20 md:pt-24">
        <article className="mx-auto max-w-3xl px-5 py-14 md:px-8 md:py-20">
          <p className="text-[0.65rem] font-bold uppercase tracking-[0.18em] text-muted">
            Legal
          </p>
          <h1 className="mt-3 font-display text-3xl font-semibold text-ink md:text-5xl">
            {title}
          </h1>
          <p className="mt-3 text-sm text-muted">Last updated: {updated}</p>
          <div className="legal-prose mt-10 space-y-6 text-base leading-relaxed text-ink/85">
            {children}
          </div>
          <p className="mt-12 text-sm text-muted">
            <Link href="/" className="font-semibold text-gold hover:text-brand-red">
              ← Back to home
            </Link>
          </p>
        </article>
      </main>
      <Footer />
    </>
  );
}
