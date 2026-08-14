import Link from "next/link";

export function PagePlaceholder({ title, subtitle, links = [] }: { title: string; subtitle: string; links?: Array<{ href: string; label: string }> }) {
  return (
    <section className="relative overflow-hidden rounded-3xl border border-black/10 bg-white p-8 shadow-sm">
      <div className="pointer-events-none absolute -right-8 -top-10 font-serif text-[12rem] leading-none text-[#C84B31]/5">学</div>
      <div className="relative max-w-3xl">
        <p className="text-sm font-semibold uppercase tracking-widest text-[#C84B31]">Route ready</p>
        <h2 className="mt-3 text-4xl font-bold tracking-tight text-[#1A1A1A]">{title}</h2>
        <p className="mt-4 text-lg leading-8 text-[#6B6B6B]">{subtitle}</p>
        {links.length > 0 ? (
          <div className="mt-8 flex flex-wrap gap-3">
            {links.map((link) => (
              <Link key={link.href} href={link.href} className="rounded-full bg-[#2D5F8A] px-4 py-2 text-sm font-semibold text-white hover:bg-[#C84B31]">
                {link.label}
              </Link>
            ))}
          </div>
        ) : null}
      </div>
    </section>
  );
}
