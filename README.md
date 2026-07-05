# whatagem.dev — Layered Rails Gems

A single-page field guide to the **70 Ruby & Rails gems** recommended in
_Layered Design for Ruby on Rails Applications, Second Edition_ (Vladimir
Dementyev, Packt, December 2025) — the formal **“What a gem”** callouts plus the
inline picks the book actively recommends, organized by the architectural layer
each gem belongs to, with a book page reference and a minimal usage sketch.

Live at **<https://whatagem.dev>**.

> Independent, fan-made catalogue. Gem names, links, and page numbers are drawn
> from the book; descriptions and code sketches are written fresh for this guide.
> Not affiliated with the author or Packt.

## Structure

```
.
├── index.html          # markup + inline theme-init (no-FOUC) + SEO/social tags
├── assets/
│   ├── styles.css      # all styling (light + dark themes)
│   ├── gems.js         # the data: window.GEMS = [ … 70 gems … ]
│   ├── app.js          # rendering, search, filtering, Ruby syntax highlighting
│   ├── favicon.svg     # ruby-gem mark
│   └── og.png          # 1200×630 social preview
├── CNAME               # whatagem.dev (GitHub Pages custom domain)
├── .nojekyll           # serve files as-is (no Jekyll build)
├── robots.txt
└── sitemap.xml
```

No build step and no dependencies — it's static HTML/CSS/JS. Fonts load from
Google Fonts; everything else is self-hosted.

## Editing the catalogue

The gem data lives in [`assets/gems.js`](assets/gems.js). Each entry:

```js
{
  name: "Sidekiq",
  gem: "sidekiq",                 // Gemfile / bundle add name
  area: "Jobs and scheduling",    // one of the 13 layers
  kind: "What a gem",             // "What a gem" | "Inline recommendation"
  chapter: "Chapter 1",
  pdfPage: 43,                    // printed page number
  source: "https://github.com/sidekiq/sidekiq",
  description: "…",
  example: "…"                    // minimal Ruby sketch
}
```

Counters, filters, and the layer sections all derive from this array, so adding
or editing an entry is the only change needed.

## Local preview

```sh
python3 -m http.server 8000   # then open http://localhost:8000
```

## Deployment

Served by **GitHub Pages** from the `main` branch (root). Pushing to `main`
publishes. The custom domain is configured via the `CNAME` file plus the repo's
Pages settings; DNS is managed on Cloudflare.
