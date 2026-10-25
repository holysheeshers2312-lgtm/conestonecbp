import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Admin",
  robots: { index: false, follow: false },
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[color:var(--cream,#f7f1e8)] text-[color:var(--ink,#2a1f18)]">
      {children}
    </div>
  );
}
