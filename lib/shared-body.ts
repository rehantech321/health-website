// The full page body - header, mega menus, mobile panel, every page-view
// section, footer and modals - as one HTML string, rendered by SharedShell.
// Kept as a readable multi-line template literal so it can be edited.
export const SHARED_BODY_HTML: string = `
<div class="promo-banner" id="promoBanner">
  <div class="wrap">
    <span><b>Launch offer:</b> 15% off every assessment</span>
    <span class="code" id="bannerCode">ELDAVA15</span>
    <span>First 2,000 patients &middot; pay in full or in 3</span>
    <span class="countdown" id="bannerCountdown">14d 00h 00m</span>
    <button class="btn btn-primary btn-sm" onclick="Eldava.applyPromoAndBook()">Claim it</button>
  </div>
  <button class="close" onclick="Eldava.dismissBanner()" aria-label="Dismiss offer banner">&times;</button>
</div>

<header class="site">
  <div class="nav">
    <a class="brand" href="/" onclick="event.preventDefault(); Eldava.go('home')"><span class="mark"><svg viewBox="0 0 40 40" fill="none" aria-hidden="true"><circle cx="20" cy="20" r="18" stroke="currentColor" stroke-width="1.6"/><path d="M14 11v18M14 11h11M14 20h8.5M14 29h11" stroke="currentColor" stroke-width="2.2" stroke-linejoin="round"/><circle cx="26.5" cy="12" r="2.1" fill="var(--jade-bright)"/></svg></span>Eldava Health</a>
    <nav class="links">
      <a class="navlink" data-page="home" href="/" onclick="event.preventDefault(); Eldava.go('home')">Home</a>
      <div class="megawrap">
        <button class="navlink" id="megaToggle" aria-expanded="false" aria-haspopup="true" onclick="Eldava.toggleMega()">Assessments</button>
        <div class="megamenu" id="megaMenu" hidden></div>
      </div>
      <a class="navlink" data-page="how" href="/how-it-works/" onclick="event.preventDefault(); Eldava.go('how')">How it works</a>
      <div class="megawrap">
        <button class="navlink" id="orgToggle" aria-expanded="false" aria-haspopup="true" onclick="Eldava.toggleOrg()">For Organisations</button>
        <div class="megamenu solmenu" id="orgMenu" hidden>
          <div class="cats">
            <a href="/for-employers/" onclick="event.preventDefault(); Eldava.go('corporate'); Eldava.closeOrg();">For employers</a>
            <a href="/for-schools/" onclick="event.preventDefault(); Eldava.go('schools'); Eldava.closeOrg();">For schools</a>
            <a href="/for-universities/" onclick="event.preventDefault(); Eldava.go('universities'); Eldava.closeOrg();">For universities</a>
            <a href="/for-insurers/" onclick="event.preventDefault(); Eldava.go('insurers'); Eldava.closeOrg();">For insurers</a>
          </div>
          <div class="cats">
            <a href="/for-health-systems/" onclick="event.preventDefault(); Eldava.go('health-systems'); Eldava.closeOrg();">For health systems</a>
            <a href="/for-legal-and-solicitors/" onclick="event.preventDefault(); Eldava.go('legal'); Eldava.closeOrg();">For legal &amp; solicitors</a>
          </div>
        </div>
      </div>
      <a class="navlink navlink-accent" data-page="founding500" href="/founding-500/" onclick="event.preventDefault(); Eldava.go('founding500')">Founding 500</a>
      <div class="megawrap">
        <button class="navlink" id="resToggle" aria-expanded="false" aria-haspopup="true" onclick="Eldava.toggleResources()">Resources</button>
        <div class="megamenu solmenu" id="resMenu" hidden>
          <div class="cats">
            <a href="/complete-pathway/" onclick="event.preventDefault(); Eldava.go('pathway'); Eldava.closeResources();">The Complete Pathway</a>
            <a href="/pharmacy-delivery/" onclick="event.preventDefault(); Eldava.go('pharmacy'); Eldava.closeResources();">Pharmacy delivery</a>
            <a href="/clinician-training-academy/" onclick="event.preventDefault(); Eldava.go('academy'); Eldava.closeResources();">Clinician Training Academy</a>
            <a href="/guided-intake-technology/" onclick="event.preventDefault(); Eldava.go('ai'); Eldava.closeResources();">Our intake technology</a>
            <a href="/outcomes-and-transparency/" onclick="event.preventDefault(); Eldava.go('outcomes'); Eldava.closeResources();">Outcomes &amp; transparency</a>
          </div>
          <div class="cats">
            <a href="/insights/" onclick="event.preventDefault(); Eldava.go('blog'); Eldava.closeResources();">Insights &amp; articles</a>
            <a href="/free-screening-tools/" onclick="event.preventDefault(); Eldava.go('screening'); Eldava.closeResources();">Free screening tools</a>
            <a href="/founders-circle/" onclick="event.preventDefault(); Eldava.go('founders'); Eldava.closeResources();">Founders Circle</a>
            <a href="/charity-partnership/" onclick="event.preventDefault(); Eldava.go('charity'); Eldava.closeResources();">Charity partnership</a>
            <a href="/events/" onclick="event.preventDefault(); Eldava.go('events'); Eldava.closeResources();">Events</a>
          </div>
        </div>
      </div>
      <a class="navlink" data-page="partner" href="/join-the-network/" onclick="event.preventDefault(); Eldava.go('partner')">Join the network</a>
      <a class="navlink" data-page="about" href="/about/" onclick="event.preventDefault(); Eldava.go('about')">About</a>
    </nav>
    <div class="navright">
      <select id="navCountrySelect" aria-label="Select your country" onchange="Eldava.setCountry(this.value)" style="background:transparent; color:var(--void-soft); border:1px solid var(--void-line); border-radius:6px; font-size:0.82rem; padding:4px 6px; max-width:150px;"></select>
      <a href="mailto:care@eldava.com">care@eldava.com</a>
      <div class="megawrap acct-switch">
        <button class="navlink acct-toggle" id="acctToggle" onclick="Eldava.toggleAcct()">Sign in / Sign up</button>
        <button class="acct-avatar" id="acctAvatar" onclick="Eldava.toggleAcct()" aria-label="Your account" aria-haspopup="true" hidden>
          <span class="acct-initials" id="acctInitials">?</span>
        </button>
        <button class="acct-avatar acct-avatar-clin" id="acctClinAvatar" onclick="Eldava.toggleAcct()" aria-label="Clinician account" aria-haspopup="true" hidden>
          <span class="acct-initials" id="acctClinInitials">?</span>
        </button>
        <div class="megamenu acct-menu" id="acctMenu" hidden>
          <div class="acct-signed" id="acctSigned" hidden>
            <span class="acct-avatar-lg" id="acctInitialsLg">?</span>
            <span class="acct-signed-who"><b id="acctWho"></b><br><span class="acct-sub" id="acctEmail"></span></span>
          </div>
          <div class="acct-signed" id="acctClinSigned" hidden>
            <span class="acct-avatar-lg acct-avatar-clin" id="acctClinInitialsLg">?</span>
            <span class="acct-signed-who"><b id="acctClinWho"></b><br><span class="acct-sub">Clinician &middot; <span id="acctClinEmail"></span></span></span>
          </div>
          <a class="acct-option" id="acctPortalOpt" href="/clinician/portal/" onclick="event.preventDefault(); Eldava.go('clinician-portal'); Eldava.closeAcct();" hidden>
            <span class="acct-icn" aria-hidden="true">&#129658;</span>
            <span><strong>Clinician portal</strong><br><span class="acct-sub">Your appointments, patient summaries and notes</span></span>
          </a>
          <div class="acct-signout-row" id="acctClinSignoutRow" hidden>
            <button class="acct-signout" onclick="Eldava.clinicianLogout(); Eldava.closeAcct();">Sign out of the clinician portal</button>
          </div>
          <a class="acct-option" id="acctProfileOpt" href="/account/profile/" onclick="event.preventDefault(); Eldava.go('profile'); Eldava.closeAcct();" hidden>
            <span class="acct-icn" aria-hidden="true">&#128100;</span>
            <span><strong>My profile</strong><br><span class="acct-sub">Your details and every appointment you have booked</span></span>
          </a>
          <a class="acct-option" id="acctPatientOpt" href="/account/register/" onclick="event.preventDefault(); Eldava.go('register'); Eldava.closeAcct();">
            <span class="acct-icn" aria-hidden="true">&#128100;</span>
            <span><strong>Patient</strong><br><span class="acct-sub">Create an account, log in, book or continue an assessment</span></span>
          </a>
          <a class="acct-option" href="/clinician/sign-in/" onclick="event.preventDefault(); Eldava.go('clinician-login'); Eldava.closeAcct();">
            <span class="acct-icn" aria-hidden="true">&#129658;</span>
            <span><strong>Clinician</strong><br><span class="acct-sub">Sign in to the clinician portal, or apply to join Eldava</span></span>
          </a>
          <div class="acct-signout-row" id="acctSignoutRow" hidden>
            <button class="acct-signout" onclick="Eldava.patientLogout()">Sign out</button>
          </div>
        </div>
      </div>
      <button class="btn btn-primary btn-sm" id="navBookBtn" onclick="Eldava.openBooking()">Book a session</button>
      <button class="mobile-toggle" id="mobileToggle" onclick="Eldava.toggleMobileNav()" aria-label="Open menu" aria-expanded="false">
        <span></span><span></span><span></span>
      </button>
    </div>
  </div>
  <div class="mobile-panel" id="mobilePanel" hidden>
    <div class="mobile-acct-row" id="mobileAcctOut">
      <a class="btn btn-ghost btn-sm" href="/account/register/" onclick="event.preventDefault(); Eldava.go('register'); Eldava.closeMobileNav();">Patient sign in</a>
      <a class="btn btn-ghost btn-sm" href="/clinician/sign-in/" onclick="event.preventDefault(); Eldava.go('clinician-login'); Eldava.closeMobileNav();">Clinician sign in</a>
    </div>
    <div class="mobile-acct-row" id="mobileAcctIn" hidden>
      <a class="btn btn-ghost btn-sm" href="/account/profile/" onclick="event.preventDefault(); Eldava.go('profile'); Eldava.closeMobileNav();">My profile</a>
      <button class="btn btn-ghost btn-sm" onclick="Eldava.patientLogout(); Eldava.closeMobileNav();">Sign out</button>
    </div>
    <div class="mobile-acct-row" id="mobileAcctClin" hidden>
      <a class="btn btn-ghost btn-sm" href="/clinician/portal/" onclick="event.preventDefault(); Eldava.go('clinician-portal'); Eldava.closeMobileNav();">Clinician portal</a>
      <button class="btn btn-ghost btn-sm" onclick="Eldava.clinicianLogout(); Eldava.closeMobileNav();">Sign out</button>
    </div>
    <div class="mobile-country-row" style="padding:10px 16px;">
      <label for="mobileCountrySelect" style="display:block; color:var(--void-soft); font-size:0.82rem; margin-bottom:6px;">Your country</label>
      <select id="mobileCountrySelect" onchange="Eldava.setCountry(this.value)" style="width:100%; padding:8px 10px; border-radius:8px; border:1px solid var(--void-line);"></select>
    </div>
    <a class="mobile-link" href="/" onclick="event.preventDefault(); Eldava.go('home')">Home</a>
    <a class="mobile-link" href="/pricing/" onclick="event.preventDefault(); Eldava.go('pricing')">Assessments &amp; pricing</a>
    <a class="mobile-link" href="/how-it-works/" onclick="event.preventDefault(); Eldava.go('how')">How it works</a>
    <a class="mobile-link" href="/for-employers/" onclick="event.preventDefault(); Eldava.go('corporate')">For employers</a>
    <a class="mobile-link" href="/for-schools/" onclick="event.preventDefault(); Eldava.go('schools')">For schools</a>
    <a class="mobile-link" href="/for-universities/" onclick="event.preventDefault(); Eldava.go('universities')">For universities</a>
    <a class="mobile-link" href="/for-insurers/" onclick="event.preventDefault(); Eldava.go('insurers')">For insurers</a>
    <a class="mobile-link" href="/for-health-systems/" onclick="event.preventDefault(); Eldava.go('health-systems')">For health systems</a>
    <a class="mobile-link" href="/for-legal-and-solicitors/" onclick="event.preventDefault(); Eldava.go('legal')">For legal &amp; solicitors</a>
    <a class="mobile-link" href="/founding-500/" onclick="event.preventDefault(); Eldava.go('founding500')" style="color:var(--jade-bright);">Founding 500</a>
    <a class="mobile-link" href="/charity-partnership/" onclick="event.preventDefault(); Eldava.go('charity')">Charity partnership</a>
    <a class="mobile-link" href="/complete-pathway/" onclick="event.preventDefault(); Eldava.go('pathway')">The Complete Pathway</a>
    <a class="mobile-link" href="/pharmacy-delivery/" onclick="event.preventDefault(); Eldava.go('pharmacy')">Pharmacy delivery</a>
    <a class="mobile-link" href="/clinician-training-academy/" onclick="event.preventDefault(); Eldava.go('academy')">Training Academy</a>
    <a class="mobile-link" href="/guided-intake-technology/" onclick="event.preventDefault(); Eldava.go('ai')">Our intake technology</a>
    <a class="mobile-link" href="/outcomes-and-transparency/" onclick="event.preventDefault(); Eldava.go('outcomes')">Outcomes &amp; transparency</a>
    <a class="mobile-link" href="/insights/" onclick="event.preventDefault(); Eldava.go('blog')">Insights &amp; articles</a>
    <a class="mobile-link" href="/free-screening-tools/" onclick="event.preventDefault(); Eldava.go('screening')">Free screening tools</a>
    <a class="mobile-link" href="/founders-circle/" onclick="event.preventDefault(); Eldava.go('founders')">Founders Circle</a>
    <a class="mobile-link" href="/events/" onclick="event.preventDefault(); Eldava.go('events')">Events</a>
    <a class="mobile-link" href="/join-the-network/" onclick="event.preventDefault(); Eldava.go('partner')">Join the network</a>
    <a class="mobile-link" href="/about/" onclick="event.preventDefault(); Eldava.go('about')">About &amp; trust</a>
    <a class="mobile-link" href="/founders-note/" onclick="event.preventDefault(); Eldava.go('founder-note')">A note from the founder</a>
    <a class="mobile-link" href="mailto:care@eldava.com">care@eldava.com</a>
    <button class="btn btn-primary btn-block" style="margin-top:16px;" onclick="Eldava.openBooking()">Book a session</button>
  </div>
</header>

<main>

<!-- ============ HOME ============ -->
<div id="page-home" class="page-view active">

  <div class="trust-line" style="border-top:none;">
    <div class="wrap">
      <p>Every Eldava consultation is delivered live on video by a qualified clinician. Your assessment is conducted by a person, your report is signed by that person, and your results are explained to you in plain English.</p>
    </div>
  </div>

  <section class="cine">
    <div class="cine-mark"><svg viewBox="0 0 40 40" fill="none" aria-hidden="true"><circle cx="20" cy="20" r="18" stroke="currentColor" stroke-width="0.7"/><path d="M14 11v18M14 11h11M14 20h8.5M14 29h11" stroke="currentColor" stroke-width="0.9" stroke-linejoin="round"/></svg></div>
    <div class="wrap cine-content">
      <p class="eyebrow on-dark cine-kicker">Assessment, treatment and ongoing care</p>
      <h1><span>Get answers</span><span>in days,</span><span>not years.</span></h1>
      <p class="cine-sub">A global platform for specialist health assessments, from ADHD and autism to women's health, dementia, men's health and medico-legal reports, from <b id="heroFromPrice">£580</b>, plus the treatment, prescriptions and coaching that follow. Pay in full or spread it over 3 instalments. No waiting list, no GP referral needed for most bookings.</p>
      <div class="cine-country">
        <label class="cine-country-label" for="heroCountrySelect">We operate in 20 countries. Select yours:</label>
        <div class="cine-country-row">
          <span class="country-select">
            <svg class="country-select-icon" viewBox="0 0 24 24" fill="none" aria-hidden="true"><circle cx="12" cy="12" r="9" stroke="currentColor" stroke-width="1.6"/><path d="M3.5 12h17M12 3.5c2.6 2.5 3.9 5.3 3.9 8.5S14.6 18 12 20.5M12 3.5C9.4 6 8.1 8.8 8.1 12s1.3 5.5 3.9 8.5" stroke="currentColor" stroke-width="1.4"/></svg>
            <select id="heroCountrySelect" onchange="Eldava.setCountry(this.value)"></select>
            <svg class="country-select-chevron" viewBox="0 0 20 20" fill="none" aria-hidden="true"><path d="M5 8l5 5 5-5" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>
          </span>
          <span id="heroCountryNote" class="cine-country-note"></span>
        </div>
      </div>
      <div class="cine-cta">
        <button class="btn btn-primary" onclick="Eldava.openBooking()">Book your assessment</button>
        <button class="btn btn-ghost-dark" onclick="Eldava.openCarePathway()">Not sure yet? Get matched</button>
      </div>
      <div class="cine-proof">
        <div class="item"><div class="n">7.29M</div><div class="l">on the NHS waiting list</div></div>
        <div class="item"><div class="n">2&ndash;5 days</div><div class="l">our typical turnaround</div></div>
        <div class="item"><div class="n">20</div><div class="l">countries live now</div></div>
      </div>
    </div>
  </section>

  <div class="trust-line">
    <div class="wrap">
      <p>Every assessment is conducted by a clinician <b>registered with the relevant medical or psychology regulator in their country of practice</b>, checked before they join the network and re-verified on a regular basis.</p>
    </div>
  </div>

  <section>
    <div class="wrap">
      <div class="section-head">
        <h2>The wait is the problem, everywhere.</h2>
        <p class="desc">Public health systems around the world share the same failure across specialties: assessment queues measured in months and years, exactly where answers matter most.</p>
      </div>
      <div class="statstrip">
        <div class="cell"><div class="num">549K+</div><div class="lbl">Awaiting ADHD assessment, UK</div></div>
        <div class="cell"><div class="num">28.6 wks</div><div class="lbl">Median specialist wait, Canada</div></div>
        <div class="cell"><div class="num">18.7 mo</div><div class="lbl">Median autism wait, Australia</div></div>
        <div class="cell"><div class="num">8 years</div><div class="lbl">Average time to endometriosis diagnosis</div></div>
      </div>
      <p style="max-width:70ch; margin-top:24px; color:var(--text-soft); font-size:1.02rem; line-height:1.7;">UK ADHD and autism assessment backlogs alone have passed a million people combined, memory clinics routinely take months to see a new patient, and endometriosis takes an average of eight years from first symptoms to diagnosis. These are published figures, not opinions, and they are the reason Eldava exists across every specialty we cover, not only neurodevelopmental assessment. We do not replace public healthcare. We deliver the assessment now, in days not years, with a written report your doctor, your school, your employer, or your solicitor can use.</p>
      <button class="btn btn-ghost" style="margin-top:18px;" onclick="Eldava.go('pricing')">See every pathway we cover &rarr;</button>
    </div>
  </section>

  <section style="background:var(--stone-2); padding-top:0;">
    <div class="wrap">
      <div class="section-head">
        <h2>Three ways to start</h2>
        <p class="desc">Pick the door that fits where you are today.</p>
      </div>
      <div class="path-grid">
        <div class="path-card">
          <div class="ico">01</div>
          <h3>I know what I need</h3>
          <p>Browse every specialty and price, then book and pay in one flow. Most patients are seen within a week.</p>
          <button class="go" onclick="Eldava.go('pricing')" style="background:none;border:none;cursor:pointer;text-align:left;">Browse assessments &rarr;</button>
        </div>
        <div class="path-card">
          <div class="ico">02</div>
          <h3>I'm not sure yet</h3>
          <p>Answer a few guided questions about what's going on. We'll match you to the right assessment and show you a summary first.</p>
          <button class="go" onclick="Eldava.openCarePathway()" style="background:none;border:none;cursor:pointer;text-align:left;">Start guided pre-consultation &rarr;</button>
        </div>
        <div class="path-card">
          <div class="ico">03</div>
          <h3>I represent an organisation</h3>
          <p>Workplace screening, school and university partnerships, or insurer programmes, priced for volume.</p>
          <button class="go" onclick="Eldava.go('partner')" style="background:none;border:none;cursor:pointer;text-align:left;">See partnership options &rarr;</button>
        </div>
      </div>
    </div>
  </section>

  <section style="background:var(--stone-2);">
    <div class="wrap">
      <div class="section-head">
        <h2>We don't stop at the diagnosis.</h2>
        <p class="desc">A report on its own can be a dead end. Here, it's the start of a plan you can actually act on, whether that plan stays with us or moves to the right specialist.</p>
      </div>
      <div class="value-grid">
        <div class="value-card"><h4>Medication, where appropriate</h4><p>If your clinician judges medication is clinically indicated, they prescribe it themselves and follow up with you, rather than handing you a diagnosis and a shrug.</p></div>
        <div class="value-card"><h4>Prescription delivery</h4><p>Send it to a pharmacy of your choice or use our delivery partner network where available, with refill reminders so treatment doesn't quietly lapse.</p></div>
        <div class="value-card"><h4>Structured coaching</h4><p>The Complete Pathway package includes one-to-one coaching sessions built around your goals, not just your diagnosis.</p></div>
        <div class="value-card"><h4>Ongoing check-ins</h4><p>A scheduled annual review keeps your plan current instead of leaving you to figure out the next step alone.</p></div>
        <div class="value-card"><h4>A report built to be used</h4><p>Written to a standard schools, employers and most insurers accept, with your consent, so it does something once you have it.</p></div>
        <div class="value-card"><h4>A referral, when you need one</h4><p>Some patients need more than we treat directly, a surgical opinion, ongoing therapy, or a specialist GP for continuity of care. Email our care team and we'll route your case to the right live referral relationship for what you actually need, not a generic list that may not fit your situation.</p></div>
      </div>
      <div style="margin-top:28px; text-align:center;">
        <button class="btn btn-primary" onclick="Eldava.go('pathway')">See the Complete Pathway</button>
      </div>
    </div>
  </section>

  <section>
    <div class="wrap">
      <div class="bnpl-band">
        <div>
          <p class="eyebrow on-dark">Ways to pay</p>
          <h2>Pay in full, or spread it over 3.</h2>
          <p>Most assessments can be split into 3 interest-free instalments at checkout, so the price on the page is never the price you have to find all at once. Choose whichever works for you when you book.</p>
          <button class="btn btn-primary" style="margin-top:22px;" onclick="Eldava.openBooking()">See it at checkout</button>
        </div>
        <div class="bnpl-example">
          <p class="eyebrow on-dark" style="margin-bottom:10px;">Representative example</p>
          <div class="bnpl-row"><span class="k">Adult ADHD Assessment</span><span class="v" id="bnplExAmount">£685</span></div>
          <div class="bnpl-row"><span class="k">Pay in full</span><span class="v" id="bnplExFull">£685 today</span></div>
          <div class="bnpl-row"><span class="k">Pay in 3</span><span class="v" id="bnplExThree">3 &times; £228</span></div>
          <p class="bnpl-fine">Buy now, pay later is a form of credit. 0% interest over 3 instalments, first instalment taken at checkout. Missing a payment could affect your ability to get credit in future. Full terms are shown before you confirm.</p>
        </div>
      </div>
    </div>
  </section>

  <section style="padding-top:0;">
    <div class="wrap">
      <div class="mini-cta">
        <div><h4 style="margin-bottom:4px;">Every assessment gives back</h4><p style="color:var(--text-soft);">£5, or the local equivalent, goes to our dementia and fertility charity partners from every completed assessment. No round ups, no opt ins, no cap.</p></div>
        <button class="btn btn-ghost btn-sm" onclick="Eldava.go('charity')">How it works &rarr;</button>
      </div>
    </div>
  </section>

  <section style="padding-top:0;">
    <div class="wrap">
      <div class="cta-band">
        <h2>Book today, save 15%, and get your report in days.</h2>
        <button class="btn btn-primary" onclick="Eldava.openBooking()">Book a session</button>
      </div>
    </div>
  </section>

</div>

<!-- ============ PRICING ============ -->
<div id="page-pricing" class="page-view">
  <div class="page-hero">
    <div class="wrap">
      <p class="eyebrow on-dark">Assessments and pricing</p>
      <h2>Every specialty. One transparent price.</h2>
      <p>Prices shown in GBP for patients located in the United Kingdom, with local currency pricing shown at checkout elsewhere. Every price includes the clinical interview, validated screening tools and a full written report.</p>
      <div class="offer-strip">15% off every price below with code <span class="mono" id="priceStripCode">ELDAVA15</span>, for our first 2,000 patients</div>
      <p style="margin-top:14px; color:var(--void-soft); font-size:0.92rem;">Pay by card, Klarna, or PayPal. Every service can be spread across three monthly instalments where available in your country. No credit checks, no applications, no surprises.</p>
    </div>
  </div>
  <section>
    <div class="wrap">
      <div class="tabs" id="priceTabs" role="tablist" aria-label="Specialty categories"></div>
      <div class="price-table-wrap">
        <table class="price-table" id="priceTable">
          <thead><tr><th>Service</th><th>Duration</th><th>Price</th><th>Or from</th><th></th></tr></thead>
          <tbody id="priceTableBody"></tbody>
        </table>
      </div>
    </div>
  </section>
</div>

<!-- ============ FOUNDING 500 ============ -->
<div id="page-founding500" class="page-view">
  <div class="page-hero">
    <div class="wrap">
      <p class="eyebrow on-dark">Founding 500</p>
      <h2>Founding 500.</h2>
      <p>Before we open, we are offering five hundred prepaid assessment vouchers at founding pricing. Lock your price for life, use it whenever you are ready, or gift it to someone you love. When the five hundred are gone, or when we launch on 30 September 2026, founding pricing closes forever.</p>
      <div class="offer-strip">500 vouchers only &middot; founding pricing ends at launch, 30 September 2026</div>
    </div>
  </div>
  <section>
    <div class="wrap">
      <div class="service-grid">
        <div class="svc-card">
          <div class="name">Dementia Memory Assessment Voucher</div>
          <div class="desc">Full price £895</div>
          <div class="foot"><span class="price-now" style="font-size:1.15rem;">£695</span><button class="btn btn-primary btn-sm" onclick="Eldava.openBooking('Founding 500: Dementia Memory Assessment Voucher')">Book voucher</button></div>
        </div>
        <div class="svc-card">
          <div class="name">Fertility Advice plus Hormone Panel Voucher</div>
          <div class="desc">Full price £400</div>
          <div class="foot"><span class="price-now" style="font-size:1.15rem;">£345</span><button class="btn btn-primary btn-sm" onclick="Eldava.openBooking('Founding 500: Fertility Advice plus Hormone Panel Voucher')">Book voucher</button></div>
        </div>
        <div class="svc-card">
          <div class="name">Neurodivergent Assessment Voucher</div>
          <div class="desc">Full price £685</div>
          <div class="foot"><span class="price-now" style="font-size:1.15rem;">£545</span><button class="btn btn-primary btn-sm" onclick="Eldava.openBooking('Founding 500: Neurodivergent Assessment Voucher')">Book voucher</button></div>
        </div>
      </div>
      <p style="margin-top:22px; color:var(--text-soft); font-size:0.92rem;">Prices shown in GBP; full price shown at checkout in your local currency where you are located outside the UK. Vouchers are delivered digitally, giftable, and redeemable after launch. Pay by card, or three monthly instalments where available.</p>
      <div class="mini-cta" style="margin-top:24px;"><div><h4 style="margin-bottom:4px;" id="foundingCounter">500 of 500 remaining</h4><p style="color:var(--text-soft);">Updated as vouchers are confirmed, not a real-time feed.</p></div><button class="btn btn-primary" onclick="Eldava.go('pricing'); Eldava.filterPriceByCat('founding');">See all founding vouchers</button></div>
    </div>
  </section>
</div>

<!-- ============ HOW IT WORKS ============ -->
<div id="page-how" class="page-view">
  <div class="page-hero">
    <p class="eyebrow on-dark" style="margin-left:clamp(20px,5vw,56px);"></p>
    <div class="wrap">
      <p class="eyebrow on-dark">How it works</p>
      <h2>From booking to report in four steps.</h2>
      <p>The same clinical rigor as an in person assessment, delivered remotely, with a safety check built in from the start.</p>
    </div>
  </div>
  <section>
    <div class="wrap">
      <div class="steps">
        <div class="step"><span class="idx">01</span><h3>Book</h3><p>Choose your pathway, tell us where you are located, and pick your time. Pay by card, or spread it across three monthly instalments where available in your country. Evening and weekend appointments are available, and pricing and the next available clinician are shown before you pay.</p></div>
        <div class="step"><span class="idx">02</span><h3>Tell us a little more</h3><p>A short set of screening questions, including a mandatory safety check, makes sure the right clinician sees you.</p></div>
        <div class="step"><span class="idx">03</span><h3>Meet your clinician</h3><p>Your assessment happens live on video with a clinician licensed in your region. You talk to a qualified clinician, not a questionnaire.</p></div>
        <div class="step"><span class="idx">04</span><h3>Receive your report</h3><p>A written, signed report is delivered to your patient portal within the working days quoted at booking, ready to share with your doctor, school, employer, or solicitor. Your clinician explains the findings and what happens next.</p></div>
      </div>
      <div style="margin-top:36px; text-align:center;">
        <button class="btn btn-primary" onclick="Eldava.openCarePathway()">Start guided pre-consultation</button>
      </div>
    </div>
  </section>

  <section>
    <div class="wrap">
      <div class="section-head">
        <h2>What you actually receive</h2>
        <p class="desc">Every Eldava pathway ends with a written document you can use, not a verbal summary you have to remember.</p>
      </div>
      <div class="value-grid">
        <div class="value-card"><h4>A diagnostic assessment report</h4><p>For your GP, doctor, or memory clinic, written to DSM-5 or ICD-11 standards depending on the pathway.</p></div>
        <div class="value-card"><h4>An EHCP-ready report</h4><p>For school and local authority Education, Health and Care Plan applications.</p></div>
        <div class="value-card"><h4>A DSA-ready report</h4><p>For university Disabled Students' Allowance funding applications, or workplace needs assessments.</p></div>
        <div class="value-card"><h4>A signed capacity assessment</h4><p>For your solicitor, prepared to the standard Lasting Power of Attorney, deputyship, and Court of Protection work requires.</p></div>
        <div class="value-card"><h4>A monitoring plan</h4><p>For families tracking a mild cognitive impairment pathway, with a scheduled review built in.</p></div>
      </div>
      <div class="note-box">After your assessment, your report is attached to your confirmation email. If Eldava helped you get answers, we ask for one honest sentence you're comfortable sharing publicly, since that is what helps the next family find us. We never publish a review, quote or star rating without the person's explicit, verifiable sign-off.</div>
    </div>
  </section>

  <section style="background:var(--stone-2);">
    <div class="wrap">
      <div class="section-head">
        <h2>Why patients choose Eldava Health</h2>
        <p class="desc">Open each item for the detail.</p>
      </div>
      <div class="accordion" id="uspAccordion"></div>
    </div>
  </section>

  <section>
    <div class="wrap">
      <div class="section-head">
        <h2>Frequently asked questions</h2>
        <p class="desc">Everything patients ask before their first booking.</p>
      </div>
      <div class="accordion" id="faqAccordion"></div>
    </div>
  </section>
</div>

<!-- ============ COMPLETE PATHWAY ============ -->
<div id="page-pathway" class="page-view">
  <div class="page-hero">
    <div class="wrap">
      <p class="eyebrow on-dark">The Complete Pathway</p>
      <h2>From diagnosis to an ongoing plan, in one package.</h2>
      <p>Our most comprehensive package: a full diagnostic assessment, structured coaching, medication review where relevant, and ongoing check-ins, bundled at a lower combined price than booking each part separately.</p>
    </div>
  </div>
  <section>
    <div class="wrap">
      <div class="value-grid">
        <div class="value-card"><h4>Full diagnostic assessment</h4><p>60&ndash;90 minute consultation, validated screening tools, and a comprehensive written report.</p></div>
        <div class="value-card"><h4>Structured coaching</h4><p>A course of one-to-one sessions focused on goals, strategy and executive function support.</p></div>
        <div class="value-card"><h4>Medication review</h4><p>Where clinically indicated: an initial prescription and follow-up reviews with your clinician.</p></div>
        <div class="value-card"><h4>Objective testing add-on</h4><p>Optional computer-based attention testing and other objective measures, where available in your country.</p></div>
        <div class="value-card"><h4>Ongoing check-ins</h4><p>A scheduled annual review, plus refill reminders through our pharmacy delivery option.</p></div>
        <div class="value-card"><h4>Premium report</h4><p>A single consolidated report formatted for sharing with a workplace, school or insurer, with your consent.</p></div>
      </div>
    </div>
  </section>
  <section style="background:var(--stone-2);">
    <div class="wrap">
      <div class="section-head"><h2>Pricing</h2><p class="desc">Exact price depends on which elements you include and your country.</p></div>
      <table class="simple-table">
        <thead><tr><th>Package</th><th>Guide price</th><th>Payment</th></tr></thead>
        <tbody>
          <tr><td>The Complete Pathway</td><td><b>£2,250&ndash;£3,500</b></td><td>Pay in full, or split into 3 interest-free instalments</td></tr>
        </tbody>
      </table>
      <div class="note-box">Many private health insurers cover parts of this package. Ask our care team to check your policy before you book.</div>
      <div class="mini-cta"><div><h4 style="margin-bottom:4px;">Ask us about the Complete Pathway</h4><p style="color:var(--text-soft);">We'll confirm exact pricing for your country and needs.</p></div><button class="btn btn-primary" onclick="Eldava.openEnquiry('pathway')">Enquire now</button></div>
    </div>
  </section>
</div>

<!-- ============ PHARMACY ============ -->
<div id="page-pharmacy" class="page-view">
  <div class="page-hero">
    <div class="wrap">
      <p class="eyebrow on-dark">Pharmacy delivery</p>
      <h2>Your diagnosis, your prescription, delivered.</h2>
      <p>When medication is clinically indicated, we can route your prescription to a licensed pharmacy near you or to a delivery pharmacy in your country, so you are not left to sort out the next step alone.</p>
    </div>
  </div>
  <section>
    <div class="wrap">
      <div class="steps">
        <div class="step"><span class="idx">01</span><h3>Receive your diagnosis</h3><p>Your clinician confirms a diagnosis and, if clinically appropriate, issues a prescription.</p></div>
        <div class="step"><span class="idx">02</span><h3>Choose your pharmacy</h3><p>Send it to a pharmacy of your choice, or use our delivery partner network where available in your country.</p></div>
        <div class="step"><span class="idx">03</span><h3>Get it delivered or collect it</h3><p>Discreet packaging, tracked delivery where offered, and refill reminders so you don't run out.</p></div>
      </div>
    </div>
  </section>
  <section style="background:var(--stone-2);">
    <div class="wrap">
      <div class="section-head"><h2>Delivery options</h2><p class="desc">Availability varies by country. Exact options are confirmed at prescribing.</p></div>
      <table class="simple-table">
        <thead><tr><th>Option</th><th>Typical price</th><th>Notes</th></tr></thead>
        <tbody>
          <tr><td>Standard delivery</td><td><b>Included</b></td><td>Where offered, 3&ndash;5 business days</td></tr>
          <tr><td>Express delivery</td><td><b>From £5.99</b></td><td>1&ndash;2 business days, selected areas</td></tr>
          <tr><td>Collect in person</td><td><b>No extra charge</b></td><td>Send your prescription to any pharmacy you choose</td></tr>
        </tbody>
      </table>
      <div class="note-box">Pharmacy partners are independently owned and regulated by their national pharmacy authority (for example the GPhC in the UK). Eldava Health does not dispense medication itself. Where a private health insurer covers medication costs, ask our care team whether direct billing is available for your policy; this is confirmed case by case, not guaranteed for every insurer.</div>
    </div>
  </section>
  <section>
    <div class="wrap">
      <div class="section-head"><h2>Common questions</h2></div>
      <div class="accordion">
        <div class="acc-item" data-open="false"><button class="acc-trigger" onclick="Eldava.toggleAcc(this)">Do I need a prescription<span class="plus">+</span></button><div class="acc-panel"><div class="acc-panel-inner"><p>Yes. Medication is only ever prescribed where a licensed clinician judges it clinically appropriate, following your assessment.</p></div></div></div>
        <div class="acc-item" data-open="false"><button class="acc-trigger" onclick="Eldava.toggleAcc(this)">Can I use my own local pharmacy<span class="plus">+</span></button><div class="acc-panel"><div class="acc-panel-inner"><p>Yes. You can ask us to send your prescription to any pharmacy you prefer, or use a delivery option where one is available in your country.</p></div></div></div>
        <div class="acc-item" data-open="false"><button class="acc-trigger" onclick="Eldava.toggleAcc(this)">Who do I contact about my medication<span class="plus">+</span></button><div class="acc-panel"><div class="acc-panel-inner"><p>Your prescribing clinician remains responsible for your medication plan. Our care team can help with logistics and refill reminders.</p></div></div></div>
      </div>
    </div>
  </section>
  <section style="padding-top:0;"><div class="wrap"><div class="cta-band"><h2>Start with a diagnostic assessment</h2><button class="btn btn-primary" onclick="Eldava.openBooking()">Book a session</button></div></div></section>
</div>

<!-- ============ ACADEMY ============ -->
<div id="page-academy" class="page-view">
  <div class="page-hero">
    <div class="wrap">
      <p class="eyebrow on-dark">Clinician Training Academy</p>
      <h2>Structured training for ADHD and autism assessment.</h2>
      <p>Self-paced, online courses for licensed clinicians who want to build or deepen a specialism in neurodevelopmental assessment. Graduates who meet our clinical standards can apply to join the Eldava Health clinician network.</p>
    </div>
  </div>
  <section>
    <div class="wrap">
      <div class="value-grid">
        <div class="value-card"><h4>Built by specialists</h4><p>Course content is developed with practising psychiatrists, clinical psychologists and neurodevelopmental specialists, and follows recognised diagnostic frameworks including DSM-5-TR and ICD-11.</p></div>
        <div class="value-card"><h4>Self-paced, online</h4><p>Complete modules on your own schedule, with case studies and practical scoring exercises throughout.</p></div>
        <div class="value-card"><h4>A route onto the platform</h4><p>Graduates who hold an active licence and meet our credentialing checks can apply to see patients through Eldava Health.</p></div>
      </div>
    </div>
  </section>
  <section style="background:var(--stone-2);">
    <div class="wrap">
      <div class="section-head"><h2>Course catalogue</h2><p class="desc">Pricing shown in GBP. CPD logging varies by professional body; check your regulator's requirements.</p></div>
      <table class="simple-table">
        <thead><tr><th>Course</th><th>Length</th><th>Price</th></tr></thead>
        <tbody>
          <tr><td>Foundation: ADHD Assessment</td><td>6 weeks, self-paced</td><td><b>£750</b></td></tr>
          <tr><td>Foundation: Autism Assessment</td><td>6 weeks, self-paced</td><td><b>£850</b></td></tr>
          <tr><td>Advanced: ADHD and Autism Comorbidity</td><td>4 weeks, self-paced</td><td><b>£550</b></td></tr>
          <tr><td>Complete Pathway (all three, plus supervised practice)</td><td>16 weeks, self-paced</td><td><b>£1,500</b></td></tr>
        </tbody>
      </table>
      <div class="note-box">Entry requires an active professional licence recognised by your country's regulator (for example GMC, HCPC, AHPRA or equivalent). We review credentials before enrolment and again before any clinician joins the live platform.</div>
    </div>
  </section>
  <section>
    <div class="wrap">
      <div class="section-head"><h2>Who this is for</h2></div>
      <div class="value-grid">
        <div class="value-card"><h4>Generalists moving into a specialism</h4><p>Psychiatrists, clinical psychologists and paediatricians building assessment capability alongside existing practice.</p></div>
        <div class="value-card"><h4>Nurse prescribers and allied specialists</h4><p>Clinicians extending their scope of practice within what their registration and local rules permit.</p></div>
        <div class="value-card"><h4>Clinicians who want flexible, remote work</h4><p>A route to set your own hours by joining the Eldava Health network after training and credentialing.</p></div>
      </div>
      <div class="mini-cta"><div><h4 style="margin-bottom:4px;">Ready to enquire</h4><p style="color:var(--text-soft);">Tell us about your registration and specialty interest.</p></div><button class="btn btn-primary" onclick="Eldava.openEnquiry('clinician')">Register your interest</button></div>
    </div>
  </section>
</div>

<!-- ============ AI / TECHNOLOGY ============ -->
<div id="page-ai" class="page-view">
  <div class="page-hero">
    <div class="wrap">
      <p class="eyebrow on-dark">Our intake technology</p>
      <h2>A guided intake, so your clinician starts prepared.</h2>
      <p>Before your appointment, a structured set of questions gathers your concerns, history and a mandatory safety check, and organises it into a clinician-ready summary. It is a decision-support tool, not a diagnosis: your clinician reviews everything with you and makes the clinical call.</p>
    </div>
  </div>
  <section>
    <div class="wrap">
      <table class="simple-table">
        <thead><tr><th>Step</th><th>What happens</th></tr></thead>
        <tbody>
          <tr><td>Guided questions</td><td>Structured, branching questions about your main concern, duration and history</td></tr>
          <tr><td>Safety check</td><td>A mandatory check for risk to yourself; a positive answer routes you straight to crisis resources instead of the booking flow</td></tr>
          <tr><td>Summary</td><td>Your answers are organised into a short summary you can review before your appointment</td></tr>
          <tr><td>Clinician review</td><td>Your clinician reads the summary, asks follow-up questions live, and makes the diagnostic decision</td></tr>
        </tbody>
      </table>
      <div class="note-box">This tool structures and organises what you tell us; it does not generate a diagnosis and is not a substitute for the clinical interview.</div>
    </div>
  </section>
  <section style="padding-top:0;"><div class="wrap"><div class="cta-band"><h2>Try the guided pre-consultation</h2><button class="btn btn-primary" onclick="Eldava.openCarePathway()">Start now</button></div></div></section>
</div>

<!-- ============ OUTCOMES ============ -->
<div id="page-outcomes" class="page-view">
  <div class="page-hero">
    <div class="wrap">
      <p class="eyebrow on-dark">Outcomes &amp; transparency</p>
      <h2>How we measure ourselves.</h2>
      <p>What we track on every assessment, and how we report it.</p>
    </div>
  </div>
  <section>
    <div class="wrap">
      <div class="value-grid">
        <div class="value-card"><h4>What we measure from day one</h4><p>Time from booking to appointment, time from appointment to report, and patient-reported satisfaction after every assessment.</p></div>
        <div class="value-card"><h4>What we will publish, and when</h4><p>Once we have a meaningful sample size in a given country, we will publish aggregate turnaround times and satisfaction scores on this page, dated and sourced.</p></div>
      </div>
    </div>
  </section>
</div>

<!-- ============ CORPORATE ============ -->
<div id="page-corporate" class="page-view">
  <div class="page-hero">
    <div class="wrap">
      <p class="eyebrow on-dark">For employers</p>
      <h2>Neurodivergent talent is global. The wait for assessment is not.</h2>
      <p>Eldava delivers clinician led assessments for your team privately, quickly, and confidentially, with every employee matched to a clinician licensed where they live.</p>
    </div>
  </div>
  <section>
    <div class="wrap">
      <div class="value-grid">
        <div class="value-card"><h4>Confidential by design</h4><p>Individual results stay between the employee and their clinician. Employers receive only what an employee explicitly consents to share, or de-identified aggregate data.</p></div>
        <div class="value-card"><h4>Fast turnaround</h4><p>Most employee assessments are completed within days rather than the months typical of public waiting lists.</p></div>
        <div class="value-card"><h4>Practical guidance, not just a diagnosis</h4><p>Reports include workplace adjustment recommendations that line managers can act on.</p></div>
      </div>
    </div>
  </section>
  <section style="background:var(--stone-2);">
    <div class="wrap">
      <div class="section-head"><h2>Packages</h2><p class="desc">Prices shown in GBP as a starting guide; your invoice is issued in your local currency. Founding partners who sign before launch lock their pricing permanently.</p></div>
      <div class="enterprise-grid">
        <div class="enterprise-card"><h4>Essential</h4><p>10 staff assessments per year across neurodivergent and fertility pathways.</p><div class="foot"><span class="poa">£2,500 per year</span><button class="btn btn-ghost btn-sm" onclick="Eldava.openEnquiry('corporate')">Request a proposal</button></div></div>
        <div class="enterprise-card"><h4>Growth</h4><p>25 staff assessments per year, a manager guidance session, priority booking, and a named account contact.</p><div class="foot"><span class="poa">£5,000 per year</span><button class="btn btn-ghost btn-sm" onclick="Eldava.openEnquiry('corporate')">Request a proposal</button></div></div>
        <div class="enterprise-card"><h4>Enterprise</h4><p>An unlimited capped block across all pathways, quarterly reporting, and a launch event invitation for HR leadership.</p><div class="foot"><span class="poa">£12,000 per year</span><button class="btn btn-ghost btn-sm" onclick="Eldava.openEnquiry('corporate')">Request a proposal</button></div></div>
      </div>
      <div class="mini-cta"><div><h4 style="margin-bottom:4px;">Founding partners sign before launch and lock pricing permanently.</h4><p style="color:var(--text-soft);">Enquiries: <a href="mailto:telehealth@eldava.com">telehealth@eldava.com</a></p></div><button class="btn btn-primary" onclick="Eldava.openEnquiry('corporate')">Request a proposal</button></div>
    </div>
  </section>
</div>

<!-- ============ SCHOOLS ============ -->
<div id="page-schools" class="page-view">
  <div class="page-hero">
    <div class="wrap">
      <p class="eyebrow on-dark">For schools</p>
      <h2>SEN assessment support for schools and trusts.</h2>
      <p>Reduce the wait your pupils face for a specialist opinion, and give staff practical strategies alongside the report.</p>
    </div>
  </div>
  <section>
    <div class="wrap">
      <table class="simple-table">
        <thead><tr><th>Package</th><th>Description</th><th>Typical price</th></tr></thead>
        <tbody>
          <tr><td>School SEN assessment</td><td>Individual pupil assessment and report</td><td><b>£600&ndash;£1,200</b></td></tr>
          <tr><td>Multi-academy trust programme</td><td>Ongoing SEN support across a trust</td><td><b>£5,000&ndash;£20,000 / year</b></td></tr>
          <tr><td>Staff training</td><td>Recognising neurodivergence and classroom strategies</td><td><b>£1,500&ndash;£5,000</b></td></tr>
        </tbody>
      </table>
      <div class="mini-cta"><div><h4 style="margin-bottom:4px;">Talk to our education team</h4><p style="color:var(--text-soft);">Tell us your pupil numbers and current SEN process.</p></div><button class="btn btn-primary" onclick="Eldava.openEnquiry('schools')">Request a proposal</button></div>
    </div>
  </section>
</div>

<!-- ============ UNIVERSITIES ============ -->
<div id="page-universities" class="page-view">
  <div class="page-hero">
    <div class="wrap">
      <p class="eyebrow on-dark">For universities</p>
      <h2>Assessment access that keeps pace with the term.</h2>
      <p>Support students applying for Disabled Students' Allowance or equivalent support, without a year-long wait for a diagnostic report.</p>
    </div>
  </div>
  <section>
    <div class="wrap">
      <table class="simple-table">
        <thead><tr><th>Package</th><th>Description</th><th>Typical price</th></tr></thead>
        <tbody>
          <tr><td>Student screening</td><td>Discounted, prioritised student booking route</td><td><b>£175&ndash;£350</b></td></tr>
          <tr><td>University partnership</td><td>Dedicated portal and subsidised assessments for enrolled students</td><td><b>£10,000&ndash;£50,000 / year</b></td></tr>
          <tr><td>Staff training</td><td>Inclusive teaching and support strategies</td><td><b>£2,000&ndash;£7,500</b></td></tr>
        </tbody>
      </table>
      <div class="mini-cta"><div><h4 style="margin-bottom:4px;">Set up a student pathway</h4><p style="color:var(--text-soft);">We'll confirm the right documentation format for your funding body.</p></div><button class="btn btn-primary" onclick="Eldava.openEnquiry('universities')">Request a proposal</button></div>
    </div>
  </section>
</div>

<!-- ============ INSURERS ============ -->
<div id="page-insurers" class="page-view">
  <div class="page-hero">
    <div class="wrap">
      <p class="eyebrow on-dark">For insurers and health plans</p>
      <h2>Additional capacity for your members.</h2>
      <p>A telehealth assessment route that can sit alongside your existing network to reduce member waiting times, with reporting your team can use.</p>
    </div>
  </div>
  <section>
    <div class="wrap">
      <div class="value-grid">
        <div class="value-card"><h4>Faster access for members</h4><p>Remote scheduling removes the geography constraint of an in-person specialist network.</p></div>
        <div class="value-card"><h4>Clinical governance</h4><p>Every assessment is performed by a clinician licensed in the member's jurisdiction, under our published safety and escalation process.</p></div>
        <div class="value-card"><h4>Usable reporting</h4><p>Structured data and reporting formats can be agreed as part of onboarding, subject to data protection review on both sides.</p></div>
      </div>
      <div class="mini-cta"><div><h4 style="margin-bottom:4px;">Discuss a network arrangement</h4><p style="color:var(--text-soft);">Commercial terms are negotiated per contract.</p></div><button class="btn btn-primary" onclick="Eldava.openEnquiry('insurers')">Request a proposal</button></div>
    </div>
  </section>
</div>

<!-- ============ HEALTH SYSTEMS (NHS / ICB / public commissioners) ============ -->
<div id="page-health-systems" class="page-view">
  <div class="page-hero">
    <div class="wrap">
      <p class="eyebrow on-dark">For health systems</p>
      <h2>Working with health systems to clear the backlog.</h2>
      <p>Public commissioners everywhere face the same arithmetic: assessment demand has outgrown capacity. Eldava delivers clinician led telehealth assessment at a per-assessment unit cost below internal delivery, with full clinical governance and monthly reporting.</p>
    </div>
  </div>
  <section>
    <div class="wrap">
      <div class="section-head"><h2>How a pilot works</h2><p class="desc">We run structured 90 day pilots with measurable outcomes.</p></div>
      <div class="value-grid">
        <div class="value-card"><h4>Self-funding patients</h4><p>Patients who choose to pay privately are seen at zero cost to the commissioner.</p></div>
        <div class="value-card"><h4>Commissioner funded slots</h4><p>Billed per completed assessment, at a unit cost below internal delivery once agency staffing and waiting-time costs are included.</p></div>
        <div class="value-card"><h4>Monthly reporting</h4><p>Every pilot reports monthly on backlog cleared, patient satisfaction, and cost per completed assessment against your baseline.</p></div>
      </div>
      <div class="note-box">In the United Kingdom, we work with Integrated Care Boards and NHS trusts on 90 day pilots to clear tier 2 and tier 3 dementia and neurodevelopmental assessment backlog, under full clinical governance with a documented escalation route for red flag findings.</div>
      <div class="mini-cta"><div><h4 style="margin-bottom:4px;">One pilot. Ninety days. Measurable results.</h4><p style="color:var(--text-soft);">To discuss a pilot in your area, contact <a href="mailto:telehealth@eldava.com">telehealth@eldava.com</a>.</p></div><button class="btn btn-primary" onclick="Eldava.openEnquiry('health-systems')">Discuss a pilot</button></div>
    </div>
  </section>
</div>

<!-- ============ LEGAL & SOLICITORS ============ -->
<div id="page-legal" class="page-view">
  <div class="page-hero">
    <div class="wrap">
      <p class="eyebrow on-dark">For legal &amp; solicitors</p>
      <h2>Expert assessments for legal work.</h2>
      <p>Eldava delivers clinician conducted assessments to the standard legal work demands: mental capacity assessments, testamentary capacity, best interests assessments, and court ready expert witness reports with our clinician available for cross examination.</p>
    </div>
  </div>
  <section>
    <div class="wrap">
      <div class="value-grid">
        <div class="value-card"><h4>Mental capacity assessments</h4><p>For Lasting Power of Attorney and deputyship applications.</p></div>
        <div class="value-card"><h4>Testamentary capacity assessments</h4><p>Assessing capacity to make or amend a will.</p></div>
        <div class="value-card"><h4>Best interests assessments</h4><p>For care and treatment decisions, care plan reviews and discharge planning.</p></div>
        <div class="value-card"><h4>Medico-legal expert witness reports</h4><p>Prepared by an experienced clinician available for cross examination, instructed by solicitors, families, and deputies.</p></div>
      </div>
      <p style="max-width:70ch; margin-top:24px; color:var(--text-soft); font-size:1rem; line-height:1.7;">Capacity and legal requirements differ by jurisdiction. In every market we serve, we confirm whether your instruction falls within our clinicians' licensure before accepting it. We do not accept instructions we cannot deliver to standard.</p>
      <div class="note-box">In the United Kingdom, we deliver mental capacity assessments to the Court of Protection standard (COP3) for deputyship applications, Lasting Power of Attorney assessments, testamentary capacity, and section 4 Mental Capacity Act best interests assessments. Every report is prepared by an experienced clinician and issued directly to your firm. Medico-legal reports from £2,400.</div>
      <div class="mini-cta"><div><h4 style="margin-bottom:4px;">We understand court timetables. We do not miss them.</h4><p style="color:var(--text-soft);">Instructions and enquiries: <a href="mailto:telehealth@eldava.com">telehealth@eldava.com</a>.</p></div><button class="btn btn-primary" onclick="Eldava.openEnquiry('legal')">Send instructions</button></div>
    </div>
  </section>
</div>

<!-- ============ CHARITY PARTNERSHIP ============ -->
<div id="page-charity" class="page-view">
  <div class="page-hero">
    <div class="wrap">
      <p class="eyebrow on-dark">Charity partnership</p>
      <h2>Every assessment gives back.</h2>
      <p>Eldava donates £5, or the local equivalent, from every completed assessment to our charity partners in dementia and fertility. No round ups, no opt ins, no cap. Every assessment, automatically.</p>
    </div>
  </div>
  <section>
    <div class="wrap">
      <div class="value-grid">
        <div class="value-card"><h4>No round ups</h4><p>We do not ask patients to add anything at checkout. The donation is ours to make, from our own margin, on every completed assessment.</p></div>
        <div class="value-card"><h4>No opt ins</h4><p>There is no toggle to switch off and no separate consent needed. It happens by default, every time.</p></div>
        <div class="value-card"><h4>No cap</h4><p>The donation scales with volume. There is no annual ceiling where the commitment quietly stops.</p></div>
      </div>
      <div class="note-box">Our launch partners are announced at our launch event on 30 September 2026. Until they are named publicly, we are not going to claim a partnership that is not yet signed.</div>
    </div>
  </section>
</div>

<!-- ============ BLOG / INSIGHTS ============ -->
<div id="page-blog" class="page-view">
  <div class="page-hero">
    <div class="wrap">
      <p class="eyebrow on-dark">Insights &amp; articles</p>
      <h2>Straight answers on specialist assessment, across every pathway we cover.</h2>
      <p>Practical, fact-checked reading on diagnosis, waiting lists, workplace support and how Eldava Health works, written to help you make an informed decision, not to sell you one.</p>
    </div>
  </div>
  <section>
    <div class="wrap">
      <div class="tabs" id="blogTabs" role="tablist" aria-label="Article categories"></div>
      <div class="blog-grid" id="blogGrid"></div>
      <div class="note-box">Every article on this page is written in house and reviewed for accuracy. We link to the relevant professional or public health guidance where it exists, we don't cite studies we can't point to, and we update articles when the underlying guidance changes.</div>
    </div>
  </section>
</div>

<!-- ============ FOUNDERS CIRCLE ============ -->
<div id="page-founders" class="page-view">
  <div class="page-hero">
    <div class="wrap">
      <p class="eyebrow on-dark">Community</p>
      <h2>The Founders Circle.</h2>
      <p>A recognition programme for the clinicians, pharmacists and referral partners who join Eldava Health early enough to help shape it. This page describes what the programme actually offers today, and what's still being built.</p>
    </div>
  </div>
  <section>
    <div class="wrap">
      <div class="section-head"><h2>What Founders Circle membership means right now</h2><p class="desc">We'd rather list four real things than twelve invented ones.</p></div>
      <div class="value-grid">
        <div class="value-card"><h4>Founding member recognition</h4><p>A Founders Circle badge on your clinician or partner profile, and public credit as one of the people who helped build the platform from its earliest cohort.</p></div>
        <div class="value-card"><h4>Direct roadmap input</h4><p>A standing seat in the small group we consult before shipping changes to clinician tools, scheduling, or the assessment workflow. Your feedback gets a direct reply, not a ticket number.</p></div>
        <div class="value-card"><h4>Early access to new tools</h4><p>First access to new specialties, new country launches, and new clinician-facing tooling, ahead of general rollout, so you can tell us what's broken before every other clinician sees it.</p></div>
        <div class="value-card"><h4>A private founders channel</h4><p>Direct access to the clinical and product leads at Eldava Health, without going through general support.</p></div>
      </div>
    </div>
  </section>
  <section style="background:var(--stone-2);">
    <div class="wrap">
      <div class="section-head"><h2>Who's in the Founders Circle</h2></div>
      <div class="mini-cta" style="background:var(--card);">
        <div><h4 style="margin-bottom:4px;">Want to be considered for the founding cohort?</h4><p style="color:var(--text-soft);">Tell us about your background and we'll get back to you about eligibility and current openings.</p></div>
        <button class="btn btn-ghost btn-sm" onclick="Eldava.openEnquiry('clinician')">Apply to join</button>
      </div>
    </div>
  </section>
</div>

<!-- ============ EVENTS ============ -->
<div id="page-events" class="page-view">
  <div class="page-hero">
    <div class="wrap">
      <p class="eyebrow on-dark">Community</p>
      <h2>Events.</h2>
      <p>How we plan to bring clinicians, partners and patients together, online and in person, as the network grows.</p>
    </div>
  </div>
  <section>
    <div class="wrap">
      <div class="section-head"><h2>The kinds of events we're building toward</h2><p class="desc">Formats we're planning, not a confirmed calendar. We'll publish real dates here once they're booked.</p></div>
      <div class="value-grid">
        <div class="value-card"><h4>Monthly clinician roundtable</h4><p>A short online session for active clinicians to raise workflow issues directly with our clinical lead and hear what's changing next.</p></div>
        <div class="value-card"><h4>Quarterly webinar</h4><p>An open, public webinar on a specific topic, such as adult ADHD assessment or supporting autistic university students, aimed at clinicians and the public.</p></div>
        <div class="value-card"><h4>Regional partner meetups</h4><p>Small in-person meetups for clinicians and referral partners in a given city or region, once we have enough active members there to justify one.</p></div>
        <div class="value-card"><h4>An annual summit</h4><p>A larger annual gathering for the network, once the platform and community are established enough to support one properly.</p></div>
      </div>
    </div>
  </section>
  <section style="background:var(--stone-2);">
    <div class="wrap">
      <div class="section-head"><h2>Want to hear about the first one?</h2><p class="desc">We'll only contact you when there's a real event to invite you to.</p></div>
      <div class="mini-cta"><div><h4 style="margin-bottom:4px;">Register interest</h4><p style="color:var(--text-soft);">Tell us whether you're a patient, clinician or partner, and which region you're in, and we'll let you know when something is confirmed near you.</p></div><button class="btn btn-primary" onclick="Eldava.openEnquiry('testimonial')">Register interest</button></div>
    </div>
  </section>
</div>

<!-- ============ PARTNER WITH US ============ -->
<div id="page-partner" class="page-view">
  <div class="page-hero">
    <div class="wrap">
      <p class="eyebrow on-dark">Join the network</p>
      <h2>One platform. Five different ways in.</h2>
      <p>Whether you're a licensed clinician, a pharmacist, a referral partner, a trainee on a recognised clinical pathway, or you build software for a living, there's a route into Eldava Health that fits. Tell us who you are.</p>
    </div>
  </div>

  <section>
    <div class="wrap">
      <div class="role-grid" role="tablist" aria-label="Choose your role">
        <button class="role-card" aria-selected="true" onclick="Eldava.switchPartner(this,'clin')">
          <span class="rc-tag">Clinicians</span><h4>I am a licensed clinician</h4><p>Psychiatrists, clinical psychologists, paediatricians and allied specialists.</p>
        </button>
        <button class="role-card" aria-selected="false" onclick="Eldava.switchPartner(this,'pharma')">
          <span class="rc-tag">Prescribing</span><h4>I am a pharmacist or nurse prescriber</h4><p>Independent and supplementary prescribers building a remote caseload.</p>
        </button>
        <button class="role-card" aria-selected="false" onclick="Eldava.switchPartner(this,'student')">
          <span class="rc-tag">Training</span><h4>I am training or newly qualified</h4><p>On a recognised clinical pathway and building toward assessment work.</p>
        </button>
        <button class="role-card" aria-selected="false" onclick="Eldava.switchPartner(this,'org')">
          <span class="rc-tag">Institutions</span><h4>I am a referral or enterprise partner</h4><p>HR teams, SENCOs, university disability services, insurers.</p>
        </button>
        <button class="role-card" aria-selected="false" onclick="Eldava.switchPartner(this,'tech')">
          <span class="rc-tag">Technology</span><h4>I build software or work with data</h4><p>Engineers, data scientists and product people.</p>
        </button>
      </div>

      <!-- CLINICIANS -->
      <div id="partnerClin" class="subpage active" style="margin-top:36px;">
        <div class="panel dark">
          <p class="eyebrow">For licensed clinicians</p>
          <h3>A turnkey practice, not just a booking</h3>
          <p class="desc">Set your own hours and work across the markets your registration allows. We handle scheduling, intake, billing and admin, and route patients to you, so your time goes on the assessment itself.</p>
          <div class="panel-list">
            <div class="row"><span class="k"></span><span>A structured guided pre-consultation summary before every session, so you are not starting from a blank chart</span></div>
            <div class="row"><span class="k"></span><span>Flexible caseload, no minimum hours, and no requirement to give up existing practice</span></div>
            <div class="row"><span class="k"></span><span>Access to patients across the countries your registration covers</span></div>
            <div class="row"><span class="k"></span><span>Clear, transparent compensation, confirmed in full during your application, before you commit to anything</span></div>
          </div>
          <button class="btn btn-primary" onclick="Eldava.openEnquiry('clinician')">Apply as a clinician</button>
        </div>
      </div>

      <!-- PHARMACISTS / NURSE PRESCRIBERS -->
      <div id="partnerPharma" class="subpage">
        <div class="panel dark">
          <p class="eyebrow">For pharmacists and nurse prescribers</p>
          <h3>Build remote prescribing experience, with infrastructure already in place</h3>
          <p class="desc">Where your qualification and local regulation permit independent or supplementary prescribing, our pharmacy delivery infrastructure and patient pipeline give you a running start rather than a blank slate.</p>
          <div class="panel-list">
            <div class="row"><span class="k"></span><span>An existing patient pipeline and pharmacy delivery workflow to plug into, so you are not building logistics from scratch</span></div>
            <div class="row"><span class="k"></span><span>Ongoing professional development as remote and cross-border prescribing pathways continue to evolve in your country</span></div>
            <div class="row"><span class="k"></span><span>Scope of practice is always governed by your registration and the rules in the country where the patient is located, never by us</span></div>
          </div>
          <button class="btn btn-primary" onclick="Eldava.openEnquiry('pharmacist')">Register your interest</button>
        </div>
      </div>

      <!-- STUDENTS / TRAINEES -->
      <div id="partnerStudent" class="subpage">
        <div class="panel dark">
          <p class="eyebrow">For trainees on a recognised clinical pathway</p>
          <h3>Train, qualify, and start building a caseload</h3>
          <p class="desc">Our Training Academy is for people already on a recognised clinical training route (for example psychiatry, clinical psychology or specialist nursing) who want to add ADHD or autism assessment as a specialism. It is not a route into unlicensed practice.</p>
          <div class="panel-list">
            <div class="row"><span class="k">1</span><span>Complete Foundation and Advanced training through the Training Academy, self-paced, alongside your existing studies or role</span></div>
            <div class="row"><span class="k">2</span><span>Meet our credentialing checks, which confirm your active professional registration</span></div>
            <div class="row"><span class="k">3</span><span>Get matched with your first patients through the network once you're credentialed</span></div>
          </div>
          <button class="btn btn-primary" onclick="Eldava.go('academy')">See Training Academy courses</button>
        </div>
      </div>

      <!-- REFERRAL / ENTERPRISE -->
      <div id="partnerOrg" class="subpage">
        <div class="section-head" style="margin-bottom:20px;">
          <h2 style="font-size:1.4rem;">A single door into every institutional programme</h2>
          <p class="desc">Whichever team you represent, request a proposal here and we route it to the right programme.</p>
        </div>
        <div class="enterprise-grid">
          <div class="enterprise-card">
            <h4>Workplace neurodiversity screening</h4>
            <p>Organisation wide screening and individual workplace needs assessments, with manager guidance and reasonable adjustment recommendations.</p>
            <div class="foot"><span class="poa">Priced by headcount</span><button class="btn btn-ghost btn-sm" onclick="Eldava.go('corporate')">See employer programmes</button></div>
          </div>
          <div class="enterprise-card">
            <h4>School and multi-academy trust support</h4>
            <p>In-school observation, SEN assessment and staff training, scoped for a single school or a whole trust.</p>
            <div class="foot"><span class="poa">Priced by pupil numbers</span><button class="btn btn-ghost btn-sm" onclick="Eldava.go('schools')">See school programmes</button></div>
          </div>
          <div class="enterprise-card">
            <h4>University student assessment partnership</h4>
            <p>A dedicated booking route for students, with subsidised pricing and evidence formatted for disabled students' allowance applications.</p>
            <div class="foot"><span class="poa">Priced by student numbers</span><button class="btn btn-ghost btn-sm" onclick="Eldava.go('universities')">See university programmes</button></div>
          </div>
          <div class="enterprise-card">
            <h4>Insurer and NHS trust partnership</h4>
            <p>In-network billing for private insurers, or additional capacity for an NHS trust working through its waiting list.</p>
            <div class="foot"><span class="poa">Negotiated per contract</span><button class="btn btn-ghost btn-sm" onclick="Eldava.go('insurers')">See insurer programmes</button></div>
          </div>
        </div>
      </div>

      <!-- TECHNOLOGY & DATA -->
      <div id="partnerTech" class="subpage">
        <div class="panel dark">
          <p class="eyebrow">For engineers, data scientists and product people</p>
          <h3>Hard problems, at genuine multi-country scale</h3>
          <p class="desc">We are a small technical team working on real constraints: routing patients to the right licensed clinician across 20 countries' worth of registration rules, keeping clinical data secure and consent-governed, and building intake tools that make a clinician's first minute with a patient more useful, not less human.</p>
          <div class="panel-list">
            <div class="row"><span class="k"></span><span>Small team, high ownership, decisions made close to the people building the product</span></div>
            <div class="row"><span class="k"></span><span>Healthcare-grade data governance from day one, not bolted on later</span></div>
            <div class="row"><span class="k"></span><span>We are early and lean; this suits people who want to build core infrastructure, not join a large existing team</span></div>
          </div>
          <button class="btn btn-primary" onclick="Eldava.openEnquiry('tech')">Register your interest</button>
        </div>
      </div>
    </div>
  </section>

  <section style="background:var(--stone-2);">
    <div class="wrap">
      <div class="section-head"><h2>How long does assessment training actually take</h2><p class="desc">Realistic expectations, not a marketing number.</p></div>
      <p style="max-width:70ch; color:var(--text-soft); font-size:0.98rem; line-height:1.7;">Across the industry, initial workshop-style training for ADHD or autism assessment tools is commonly measured in days, while reaching independent clinical competency, the point at which a clinician can reliably conduct and score assessments unsupervised, is commonly measured in months of supervised practice, and reaching the highest research-grade reliability standards can take significantly longer. We would rather set that expectation clearly than imply a multi-day course alone makes someone an independent assessor.</p>
      <table class="simple-table" style="margin-top:24px;">
        <thead><tr><th>Stage</th><th>Typical timeframe</th><th>What it covers</th></tr></thead>
        <tbody>
          <tr><td>Initial workshop or course</td><td><b>Days, not weeks</b></td><td>Core diagnostic framework, tools and scoring introduction</td></tr>
          <tr><td>Independent clinical competency</td><td><b>Several months</b></td><td>Supervised practice until you can reliably conduct and score assessments alone</td></tr>
          <tr><td>Full research-grade reliability</td><td><b>Longer still</b></td><td>Formal reliability certification, where a specific tool requires it</td></tr>
        </tbody>
      </table>
      <div class="note-box">Our own Training Academy is structured as Foundation courses (6 weeks, self-paced, around 20 CPD hours each), an Advanced comorbidity course (4 weeks), and a Complete Pathway (16 weeks) that folds in supervised practice hours rather than leaving it to chance after the course ends. See the <button onclick="Eldava.go('academy')" style="background:none;border:none;color:var(--jade-deep);text-decoration:underline;cursor:pointer;padding:0;font:inherit;">Training Academy</button> page for the full course catalogue and pricing.</div>
    </div>
  </section>

  <section style="background:var(--stone-2);">
    <div class="wrap">
      <div class="section-head"><h2>Further training, independently verified</h2><p class="desc">Recognised external programmes for clinicians who want formal credentials beyond our own Academy. We checked these directly against each provider's own published page before listing them here.</p></div>
      <table class="simple-table">
        <thead><tr><th>Programme</th><th>Provider</th><th>Duration</th><th>Published fee</th></tr></thead>
        <tbody>
          <tr><td>DISCO autism assessment training</td><td><a href="https://www.autism.org.uk/learn/what-we-do/training/the-disco-training" target="_blank" rel="noopener">National Autistic Society, Lorna Wing Centre</a></td><td>4 days over 2 stages</td><td>£2,195 + VAT</td></tr>
          <tr><td>PGCert in Adult Autism Assessment</td><td><a href="https://nspc.org.uk/course-directory/pgcert-in-adult-autism-assessment/" target="_blank" rel="noopener">New School of Psychotherapy and Counselling</a></td><td>1 year, online with placement</td><td>£2,280 (theory) + £2,380 (placement)</td></tr>
          <tr><td>ADOS-2 introductory or clinical workshop</td><td><a href="https://drexel.edu/autisminstitute/training-clinical-services-hub/programs/ADOS-2/" target="_blank" rel="noopener">A.J. Drexel Autism Institute</a></td><td>2 or 3 days</td><td>$650 (2-day) or $950 (3-day, with toddler module)</td></tr>
          <tr><td>Postgraduate Practice Certificate in Independent Prescribing</td><td><a href="https://www.wlv.ac.uk/courses/postgraduate-credit-practice-certificate-in-independent-prescribing/" target="_blank" rel="noopener">University of Wolverhampton</a></td><td>6 months, part-time</td><td>£2,448 per year (2026&ndash;27, home students)</td></tr>
        </tbody>
      </table>
      <div class="note-box">These are independent, third-party programmes. Eldava Health has no partnership, referral fee, sponsorship or commercial relationship with any of the providers listed above; they are included purely as a starting point for your own research. Fees and dates change, so always confirm current details directly with the provider before applying. Listing a programme here is not an endorsement of it over any equivalent programme we haven't listed.</div>
    </div>
  </section>

  <section>
    <div class="wrap">
      <div class="section-head"><h2>What people say once they've joined</h2></div>
      <div class="mini-cta" style="background:var(--card);">
        <div><h4 style="margin-bottom:4px;">Already working with us?</h4><p style="color:var(--text-soft);">If you're a clinician, partner or trainee and you're willing to be quoted by name, tell us and we'll add your story here, credited and dated.</p></div>
        <button class="btn btn-ghost btn-sm" onclick="Eldava.openEnquiry('testimonial')">Share your story</button>
      </div>
    </div>
  </section>
</div>

<!-- ============ ABOUT ============ -->
<div id="page-about" class="page-view">
  <div class="page-hero">
    <div class="wrap">
      <p class="eyebrow on-dark">About &amp; trust</p>
      <h2>Built around clinical discipline, not just low prices.</h2>
      <p>Speed and value come from removing friction, not from cutting corners. Read <button onclick="Eldava.go('founder-note')" style="background:none;border:none;color:var(--jade-bright);text-decoration:underline;cursor:pointer;padding:0;font:inherit;">a note from our founder</button> on why this platform exists.</p>
    </div>
  </div>

  <section>
    <div class="wrap">
      <div class="section-head"><h2>Why we exist</h2><p class="desc">The gap we are trying to close.</p></div>
      <p style="max-width:70ch; font-size:1.05rem; color:var(--text-soft); line-height:1.7;">Millions of people are waiting months or years for a specialist assessment through public healthcare systems, not because their need isn't real, but because capacity has not kept pace with demand. Eldava Health exists to give people a faster, clinically sound route to a diagnosis, delivered by licensed clinicians rather than by cutting the clinical process short. We measure ourselves on whether patients get a properly conducted assessment quickly, not just quickly.</p>
      <div class="value-grid" style="margin-top:32px;">
        <div class="value-card"><h4>Clinical rigor first</h4><p>Every design decision, from the intake questions to the booking flow, is built around the licensed clinician's judgement, not around it.</p></div>
        <div class="value-card"><h4>Honesty in what we claim</h4><p>We would rather say "we don't have that data yet" than publish a number we can't stand behind. See our <button onclick="Eldava.go('outcomes')" style="background:none;border:none;color:var(--jade-deep);text-decoration:underline;cursor:pointer;padding:0;font:inherit;">outcomes and transparency page</button>.</p></div>
        <div class="value-card"><h4>Built for the long term</h4><p>We are a new platform. We would rather grow carefully across a small number of well-regulated markets than overclaim reach we don't have yet.</p></div>
      </div>
    </div>
  </section>

  <section style="background:var(--stone-2); padding-top:0;">
    <div class="wrap">
      <div class="trust-grid">
        <div class="trust-card"><h4>Licensed clinicians only</h4><p>Every assessment is conducted by a clinician holding an active registration recognised in the country where you are located, for example GMC or HCPC in the UK.</p></div>
        <div class="trust-card"><h4>Assisted intake, human diagnosis</h4><p>Structured intake tools speed up scoring and paperwork. The diagnosis and the final report are always made and signed by your treating clinician.</p></div>
        <div class="trust-card"><h4>Encrypted, consent based data sharing</h4><p>Consultations run over encrypted video. Your report is shared with your GP or another professional only with your consent, unless the law requires otherwise.</p></div>
      </div>
    </div>
  </section>

  <section>
    <div class="wrap">
      <div class="section-head"><h2>Clinical governance</h2><p class="desc">How the clinical model is actually run.</p></div>
      <p style="max-width:70ch; font-size:1.02rem; color:var(--text-soft); line-height:1.7;">Eldava is clinician led. Every assessment follows a structured clinical protocol, every report is reviewed before release, and every red flag finding is escalated with a clear referral pathway. All consultations are delivered online by video. Where a condition requires physical examination, we say so and we refer. We do not diagnose remotely what cannot responsibly be diagnosed remotely.</p>
    </div>
  </section>

  <section style="background:var(--stone-2); padding-top:0;">
    <div class="wrap">
      <div class="section-head"><h2>Meet the Clinical Director</h2><p class="desc">Clinical leadership, not product management.</p></div>
      <div class="value-grid" style="grid-template-columns:220px 1fr; align-items:start;">
        <div class="value-card" style="align-items:center; text-align:center; justify-content:center; min-height:220px;">
          <div style="width:120px; height:120px; border-radius:50%; background:var(--stone-2); border:1px dashed var(--line); display:flex; align-items:center; justify-content:center; margin:0 auto; color:var(--text-soft); font-size:0.72rem; text-align:center; padding:8px;">Photograph to follow</div>
        </div>
        <div class="value-card">
          <h4>Divine Losi, Clinical Director</h4>
          <p>Divine leads Eldava's clinical model across dementia, fertility, neurodivergent, and mental health pathways. Every protocol, every report standard, and every escalation route on this platform sits under clinical leadership, not product management.</p>
          <p style="margin-top:10px; font-size:0.82rem; color:var(--text-soft); font-style:italic;">Registration body, registration number and full biography to be added ahead of public launch. We do not publish a credential we have not verified.</p>
        </div>
      </div>
    </div>
  </section>

  <section>
    <div class="wrap">
      <div class="section-head"><h2>Who we work with</h2><p class="desc">The relationships behind the platform, described honestly.</p></div>
      <div class="value-grid">
        <div class="value-card"><h4>Patients</h4><p>The people booking assessments, whose experience and safety come first in every product decision, including the mandatory safety check before any booking.</p></div>
        <div class="value-card"><h4>Clinicians</h4><p>Licensed psychiatrists, clinical psychologists and allied specialists who conduct every assessment and hold final clinical responsibility for every diagnosis.</p></div>
        <div class="value-card"><h4>Employers, schools and universities</h4><p>Organisations giving their people or students faster access to assessment, on the partnership terms set out on our <button onclick="Eldava.go('corporate')" style="background:none;border:none;color:var(--jade-deep);text-decoration:underline;cursor:pointer;padding:0;font:inherit;">employer</button>, <button onclick="Eldava.go('schools')" style="background:none;border:none;color:var(--jade-deep);text-decoration:underline;cursor:pointer;padding:0;font:inherit;">school</button> and <button onclick="Eldava.go('universities')" style="background:none;border:none;color:var(--jade-deep);text-decoration:underline;cursor:pointer;padding:0;font:inherit;">university</button> pages.</p></div>
      </div>
    </div>
  </section>
  <section style="background:var(--stone-2); padding-top:0;">
    <div class="wrap">
      <div class="section-head">
        <h2>Live in 20 countries</h2>
        <p class="desc">Each market operates under its own clinician registration and telehealth rules.</p>
      </div>
      <div class="country-strip">
        <div class="country-chip"><div class="flag">🇬🇧</div><div class="cname">United Kingdom</div><div class="cwait">7.29M waiting</div><div class="cnote">Diagnosis only services, no NHS wait</div></div>
        <div class="country-chip"><div class="flag">🇺🇸</div><div class="cname">United States</div><div class="cwait">43 state reach</div><div class="cnote">PSYPACT licensed psychologists, IMLC psychiatrists</div></div>
        <div class="country-chip"><div class="flag">🇨🇦</div><div class="cname">Canada</div><div class="cwait">28.6 wk median</div><div class="cnote">Ontario, British Columbia, Alberta</div></div>
        <div class="country-chip"><div class="flag">🇦🇺</div><div class="cname">Australia</div><div class="cwait">18.7 mo paediatric</div><div class="cnote">AHPRA national registration</div></div>
        <div class="country-chip"><div class="flag">🇩🇪</div><div class="cname">Germany</div><div class="cwait">2+ yr autism wait</div><div class="cnote">Videosprechstunde billed consultations</div></div>
        <div class="country-chip"><div class="flag">🇮🇪</div><div class="cname">Ireland</div><div class="cwait">24.9 mo average</div><div class="cnote">EU registered doctors via telemedicine</div></div>
        <div class="country-chip"><div class="flag">🇳🇿</div><div class="cname">New Zealand</div><div class="cwait">Specialist shortage</div><div class="cnote">Aligned with the AU registration pathway</div></div>
        <div class="country-chip"><div class="flag">🇸🇬</div><div class="cname">Singapore</div><div class="cwait">3 to 6 mo wait</div><div class="cnote">Telehealth forward regulatory stance</div></div>
        <div class="country-chip"><div class="flag">🇸🇪</div><div class="cname">Sweden</div><div class="cwait">67 day median</div><div class="cnote">Telehealth approved nationally</div></div>
        <div class="country-chip"><div class="flag">🇦🇪</div><div class="cname">UAE</div><div class="cwait">6 to 12 mo wait</div><div class="cnote">Large private pay population</div></div>
      </div>
    </div>
  </section>
  <section id="contact">
    <div class="wrap">
      <div class="section-head">
        <h2>Get in touch</h2>
        <p class="desc">Two offices, one global platform.</p>
      </div>
      <div class="trust-grid">
        <div class="trust-card"><h4>London</h4><p>United Kingdom<br>Registered office address available on request and on our terms of business.</p></div>
        <div class="trust-card"><h4>New York</h4><p>United States<br>Registered office address available on request and on our terms of business.</p></div>
      </div>
      <table class="simple-table" style="margin-top:24px;">
        <thead><tr><th>For</th><th>Email</th></tr></thead>
        <tbody>
          <tr><td>Patients and booking queries</td><td><a href="mailto:patients@eldava.com">patients@eldava.com</a></td></tr>
          <tr><td>Clinicians and the Training Academy</td><td><a href="mailto:clinicians@eldava.com">clinicians@eldava.com</a></td></tr>
          <tr><td>Employers, schools, universities and insurers</td><td><a href="mailto:partnerships@eldava.com">partnerships@eldava.com</a></td></tr>
          <tr><td>Press and media</td><td><a href="mailto:press@eldava.com">press@eldava.com</a></td></tr>
          <tr><td>Everything else</td><td><a href="mailto:hello@eldava.com">hello@eldava.com</a></td></tr>
        </tbody>
      </table>
      <div class="note-box">We aim to reply to patient and clinician emails within one business day, and to partnership and press enquiries within two. Anything clinically urgent should go through your treating clinician or local emergency services, not email.</div>
    </div>
  </section>
</div>

<!-- ============ FOUNDER NOTE ============ -->
<div id="page-founder-note" class="page-view">
  <div class="page-hero">
    <div class="wrap">
      <p class="eyebrow on-dark">About Eldava Health</p>
      <h2>A note from the founder.</h2>
      <p>Why I built this, and what I'm asking of the people who join us.</p>
    </div>
  </div>
  <section>
    <div class="wrap" style="max-width:70ch;">
      <p style="font-size:1.15rem; color:var(--text); line-height:1.7;">I found out about this problem completely by accident. I was getting my tyres fixed in Essex and ended up in conversation with a doctor who happened to be there. That conversation kept going, and it turned into a much bigger picture: people waiting years, not weeks, for a proper assessment. Not just for ADHD and autism, but for dementia, for women's health, for all kinds of specialist care. The more I looked, the more I realised it wasn't a one-off problem in one place. It was the same pattern, repeating in country after country.</p>
      <p style="margin-top:20px; color:var(--text-soft); line-height:1.75;">I saw a problem, and I decided to build a solution. That's the whole reason Eldava Health exists.</p>
      <p style="margin-top:20px; color:var(--text-soft); line-height:1.75;">A proper assessment can save a life, when it catches something serious early enough for a clinician to act on it. It can also change how someone actually lives and works day to day. Once you know your own strengths and weaknesses, whether that's an ADHD diagnosis, an autism assessment, or a memory check for a parent you're worried about, you can plan around them instead of guessing. That's the outcome we're building this platform towards, for every patient who uses it.</p>

      <h2 style="margin-top:48px;">What we're building</h2>
      <p style="margin-top:12px; color:var(--text-soft); line-height:1.75;">Eldava Health connects patients with licensed clinicians for remote diagnostic assessment. Structured intake tools handle the organisation and paperwork so clinicians can spend their time on the clinical interview and the diagnosis itself, which are always theirs to make, never automated. Patients get a faster route to an assessment. Clinicians get a flexible way to practise, without the overhead of running their own clinic.</p>
      <p style="margin-top:12px; color:var(--text-soft); line-height:1.75;">Our Clinical Director, Divine Losi, is in charge of the platform's clinical model, across dementia, fertility, neurodivergent, and mental health pathways alike. Every protocol, every report standard, and every escalation route on this platform sits under clinical leadership, not under me.</p>
      <p style="margin-top:12px; color:var(--text-soft); line-height:1.75;">We are new. We don't have years of outcomes data behind us yet, and I'd rather say that plainly than imply otherwise. What we do have is a clear standard: every assessment is conducted by a clinician holding an active registration recognised in their country, every diagnosis is theirs and theirs alone, and we report honestly on what we know and what we don't.</p>

      <h2 style="margin-top:48px;">To everyone this is for</h2>
      <p style="margin-top:12px; color:var(--text-soft); line-height:1.75;">To every patient waiting for answers: you are not a number on a list. To every clinician who has felt boxed in by admin: this platform is built to give you more time with patients, not less. Nobody should face a health journey without support.</p>
      <p style="margin-top:12px; color:var(--text-soft); line-height:1.75;">If you're a clinician who wants to be part of building this properly, look at the <button onclick="Eldava.go('founders')" style="background:none;border:none;color:var(--jade-deep);text-decoration:underline;cursor:pointer;padding:0;font:inherit;">Founders Circle</button>. If you're a patient who needs an assessment, you can <button onclick="Eldava.openBooking()" style="background:none;border:none;color:var(--jade-deep);text-decoration:underline;cursor:pointer;padding:0;font:inherit;">book one directly</button>. If you're a potential partner, our <button onclick="Eldava.go('about')" style="background:none;border:none;color:var(--jade-deep);text-decoration:underline;cursor:pointer;padding:0;font:inherit;">About page</button> has the right contact for your team.</p>

      <div class="note-box" style="margin-top:40px; font-style:italic;">"I saw the pain, and I decided to fix it."</div>
      <p style="margin-top:16px; font-weight:700;">Jayden Ohen<br><span style="font-weight:400; color:var(--text-soft);">Founder, Eldava Health. London, UK.</span></p>
    </div>
  </section>
</div>

<!-- ============ REGISTER / LOG IN ============ -->
<div id="page-register" class="page-view">
  <div class="page-hero">
    <div class="wrap">
      <p class="eyebrow on-dark">Create your account</p>
      <h2>One account. Assessment, treatment and ongoing care.</h2>
      <p>We ask for this once, before your guided pre-consultation or booking, so your report, prescriptions and appointments all live in one secure place instead of scattered across emails.</p>
    </div>
  </div>
  <section>
    <div class="wrap" style="max-width:520px;">
      <div class="reg-card">
        <div class="reg-tabs">
          <button type="button" id="regTabCreate" class="reg-tab active" onclick="Eldava.setRegMode('create')">Create account</button>
          <button type="button" id="regTabLogin" class="reg-tab" onclick="Eldava.setRegMode('login')">Log in</button>
        </div>

        <form id="regFormCreate" onsubmit="Eldava.submitRegister(event)">
          <div class="frow"><label for="regName">Full name</label><input id="regName" type="text" placeholder="Your full name" required></div>
          <div class="frow"><label for="regEmail">Email address</label><input id="regEmail" type="email" placeholder="you@example.com" required></div>
          <div class="frow"><label for="regPassword">Password</label><input id="regPassword" type="password" placeholder="At least 10 characters" minlength="10" required></div>
          <div class="frow"><label for="regCountry">Country</label>
            <select id="regCountry" required></select>
          </div>
          <div class="frow"><label for="regDob">Date of birth</label><input id="regDob" type="date" required></div>
          <p id="regError" class="reg-error" hidden></p>
          <button class="btn btn-primary btn-block" style="margin-top:18px;" type="submit">Continue &rarr;</button>
          <p class="reg-fine">By continuing you agree to our privacy policy. Your data is encrypted and never shared without consent, other than where required by law.</p>
        </form>

        <form id="regFormLogin" onsubmit="Eldava.submitRegister(event)" hidden>
          <div class="frow"><label for="loginEmail">Email address</label><input id="loginEmail" type="email" placeholder="you@example.com" required></div>
          <div class="frow"><label for="loginPassword">Password</label><input id="loginPassword" type="password" placeholder="Your password" required></div>
          <p id="loginError" class="reg-error" hidden></p>
          <button class="btn btn-primary btn-block" style="margin-top:18px;" type="submit">Log in &rarr;</button>
        </form>
      </div>
    </div>
  </section>
</div>

<!-- ============ PATIENT PROFILE ============ -->
<div id="page-profile" class="page-view">
  <div class="page-hero">
    <div class="wrap">
      <p class="eyebrow on-dark">Your account</p>
      <h2 id="profileGreeting">Your profile</h2>
      <p>Your details, and every appointment and voucher you have with us.</p>
    </div>
  </div>
  <section>
    <div class="wrap" style="max-width:840px;">
      <div class="profile-grid">
        <div class="profile-card">
          <h3>Your details</h3>
          <dl class="profile-details" id="profileDetails"></dl>
          <button class="btn btn-ghost btn-sm" style="margin-top:16px;" onclick="Eldava.patientLogout()">Sign out</button>
        </div>
        <div class="profile-card">
          <h3>Your appointments</h3>
          <div id="profileAppointments"><p class="profile-loading">Loading&hellip;</p></div>
          <div id="profileVouchers"></div>
        </div>
      </div>
    </div>
  </section>
</div>

<!-- ============ FREE SCREENING TOOLS ============ -->
<div id="page-screening" class="page-view">
  <div class="page-hero">
    <div class="wrap">
      <p class="eyebrow on-dark">Free tools</p>
      <h2>Two quick, informal checks.</h2>
      <p>Five questions each, answered in under a minute. These are not diagnostic tests and don't replace a full assessment, but they can help you decide whether it's worth booking one.</p>
    </div>
  </div>
  <section>
    <div class="wrap">
      <div class="note-box">Neither check produces a score you should treat as meaningful on its own, and neither is the same as a validated clinical instrument used in a real assessment. They're a starting point for reflection, not a result to act on. Only a licensed clinician, through a full assessment, can provide a diagnosis.</div>
      <div class="value-grid" style="grid-template-columns:repeat(2,1fr); margin-top:28px; align-items:start;">
        <div class="value-card" id="screenCard-adhd">
          <h4>Quick ADHD traits check</h4>
          <p>Five common attention and activity related patterns, answered on a five point scale.</p>
          <div id="screenQs-adhd" style="margin-top:16px; display:none;"></div>
          <div id="screenResult-adhd" style="margin-top:16px; display:none;"></div>
          <button class="btn btn-ghost btn-sm" style="margin-top:14px;" onclick="Eldava.startScreener('adhd')" id="screenStart-adhd">Start the check</button>
        </div>
        <div class="value-card" id="screenCard-autism">
          <h4>Quick autism traits check</h4>
          <p>Five common social and sensory patterns, answered on a five point scale.</p>
          <div id="screenQs-autism" style="margin-top:16px; display:none;"></div>
          <div id="screenResult-autism" style="margin-top:16px; display:none;"></div>
          <button class="btn btn-ghost btn-sm" style="margin-top:14px;" onclick="Eldava.startScreener('autism')" id="screenStart-autism">Start the check</button>
        </div>
      </div>
    </div>
  </section>
</div>

<!-- ============ CLINICIAN PORTAL (separate area, not part of patient navigation) ============ -->
<div id="page-clinician-login" class="page-view clinician-zone">
  <div class="clinician-topbar">
    <span class="clinician-badge">CLINICIAN PORTAL</span>
    <button class="clinician-exit" onclick="Eldava.go('home')">&larr; Back to eldava.com</button>
  </div>
  <div class="clinician-login-wrap">
    <div class="reg-card" style="max-width:480px; margin:0 auto;">
      <div class="reg-tabs">
        <button type="button" id="clinTabLogin" class="reg-tab active" onclick="Eldava.setClinMode('login')">Sign in</button>
        <button type="button" id="clinTabApply" class="reg-tab" onclick="Eldava.setClinMode('apply')">Apply to join</button>
      </div>

      <form id="clinFormLogin" onsubmit="Eldava.submitClinicianLogin(event)">
        <p class="sub" style="margin:2px 0 0;">For registered Eldava Health clinicians only. Patients should use the main site.</p>
        <div class="frow"><label for="clinEmail">Clinician email</label><input id="clinEmail" type="email" placeholder="you@eldava.com" required></div>
        <div class="frow"><label for="clinPassword">Password</label><input id="clinPassword" type="password" placeholder="Your password" required></div>
        <p id="clinLoginError" class="reg-error" hidden></p>
        <button class="btn btn-primary btn-block" style="margin-top:18px;" type="submit">Sign in &rarr;</button>
      </form>

      <form id="clinFormApply" onsubmit="Eldava.submitClinicianApply(event)" hidden>
        <p class="sub" style="margin:2px 0 0;">Tell us about your qualifications. Every application is reviewed and verified by our credentialing team before any account is activated &mdash; nobody is granted access to patient information from this form alone.</p>

        <div class="frow"><label for="clinApName">Full name</label><input id="clinApName" type="text" placeholder="Your full name" required></div>
        <div class="frow"><label for="clinApEmail">Professional email</label><input id="clinApEmail" type="email" placeholder="you@example.com" required></div>
        <div class="frow"><label for="clinApPassword">Create a password</label><input id="clinApPassword" type="password" placeholder="At least 10 characters" minlength="10" required></div>

        <div class="frow"><label for="clinApSpecialty">Primary specialty</label>
          <select id="clinApSpecialty" required>
            <option value="">Select a specialty</option>
            <option>ADHD assessment (adult)</option>
            <option>ADHD assessment (child/adolescent)</option>
            <option>Autism assessment (adult)</option>
            <option>Autism assessment (child/adolescent)</option>
            <option>Women's health</option>
            <option>General diagnostic / GP</option>
            <option>Psychiatry consultation</option>
            <option>Other</option>
          </select>
        </div>

        <div class="frow"><label for="clinApCountry">Country of primary licensure</label>
          <select id="clinApCountry" required></select>
        </div>

        <div class="frow"><label for="clinApQualification">Professional qualification</label>
          <select id="clinApQualification" required>
            <option value="">Select your qualification</option>
            <option>MBBS / MD (Psychiatrist)</option>
            <option>DClinPsy (Clinical Psychologist)</option>
            <option>RMN (Registered Mental Health Nurse)</option>
            <option>Nurse Practitioner</option>
            <option>MBChB (General Practitioner)</option>
            <option>Other recognised clinical qualification</option>
          </select>
        </div>

        <div class="frow"><label for="clinApRegulator">Regulator you are registered with</label>
          <select id="clinApRegulator" required>
            <option value="">Select your regulator</option>
            <option>GMC (UK)</option>
            <option>HCPC (UK)</option>
            <option>NMC (UK)</option>
            <option>State medical board (US)</option>
            <option>CPSO / provincial college (Canada)</option>
            <option>AHPRA (Australia)</option>
            <option>Other national regulator</option>
          </select>
        </div>

        <div class="frow"><label for="clinApRegNumber">Registration / licence number</label><input id="clinApRegNumber" type="text" placeholder="As shown on your regulator's register" required></div>

        <div class="frow"><label for="clinApExperience">Years of post-qualification experience</label>
          <select id="clinApExperience" required>
            <option value="">Select a range</option>
            <option>Less than 2 years</option>
            <option>2&ndash;5 years</option>
            <option>5&ndash;10 years</option>
            <option>10&ndash;20 years</option>
            <option>20+ years</option>
          </select>
        </div>

        <div class="frow"><label for="clinApHours">Availability per week for Eldava sessions</label>
          <select id="clinApHours" required>
            <option value="">Select a range</option>
            <option>Fewer than 5 hours</option>
            <option>5&ndash;10 hours</option>
            <option>10&ndash;20 hours</option>
            <option>20+ hours</option>
          </select>
        </div>

        <div class="frow"><label for="clinApLanguages">Languages you consult in</label>
          <select id="clinApLanguages" required>
            <option value="">Select your primary consulting language</option>
            <option>English</option><option>French</option><option>German</option><option>Spanish</option>
            <option>Italian</option><option>Portuguese</option><option>Polish</option><option>Arabic</option>
            <option>Other</option>
          </select>
        </div>

        <div class="frow"><label for="clinApNotes">Anything else we should know</label><textarea id="clinApNotes" rows="3" placeholder="Optional &mdash; areas of interest, previous telehealth experience, or context for your application"></textarea></div>

        <p id="clinApplyError" class="reg-error" hidden></p>
        <button class="btn btn-primary btn-block" style="margin-top:18px;" type="submit">Submit application &rarr;</button>
        <p class="reg-fine">By applying you agree to our privacy policy. Applications are reviewed manually; we do not activate portal access until your licence and identity are verified.</p>
      </form>

      <div id="clinApplySuccess" class="note-box" style="margin-top:16px; display:none;">
        <strong>Application received.</strong> Our credentialing team will verify your licence and registration with your regulator, and follow up to schedule a short review call before your account is activated.
      </div>
    </div>
  </div>
</div>

<div id="page-clinician-portal" class="page-view clinician-zone">
  <div class="clinician-topbar">
    <span class="clinician-badge">CLINICIAN PORTAL</span>
    <span class="clinician-who" id="clinWho">Dr.</span>
    <button class="clinician-exit" onclick="Eldava.clinicianLogout()">Sign out</button>
  </div>
  <div class="clinician-shell">
    <nav class="clinician-nav">
      <button class="clinician-nav-item active" data-tab="upcoming" onclick="Eldava.setClinicianTab('upcoming')">Upcoming</button>
      <button class="clinician-nav-item" data-tab="all" onclick="Eldava.setClinicianTab('all')">All appointments</button>
      <button class="clinician-nav-item" data-tab="past" onclick="Eldava.setClinicianTab('past')">Past</button>
      <button class="clinician-nav-item clinician-nav-sep" data-tab="profile" onclick="Eldava.setClinicianTab('profile')">My profile</button>
    </nav>
    <div class="clinician-main">
      <div id="clinicianTabContent"></div>
    </div>
  </div>
</div>

<!-- ARTICLE READER -->
<div class="modal-overlay" id="articleOverlay" hidden>
  <div class="article-modal" role="dialog" aria-modal="true" aria-labelledby="articleTitle">
    <div class="article-modal-head">
      <button class="btn btn-ghost btn-sm" onclick="Eldava.closeArticle()">&larr; Back to insights</button>
      <button class="modal-close" onclick="Eldava.closeArticle()" aria-label="Close">&times;</button>
    </div>
    <div class="article-modal-body">
      <p class="eyebrow" id="articleCat"></p>
      <h2 id="articleTitle"></h2>
      <p class="article-meta" id="articleMeta"></p>
      <div class="article-body" id="articleBody"></div>
      <div class="mini-cta" id="articleCta"></div>
    </div>
  </div>
</div>

</main>

<footer>
  <div class="wrap">
    <div class="foot-grid">
      <div>
        <a class="foot-brand" href="/" onclick="event.preventDefault(); Eldava.go('home')"><span class="mark" style="width:26px;height:26px;"><svg viewBox="0 0 40 40" fill="none" aria-hidden="true"><circle cx="20" cy="20" r="18" stroke="currentColor" stroke-width="1.6"/><path d="M14 11v18M14 11h11M14 20h8.5M14 29h11" stroke="currentColor" stroke-width="2.2" stroke-linejoin="round"/><circle cx="26.5" cy="12" r="2.1" fill="var(--jade-bright)"/></svg></span>Eldava Health</a>
        <p style="margin-top:14px; font-size:0.88rem; max-width:34ch;">A global telehealth platform connecting patients with licensed clinicians for remote diagnostic assessment, live across 20 countries.</p>
      </div>
      <div>
        <h5>Patients</h5>
        <ul>
          <li><a href="/assessments/">All assessments</a></li>
          <li><a href="/pricing/" onclick="event.preventDefault(); Eldava.go('pricing')">Assessments &amp; pricing</a></li>
          <li><a href="/how-it-works/" onclick="event.preventDefault(); Eldava.go('how')">How it works</a></li>
          <li><button onclick="Eldava.openCarePathway()">Guided pre-consultation</button></li>
          <li><a href="/free-screening-tools/" onclick="event.preventDefault(); Eldava.go('screening')">Free screening tools</a></li>
          <li><a href="/complete-pathway/" onclick="event.preventDefault(); Eldava.go('pathway')">The Complete Pathway</a></li>
          <li><a href="/pharmacy-delivery/" onclick="event.preventDefault(); Eldava.go('pharmacy')">Pharmacy delivery</a></li>
          <li><a href="/founding-500/" onclick="event.preventDefault(); Eldava.go('founding500')">Founding 500 vouchers</a></li>
        </ul>
      </div>
      <div>
        <h5>Organisations</h5>
        <ul>
          <li><a href="/for-employers/" onclick="event.preventDefault(); Eldava.go('corporate')">For employers</a></li>
          <li><a href="/for-schools/" onclick="event.preventDefault(); Eldava.go('schools')">For schools</a></li>
          <li><a href="/for-universities/" onclick="event.preventDefault(); Eldava.go('universities')">For universities</a></li>
          <li><a href="/for-insurers/" onclick="event.preventDefault(); Eldava.go('insurers')">For insurers</a></li>
          <li><a href="/for-health-systems/" onclick="event.preventDefault(); Eldava.go('health-systems')">For health systems</a></li>
          <li><a href="/for-legal-and-solicitors/" onclick="event.preventDefault(); Eldava.go('legal')">For legal &amp; solicitors</a></li>
        </ul>
      </div>
      <div>
        <h5>Join the network</h5>
        <ul>
          <li><a href="/join-the-network/" onclick="event.preventDefault(); Eldava.go('partner')">For clinicians</a></li>
          <li><a href="/join-the-network/" onclick="event.preventDefault(); Eldava.go('partner')">For pharmacists</a></li>
          <li><a href="/join-the-network/" onclick="event.preventDefault(); Eldava.go('partner')">For trainees</a></li>
          <li><a href="/join-the-network/" onclick="event.preventDefault(); Eldava.go('partner')">For referral partners</a></li>
          <li><a href="/clinician-training-academy/" onclick="event.preventDefault(); Eldava.go('academy')">Training Academy</a></li>
          <li><a href="/founders-circle/" onclick="event.preventDefault(); Eldava.go('founders')">Founders Circle</a></li>
          <li><a href="/events/" onclick="event.preventDefault(); Eldava.go('events')">Events</a></li>
        </ul>
      </div>
      <div>
        <h5>Company</h5>
        <ul>
          <li><a href="/about/" onclick="event.preventDefault(); Eldava.go('about')">About &amp; trust</a></li>
          <li><a href="/founders-note/" onclick="event.preventDefault(); Eldava.go('founder-note')">A note from the founder</a></li>
          <li><a href="/guided-intake-technology/" onclick="event.preventDefault(); Eldava.go('ai')">Our technology</a></li>
          <li><a href="/outcomes-and-transparency/" onclick="event.preventDefault(); Eldava.go('outcomes')">Outcomes &amp; transparency</a></li>
          <li><a href="/insights/" onclick="event.preventDefault(); Eldava.go('blog')">Insights</a></li>
          <li><a href="/charity-partnership/" onclick="event.preventDefault(); Eldava.go('charity')">Charity partnership</a></li>
          <li><a href="mailto:care@eldava.com">Contact</a></li>
        </ul>
      </div>
    </div>
    <nav class="foot-popular" aria-label="Popular assessments" id="footPopular"></nav>
    <div class="note-box" style="background:rgba(255,255,255,0.05); border-color:var(--void-line); color:var(--void-soft); margin-top:8px;">All Eldava consultations are delivered online by video, by clinicians licensed in your region. Where a condition requires physical examination, we escalate and refer. We do not diagnose remotely what cannot responsibly be diagnosed remotely.</div>
    <div class="foot-bottom">
      <span>&copy; 2026 Eldava Health. Diagnostic services only. Final clinical decisions rest with the treating licensed clinician. Launch offer applies to the first 2,000 patients booked, one code per patient. £5, or the local equivalent, is donated to our charity partners from every completed assessment.</span>
      <span>London &middot; New York &middot; 20 countries &middot; <a class="clinician-footer-link" href="/clinician/sign-in/" onclick="event.preventDefault(); Eldava.go('clinician-login')">Clinician sign in</a></span>
    </div>
  </div>
</footer>

<!-- ENQUIRY POPUP -->
<div class="fab-stack" id="fabStack">
  <a class="whatsapp-fab" href="https://wa.me/447736517055?text=Hello%20Eldava%20Health%2C%20I%27d%20like%20to%20ask%20about%20an%20assessment." target="_blank" rel="noopener noreferrer" aria-label="Chat with us on WhatsApp, +44 7736 517055" title="WhatsApp us: +44 7736 517055">
    <svg viewBox="0 0 32 32" aria-hidden="true" focusable="false"><path fill="currentColor" d="M16.04 3C9.02 3 3.32 8.7 3.32 15.72c0 2.42.68 4.78 1.96 6.82L3.2 29l6.66-1.99a12.7 12.7 0 0 0 6.18 1.58c7.02 0 12.72-5.7 12.72-12.72S23.06 3 16.04 3Zm0 23.31c-1.94 0-3.84-.52-5.5-1.5l-.39-.23-3.95 1.18 1.21-3.85-.26-.4a10.55 10.55 0 0 1-1.65-5.66c0-5.83 4.74-10.57 10.57-10.57S26.6 9.02 26.6 14.85s-4.74 10.6-10.56 10.6Zm5.8-7.9c-.32-.16-1.88-.93-2.17-1.03-.29-.11-.5-.16-.71.16-.21.32-.82 1.03-1 1.24-.19.21-.37.24-.69.08-.32-.16-1.34-.5-2.56-1.58-.95-.85-1.58-1.89-1.77-2.21-.18-.32-.02-.49.14-.65.14-.14.32-.37.48-.56.16-.18.21-.32.32-.53.1-.21.05-.4-.03-.56-.08-.16-.71-1.71-.97-2.34-.26-.62-.52-.53-.71-.54h-.61c-.21 0-.56.08-.85.4-.29.32-1.11 1.09-1.11 2.66s1.14 3.08 1.3 3.3c.16.21 2.24 3.42 5.43 4.8.76.33 1.35.52 1.81.67.76.24 1.46.21 2.01.13.61-.09 1.88-.77 2.14-1.51.26-.74.26-1.38.18-1.51-.08-.13-.29-.21-.61-.37Z"/></svg>
    <span class="whatsapp-fab-label">WhatsApp</span>
  </a>
  <button class="enquiry-launcher" id="enquiryLauncher" onclick="Eldava.toggleEnquiry()">Need help choosing?</button>
</div>
<div class="enquiry-panel" id="enquiryPanel" hidden>
  <h4 id="enquiryTitle">Talk to our care team</h4>
  <p id="enquirySub">Tell us what you need and we will point you to the right assessment.</p>
  <div class="frow"><label for="eqName">Name</label><input id="eqName" type="text" placeholder="Your name"></div>
  <div class="frow"><label for="eqEmail">Email</label><input id="eqEmail" type="email" placeholder="you@example.com"></div>
  <div id="eqExtra"></div>
  <div class="frow"><label for="eqMsg">Anything else</label><textarea id="eqMsg" rows="3" placeholder="Optional, add any detail that helps us route you correctly"></textarea></div>
  <button class="btn btn-primary btn-block" style="margin-top:14px;" onclick="Eldava.submitEnquiry()">Send</button>
</div>

<!-- NUDGE TOAST (soft, scroll triggered, BNPL reminder) -->
<div class="nudge-toast" id="nudgeToast" hidden>
  <button class="close" onclick="Eldava.closeNudge()" aria-label="Close">&times;</button>
  <h4>Still weighing it up?</h4>
  <p>Every assessment can be split into 3 interest-free instalments at checkout, so you don't need the full price today.</p>
  <button class="btn btn-primary btn-sm" onclick="Eldava.openBooking()">See prices and pay in 3</button>
</div>

<!-- PROMO POPUP -->
<div class="modal-overlay" id="promoOverlay" hidden>
  <div class="promo-modal" role="dialog" aria-modal="true" aria-labelledby="promoTitle">
    <div class="top">
      <button class="close" onclick="Eldava.closePromo()" aria-label="Close">&times;</button>
      <div class="pct">15% OFF</div>
      <h3 id="promoTitle">Your first assessment, discounted</h3>
      <p>Limited to the first 2,000 patients. Enter your email and we will lock in your code.</p>
    </div>
    <div class="body">
      <div class="finder-row"><label for="promoEmail">Email</label><input id="promoEmail" type="email" placeholder="you@example.com"></div>
      <button class="btn btn-primary btn-block" style="margin-top:16px;" onclick="Eldava.claimPromo()">Claim my 15% off</button>
      <p style="margin-top:12px; font-size:0.8rem; color:var(--text-soft); text-align:center;">Or skip and use code <b class="mono">ELDAVA15</b> at checkout.</p>
      <button class="btn btn-ghost btn-block" style="margin-top:8px;" onclick="Eldava.closePromo()">No thanks, maybe later</button>
    </div>
  </div>
</div>

<!-- GUIDED PRE-CONSULTATION MODAL -->
<div class="modal-overlay" id="cpOverlay" hidden>
  <div class="modal" role="dialog" aria-modal="true" aria-labelledby="cpTitle">
    <div class="modal-head">
      <h3 id="cpTitle">Guided pre-consultation</h3>
      <button class="modal-close" onclick="Eldava.closeCarePathway()" aria-label="Close">&times;</button>
    </div>
    <div class="modal-body">
      <div class="modal-steps"><span id="cps0" class="done"></span><span id="cps1"></span><span id="cps2"></span><span id="cps3"></span><span id="cps4"></span></div>

      <div id="cpStep0">
        <div class="finder-row">
          <label for="cpSpecialty">What would you like help with</label>
          <select id="cpSpecialty"></select>
        </div>
        <div class="finder-row">
          <label for="cpConcern">In your own words, what has been going on</label>
          <textarea id="cpConcern" rows="3" placeholder="For example: I've struggled to focus and finish tasks for years, and it's affecting my job."></textarea>
        </div>
        <div class="form-error" id="cpStartError" hidden></div>
        <div class="modal-actions"><span></span><button class="btn btn-primary" id="cpStartBtn" onclick="Eldava.cpNext(1)">Continue</button></div>
      </div>

      <div id="cpStep1" hidden>
        <div class="ai-intro" id="cpAiIntro"></div>
        <div id="cpAiQuestions"></div>
        <div class="form-error" id="cpAnswerError" hidden></div>
        <div class="modal-actions"><button class="btn btn-ghost" onclick="Eldava.cpBack(0)">Back</button><button class="btn btn-primary" id="cpAnswerBtn" onclick="Eldava.cpNext(2)">Continue</button></div>
      </div>

      <div id="cpStep2" hidden>
        <div id="cpScreenerHead"></div>
        <div id="cpScreenerBody"></div>
        <div class="modal-actions"><button class="btn btn-ghost" onclick="Eldava.cpBack(1)">Back</button><button class="btn btn-primary" id="cpStep2NextBtn" onclick="Eldava.cpNext(3)" disabled>Continue</button></div>
      </div>

      <div id="cpStep3" hidden>
        <div class="screen-q" style="margin-top:0;">
          <div class="qtext">Right now, are you having any thoughts of harming yourself or someone else</div>
          <div class="radio-row" id="cpSafety">
            <div class="radio-opt" data-val="no" onclick="Eldava.selectRadio('cpSafety', this)">No</div>
            <div class="radio-opt" data-val="yes" onclick="Eldava.selectRadio('cpSafety', this, true)">Yes</div>
          </div>
        </div>
        <div class="crisis-box" id="cpCrisisBox" hidden>
          <h4>Please reach out for immediate support</h4>
          <p>This tool is not an emergency service and cannot respond in real time. If you are in danger right now, call your local emergency number. In the UK you can call 999, or Samaritans free on 116 123, any time. In the US and Canada, call or text 988.</p>
        </div>
        <div class="modal-actions"><button class="btn btn-ghost" onclick="Eldava.cpBack(2)">Back</button><button class="btn btn-primary" id="cpStep3NextBtn" onclick="Eldava.cpNext(4)">Show my summary</button></div>
      </div>

      <div id="cpStep4" hidden>
        <div class="cp-summary" id="cpSummaryBox"></div>
        <div class="modal-actions"><button class="btn btn-ghost" onclick="Eldava.cpBack(3)">Back</button><button class="btn btn-primary" id="cpBookBtn" onclick="Eldava.cpContinueToBooking()">Continue to booking</button></div>
      </div>

    </div>
  </div>
</div>

<!-- BOOKING MODAL -->
<div class="modal-overlay" id="bookingOverlay" hidden>
  <div class="modal" role="dialog" aria-modal="true" aria-labelledby="modalTitle">
    <div class="modal-head">
      <h3 id="modalTitle">Book a session</h3>
      <button class="modal-close" onclick="Eldava.closeBooking()" aria-label="Close">&times;</button>
    </div>
    <div class="modal-body">
      <div class="modal-steps"><span id="ms0" class="done"></span><span id="ms1"></span><span id="ms2"></span><span id="ms3"></span></div>

      <div id="bookStep0">
        <p style="color:var(--text-soft); font-size:0.9rem; margin-bottom:6px;">A few quick questions before we book your clinician.</p>
        <div class="finder-row">
          <label for="mService">Service</label>
          <select id="mService" onchange="Eldava.onModalServiceChange()"></select>
        </div>
        <div class="screen-q">
          <div class="qtext">Have you had a previous diagnosis or assessment for this?</div>
          <div class="radio-row" id="qPrior">
            <div class="radio-opt" data-val="yes" onclick="Eldava.selectRadio('qPrior', this)">Yes</div>
            <div class="radio-opt" data-val="no" onclick="Eldava.selectRadio('qPrior', this)">No</div>
          </div>
        </div>
        <div class="screen-q">
          <div class="qtext">Are you currently under the care of another doctor or therapist for this?</div>
          <div class="radio-row" id="qCare">
            <div class="radio-opt" data-val="yes" onclick="Eldava.selectRadio('qCare', this)">Yes</div>
            <div class="radio-opt" data-val="no" onclick="Eldava.selectRadio('qCare', this)">No</div>
          </div>
        </div>
        <div class="finder-row">
          <label for="qNotes">In your own words, what has been going on?</label>
          <textarea id="qNotes" rows="3" placeholder="For example: I've struggled to focus and finish tasks for years, and it's affecting my job. A sentence or two is enough - we'll ask a few follow-up questions next."></textarea>
          <p class="qhelp">Your clinician reads this, and your answers to the next few questions, before you meet.</p>
        </div>
        <div class="screen-q">
          <div class="qtext">Right now, are you having any thoughts of harming yourself or someone else?</div>
          <div class="radio-row" id="qSafety">
            <div class="radio-opt" data-val="no" onclick="Eldava.selectRadio('qSafety', this)">No</div>
            <div class="radio-opt" data-val="yes" onclick="Eldava.selectRadio('qSafety', this, true)">Yes</div>
          </div>
        </div>
        <div class="crisis-box" id="crisisBox" hidden>
          <h4>Please reach out for immediate support</h4>
          <p>Eldava Health assessments are not an emergency service and cannot respond in real time. If you are in danger right now, call your local emergency number. In the UK you can call 999, or Samaritans free on 116 123, any time. In the US and Canada, call or text 988. Booking is paused so you can get the right help first.</p>
        </div>
        <div class="form-error" id="step0Error" hidden></div>
        <div class="modal-actions"><span></span><button class="btn btn-primary" id="step0NextBtn" onclick="Eldava.bookingNext(1)">Continue</button></div>
      </div>

      <div id="bookStepAI" hidden>
        <div class="ai-intro" id="bookAiIntro"></div>
        <div id="bookAiQuestions"></div>
        <div class="crisis-box" id="bookAiCrisis" hidden>
          <h4>Please reach out for immediate support</h4>
          <p>Eldava Health assessments are not an emergency service and cannot respond in real time. If you are in danger right now, call your local emergency number. In the UK you can call 999, or Samaritans free on 116 123, any time. In the US and Canada, call or text 988. Booking is paused so you can get the right help first.</p>
        </div>
        <div class="form-error" id="bookAiError" hidden></div>
        <div class="modal-actions"><button class="btn btn-ghost" onclick="Eldava.bookingBack(0)">Back</button><button class="btn btn-primary" id="bookAiBtn" onclick="Eldava.bookingIntakeNext()">Continue</button></div>
      </div>

      <div id="bookStep1" hidden>
        <p style="color:var(--text-soft); font-size:0.9rem; margin-bottom:10px;" id="slotIntro">Choose a clinician and a time. These are live availability slots.</p>
        <div class="slot-picker" id="slotPicker">
          <div class="slot-loading">Loading available appointments&hellip;</div>
        </div>
        <div class="summary-box" style="margin-top:18px;">
          <span class="svc" id="mSummaryName">Adult ADHD Assessment</span>
          <span class="amt-wrap"><span class="amt-was" id="mSummaryWas" hidden></span><span class="amt" id="mSummaryPrice">£685</span></span>
        </div>
        <div class="modal-actions"><button class="btn btn-ghost" onclick="Eldava.bookingBack(0)">Back</button><button class="btn btn-primary" id="slotNextBtn" onclick="Eldava.bookingNext(2)" disabled>Continue</button></div>
      </div>

      <div id="bookStep2" hidden>
        <div class="field-grid">
          <div class="finder-row"><label for="pName">Full name</label><input id="pName" type="text" placeholder="Jane Carter"></div>
          <div class="finder-row"><label for="pEmail">Email</label><input id="pEmail" type="email" placeholder="jane@example.com"></div>
        </div>
        <div class="field-grid" style="margin-top:14px;">
          <div class="finder-row"><label for="pPhone">Phone</label><input id="pPhone" type="tel" placeholder="+44 7000 000000"></div>
          <div class="finder-row"><label for="pCountry">Country</label>
            <select id="pCountry"></select>
          </div>
        </div>
        <div class="finder-row" style="margin-top:14px;">
          <label for="promoCodeInput">Promo code</label>
          <input id="promoCodeInput" type="text" placeholder="ELDAVA15" style="text-transform:uppercase;">
        </div>
        <div class="modal-actions"><button class="btn btn-ghost" onclick="Eldava.bookingBack(1)">Back</button><button class="btn btn-primary" onclick="Eldava.bookingNext(3)">Continue to payment</button></div>
      </div>

      <div id="bookStep3" hidden>
        <div class="summary-box">
          <span class="svc" id="mSummaryName2">Adult ADHD Assessment</span>
          <span class="amt-wrap"><span class="amt-was" id="mSummaryWas2" hidden></span><span class="amt" id="mSummaryPrice2">£685</span></span>
        </div>
        <div class="promo-applied" id="promoApplied" hidden></div>
        <div class="pay-toggle">
          <div class="pay-opt selected" id="payFullOpt" onclick="Eldava.setPayMode('full')">
            <div class="t">Pay in full</div>
            <div class="s" id="payFullSub">£685 today</div>
          </div>
          <div class="pay-opt" id="payThreeOpt" onclick="Eldava.setPayMode('three')">
            <div class="t">Pay later with Klarna</div>
            <div class="s" id="payThreeSub">Spread the cost, 0% interest</div>
          </div>
        </div>
        <div class="bnpl-breakdown" id="bnplBreakdown">
          <div class="row"><span>Order total</span><b id="bnplInst1">£685</b></div>
          <div class="row"><span>Paid to</span><b id="bnplInst2">Klarna</b></div>
          <div class="row"><span>Plan chosen at</span><b id="bnplInst3">At checkout</b></div>
          <p class="fine">Klarna decides which pay-later plans you are offered and runs its own eligibility check. Buy now, pay later is a form of credit. Missing a payment could affect your ability to get credit in future. 18+, T&amp;Cs apply.</p>
        </div>
        <div class="pay-secure">
          <span class="lock">&#128274;</span>
          <span>You will be taken to our payment provider's secure page to pay. Your card details are never entered on, or stored by, this site.</span>
        </div>
        <div class="form-error" id="payError" hidden></div>
        <div class="modal-actions"><button class="btn btn-ghost" onclick="Eldava.bookingBack(2)">Back</button><button class="btn btn-primary" id="payNowBtn" onclick="Eldava.confirmBooking()">Continue to secure payment</button></div>
      </div>

      <div id="bookStep4" hidden>
        <div class="confirm-box">
          <div class="check" id="confirmIcon">&check;</div>
          <h3 id="confirmHeading">Your session is booked</h3>
          <p style="margin-top:8px; color:var(--text-soft);" id="confirmPayLine">A confirmation is on its way to <span id="confirmEmail">your email</span>.</p>
          <div class="ref" id="confirmRef">ELDAVA-000000</div>
          <div class="confirm-detail" id="confirmDetail"></div>
          <button class="btn btn-primary btn-block" style="margin-top:22px;" onclick="Eldava.closeBooking()">Done</button>
        </div>
      </div>

    </div>
  </div>
</div>

`;
