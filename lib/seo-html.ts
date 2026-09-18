// HTML for the server-built pages (assessment pages, the assessments hub and
// article pages). They are spliced into the shared shell as one page-view
// section, so they use the site's existing classes (page-hero, section,
// wrap, steps, accordion, note-box, cta-band) plus a few lp-* additions in
// globals.css, and look native to the rest of the site.

import { allArticles, articleCategories, findArticle, findService, gbp, firstInstalment, type Article } from '@/lib/catalogue';
import { LANDING_PAGES, landingPage, landingPath, type LandingPage } from '@/lib/landing-pages';
import { SERVICES } from '@/lib/server/services';

export const esc = (s: string) =>
  String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
/// For values inside an onclick="...'value'..." attribute.
const jsArg = (s: string) => esc(s.replace(/\\/g, '\\\\').replace(/'/g, "\\'"));

function crumbs(items: { name: string; href?: string }[]) {
  return `<nav class="crumbs" aria-label="Breadcrumb"><ol>${items
    .map((c) => `<li>${c.href ? `<a href="${c.href}">${esc(c.name)}</a>` : `<span aria-current="page">${esc(c.name)}</span>`}</li>`)
    .join('')}</ol></nav>`;
}

function accordion(faqs: { q: string; a: string }[]) {
  return `<div class="accordion">${faqs
    .map(
      (f) =>
        `<div class="acc-item" data-open="false"><button class="acc-trigger" onclick="Eldava.toggleAcc(this)"><span class="t">${esc(f.q)}</span><span class="plus">+</span></button><div class="acc-panel"><div class="acc-panel-inner"><p>${esc(f.a)}</p></div></div></div>`
    )
    .join('')}</div>`;
}

function articleCards(ids: string[]) {
  const list = ids.map((id) => findArticle(id)).filter(Boolean) as Article[];
  if (!list.length) return '';
  const cats = articleCategories();
  return `<div class="blog-grid">${list.map((a) => articleCard(a, cats)).join('')}</div>`;
}

export function articleCard(a: Article, cats = articleCategories()) {
  return `<a class="blog-card" href="/insights/${a.id}/"><span class="cat">${esc(cats[a.cat] || '')}</span><h3>${esc(a.title)}</h3><p>${esc(a.excerpt)}</p><span class="rd">${esc(a.read)}</span></a>`;
}

/// The /insights/ grid, server-rendered (the app script re-renders it identically).
export function blogGridHtml() {
  const cats = articleCategories();
  return allArticles().map((a) => articleCard(a, cats)).join('');
}

/// The /pricing/ table body, server-rendered at list price so the full price
/// list is in the HTML; the app script re-renders it with any promo applied.
export function priceRowsHtml(servicePages: Record<string, string>) {
  return SERVICES.filter((s) => s.cat !== 'founding')
    .map((s) => {
      const name = servicePages[s.name] ? `<a href="${servicePages[s.name]}">${esc(s.name)}</a>` : esc(s.name);
      return `<tr><td><div class="svc-name">${name}</div><div class="svc-desc">${esc(s.desc)}</div></td><td>${esc(s.durationLabel)}</td><td class="svc-price"><span class="svc-price mono">${gbp(s.priceMinor)}</span></td><td class="mono" style="color:var(--text-soft); font-size:0.85rem;">3 &times; ${firstInstalment(s.priceMinor)}</td><td><button class="btn btn-primary btn-sm" onclick="Eldava.openBooking('${jsArg(s.name)}')">Book</button></td></tr>`;
    })
    .join('');
}

export function landingHtml(p: LandingPage) {
  const svc = findService(p.service);
  if (!svc) throw new Error(`landing page ${p.slug}: unknown service "${p.service}"`);
  const price = gbp(svc.priceMinor);
  const related = p.related.map((s) => landingPage(s)).filter(Boolean) as LandingPage[];
  const book = `Eldava.openBooking('${jsArg(p.service)}')`;

  return `
  <div class="page-hero">
    <div class="wrap">
      ${crumbs([{ name: 'Home', href: '/' }, { name: 'Assessments', href: '/assessments/' }, { name: p.eyebrow }])}
      <p class="eyebrow on-dark">${esc(p.eyebrow)}</p>
      <h1>${esc(p.h1)}</h1>
      <p>${esc(p.lede)}</p>
      <div class="lp-hero-cta">
        <button class="btn btn-primary" onclick="${book}">Book this assessment</button>
        <span class="lp-price-inline">From <b data-live-price="${esc(p.service)}">${price}</b> &middot; or 3 &times; ${firstInstalment(svc.priceMinor)} with Klarna</span>
      </div>
    </div>
  </div>
  <section>
    <div class="wrap">
      <div class="lp-facts">
        <div><span class="k">Price</span><span class="v">${price}</span><span class="s">report included</span></div>
        <div><span class="k">Appointment</span><span class="v">${esc(svc.durationLabel)}</span><span class="s">live video</span></div>
        <div><span class="k">Clinician</span><span class="v">Licensed</span><span class="s">in your region</span></div>
        <div><span class="k">Pay</span><span class="v">In full or in 3</span><span class="s">Klarna where available</span></div>
      </div>
      <div class="lp-grid2">
        <div>
          <h2>Who this assessment is for</h2>
          <ul class="lp-list">${p.whoFor.map((x) => `<li>${esc(x)}</li>`).join('')}</ul>
        </div>
        <div>
          <h2>What you receive</h2>
          <ul class="lp-list">${p.receive.map((x) => `<li>${esc(x)}</li>`).join('')}</ul>
        </div>
      </div>
    </div>
  </section>
  <section style="background:var(--stone-2);">
    <div class="wrap lp-prose">
      ${p.sections.map((s) => `<h2>${esc(s.h2)}</h2>${s.p.map((x) => `<p>${esc(x)}</p>`).join('')}`).join('')}
    </div>
  </section>
  <section>
    <div class="wrap">
      <div class="section-head"><h2>How it works</h2></div>
      <div class="steps">
        <div class="step"><span class="idx">01</span><h3>Book</h3><p>Choose a time that suits you, including evenings and weekends, and pay in full or in three instalments.</p></div>
        <div class="step"><span class="idx">02</span><h3>Guided pre-consultation</h3><p>A short set of questions, including a safety check, so your clinician starts with the right picture.</p></div>
        <div class="step"><span class="idx">03</span><h3>Meet your clinician</h3><p>Your assessment happens live on video with a clinician licensed in your region.</p></div>
        <div class="step"><span class="idx">04</span><h3>Receive your report</h3><p>A written, signed report in your patient portal within the working days quoted at booking.</p></div>
      </div>
    </div>
  </section>
  <section style="background:var(--stone-2);">
    <div class="wrap">
      <div class="section-head"><h2>Frequently asked questions</h2></div>
      ${accordion(p.faqs)}
      <div class="note-box">This page is general information and does not replace an individual clinical assessment. If you are in crisis or at risk of harm, contact your local emergency services now.</div>
    </div>
  </section>
  ${
    related.length || p.articles.length
      ? `<section><div class="wrap">
      ${related.length ? `<div class="section-head"><h2>Related assessments</h2></div><div class="lp-related">${related.map((r) => `<a href="${landingPath(r.slug)}"><b>${esc(r.eyebrow)}</b><span>${esc(r.lede.split('. ')[0])}.</span></a>`).join('')}</div>` : ''}
      ${p.articles.length ? `<div class="section-head" style="margin-top:36px;"><h2>Further reading</h2></div>${articleCards(p.articles)}` : ''}
    </div></section>`
      : ''
  }
  <section style="padding-top:0;"><div class="wrap"><div class="cta-band"><h2>${esc(p.eyebrow)}: ${price}, report included</h2><button class="btn btn-primary" onclick="${book}">Book this assessment</button></div></div></section>`;
}

export function hubHtml() {
  const groups = Array.from(new Set(LANDING_PAGES.map((p) => p.group)));
  return `
  <div class="page-hero">
    <div class="wrap">
      ${crumbs([{ name: 'Home', href: '/' }, { name: 'Assessments' }])}
      <p class="eyebrow on-dark">Assessments</p>
      <h1>Private specialist assessments online</h1>
      <p>Diagnostic assessments and specialist consultations with licensed clinicians on live video, with a written report you can use. Fixed prices, pay in full or in three instalments.</p>
    </div>
  </div>
  <section>
    <div class="wrap">
      ${groups
        .map(
          (g) => `<div class="section-head" style="margin-top:12px;"><h2>${esc(g)}</h2></div>
      <div class="lp-related">${LANDING_PAGES.filter((p) => p.group === g)
        .map((p) => {
          const svc = findService(p.service)!;
          return `<a href="${landingPath(p.slug)}"><b>${esc(p.h1)}</b><span>${esc(p.lede.split('. ')[0])}.</span><em>${gbp(svc.priceMinor)} &middot; ${esc(svc.durationLabel)}</em></a>`;
        })
        .join('')}</div>`
        )
        .join('')}
      <p style="margin-top:32px;"><a class="btn btn-ghost" href="/pricing/">See all 60+ services and prices</a></p>
    </div>
  </section>`;
}

export function articleHtml(a: Article, reviewedLabel: string) {
  const cats = articleCategories();
  const more = allArticles().filter((x) => x.id !== a.id && x.cat === a.cat).slice(0, 3);
  const fill = more.length < 3 ? allArticles().filter((x) => x.id !== a.id && !more.includes(x)).slice(0, 3 - more.length) : [];
  // CTAs point at the most relevant assessment page where there is one.
  const ctaLinks = LANDING_PAGES.filter((p) => p.articles.includes(a.id)).slice(0, 3);
  return `
  <div class="page-hero">
    <div class="wrap">
      ${crumbs([{ name: 'Home', href: '/' }, { name: 'Insights', href: '/insights/' }, { name: a.title }])}
      <p class="eyebrow on-dark">${esc(cats[a.cat] || 'Insights')}</p>
      <h1>${esc(a.title)}</h1>
      <p>${esc(a.excerpt)}</p>
      <p class="article-meta" style="color:var(--void-soft);">${esc(a.read)} &middot; Reviewed ${esc(reviewedLabel)} &middot; Eldava Health</p>
    </div>
  </div>
  <section>
    <div class="wrap">
      <article class="article-body">${a.body}</article>
      ${
        ctaLinks.length
          ? `<div class="mini-cta"><div><h4 style="margin-bottom:4px;">Related assessments</h4><p style="color:var(--text-soft);">${ctaLinks.map((p) => `<a href="${landingPath(p.slug)}">${esc(p.eyebrow)}</a>`).join(' &middot; ')}</p></div><a class="btn btn-primary" href="${landingPath(ctaLinks[0].slug)}">${esc(ctaLinks[0].eyebrow)}</a></div>`
          : a.cta
          ? `<div class="mini-cta"><div><h4 style="margin-bottom:4px;">Related</h4><p style="color:var(--text-soft);">${esc(a.title)}</p></div><button class="btn btn-primary" onclick="${esc(a.cta.action)}">${esc(a.cta.text)}</button></div>`
          : ''
      }
    </div>
  </section>
  <section style="background:var(--stone-2);">
    <div class="wrap">
      <div class="section-head"><h2>More from Insights</h2></div>
      <div class="blog-grid">${[...more, ...fill].map((x) => articleCard(x, cats)).join('')}</div>
    </div>
  </section>`;
}

/// Sitewide footer strip linking every assessment page (internal links from
/// every URL to the pages that target the highest-intent searches).
export function footPopularHtml() {
  return `<h5>Popular assessments</h5><ul>${LANDING_PAGES.map((p) => `<li><a href="${landingPath(p.slug)}">${esc(p.eyebrow)}</a></li>`).join('')}</ul>`;
}
