"use client";

import ScrollStack, { ScrollStackItem } from "@/components/ScrollStack";
import { SectionLabel } from "@/components/SectionLabel";
import { SectionTitle } from "@/components/SectionTitle";

const shots = [
  {
    src: "https://images.unsplash.com/photo-1585937421612-70a008356fbe?auto=format&fit=crop&w=1200&q=80",
    alt: "Placeholder: Indian curry dish. Replace with ConeStone photo.",
    label: "Curry & rice",
  },
  {
    src: "https://images.unsplash.com/photo-1601050690597-df0568f70950?auto=format&fit=crop&w=1200&q=80",
    alt: "Placeholder: samosas. Replace with ConeStone photo.",
    label: "Snacks",
  },
  {
    src: "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=1200&q=80",
    alt: "Placeholder: coffee. Replace with ConeStone photo.",
    label: "Hot drinks",
  },
];

export function Gallery() {
  return (
    <section
      className="border-t border-[color:var(--line)] py-20 md:py-28"
      aria-labelledby="gallery-heading"
    >
      <div className="mx-auto max-w-6xl px-5 md:px-8">
        <SectionLabel>Atmosphere</SectionLabel>
        <SectionTitle id="gallery-heading">Food mood board</SectionTitle>
        <p className="mt-4 max-w-lg text-sm text-muted">
          Licensed placeholder images only. Swap these for real ConeStone
          photography when available. Scroll to stack the shots.
        </p>
      </div>

      {/* Do not put overflow:hidden on this section — it kills position:sticky */}
      <div className="mt-10 md:mt-14">
        <ScrollStack
          useWindowScroll
          smoothScroll={false}
          className="mx-auto max-w-3xl"
          itemDistance={220}
          itemStackDistance={32}
          stackPosition="12%"
          itemScale={0.045}
          baseScale={0.88}
          dimAmount={0.28}
          blurAmount={0}
          holdDistance={240}
        >
          {shots.map((shot) => (
            <ScrollStackItem
              key={shot.src}
              itemClassName="!h-[min(72vh,30rem)] !rounded-[1.75rem] !p-0 overflow-hidden border border-[color:var(--line)] !bg-cream-deep !text-ink"
              style={{
                background: "var(--cream-deep)",
                color: "var(--ink)",
              }}
            >
              <figure className="relative h-full w-full">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={shot.src}
                  alt={shot.alt}
                  className="h-full w-full object-cover"
                  loading="lazy"
                />
                <figcaption className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/55 to-transparent px-6 pb-5 pt-16 font-display text-xl text-white md:text-2xl">
                  {shot.label}
                </figcaption>
              </figure>
            </ScrollStackItem>
          ))}
        </ScrollStack>
      </div>
    </section>
  );
}
