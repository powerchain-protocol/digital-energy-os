const surfaces = [
  ["Command Center", "Operational status, physical-energy authority and operator actions."],
  ["Energy RWA", "Verified Energy Positions, PET-20 metadata and chain representation boundaries."],
  ["Marketplace", "Atomic reservation, tenant inventory and linked checkout."],
  ["Checkout", "Review-first non-custodial payment state machine."],
  ["Copilot", "Ask, Analyze, Research and Act with approval boundaries."],
];

export default function ComponentCatalogPage() {
  return (
    <main>
      <header className="hero">
        <span>POWERCHAIN DESIGN SYSTEM · v1.0.0</span>
        <h1>Component Catalog</h1>
        <p>First-party UI reference without the vulnerable Next-specific Storybook dependency chain.</p>
      </header>
      <section className="grid">
        {surfaces.map(([title, description]) => (
          <article key={title}>
            <div className="mark" />
            <h2>{title}</h2>
            <p>{description}</p>
            <span className="catalog-action">Reference surface</span>
          </article>
        ))}
      </section>
    </main>
  );
}
