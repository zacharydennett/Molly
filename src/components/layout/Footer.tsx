export function Footer() {
  return (
    <footer className="bg-molly-navy text-blue-200 text-xs py-4 px-4 mt-8">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
        <p>© {new Date().getFullYear()} Molly The Monday Reporter — Retail Health &amp; Wellness Intelligence</p>
        <p className="text-blue-300 opacity-60">
          Weather: Open-Meteo · Illness: CDC/Delphi · Ads: Wayback Machine
        </p>
      </div>
    </footer>
  );
}
