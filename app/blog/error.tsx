"use client";
export default function BlogError({ reset }: { reset: () => void }) {
  return <main className="inner-page"><section className="inner-hero">
    <h1>No pudimos cargar este contenido</h1><p>Intenta nuevamente en unos momentos.</p>
    <div className="hero-actions"><button type="button" className="btn btn-primary" onClick={reset}>Reintentar</button>
      <a href="/blog" className="btn btn-secondary">Volver al blog</a></div>
  </section></main>;
}
