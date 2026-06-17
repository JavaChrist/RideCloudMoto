interface LegalSection {
  heading: string;
  body: string[];
}

export function LegalPage({
  title,
  updatedAt,
  intro,
  sections,
}: {
  title: string;
  updatedAt: string;
  intro?: string;
  sections: LegalSection[];
}) {
  return (
    <article className="prose-sm mx-auto max-w-2xl space-y-6">
      <header>
        <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
        <p className="text-xs text-muted-foreground">Dernière mise à jour : {updatedAt}</p>
      </header>
      {intro ? <p className="text-sm text-muted-foreground">{intro}</p> : null}
      {sections.map((section) => (
        <section key={section.heading} className="space-y-2">
          <h2 className="text-lg font-semibold">{section.heading}</h2>
          {section.body.map((paragraph, i) => (
            <p key={i} className="text-sm leading-relaxed text-muted-foreground">
              {paragraph}
            </p>
          ))}
        </section>
      ))}
    </article>
  );
}
