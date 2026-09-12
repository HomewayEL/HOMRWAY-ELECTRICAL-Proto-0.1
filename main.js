/* =========================================================
   Homeway Electrical — Main script
   Handles: navigation, rendering, modals, resume viewer,
   contact form, scroll effects, accessibility helpers
   ========================================================= */
(function () {
  'use strict';

  const D = window.HOMEWAY_DATA;
  const $ = (sel, ctx) => (ctx || document).querySelector(sel);
  const $$ = (sel, ctx) => Array.from((ctx || document).querySelectorAll(sel));

  /* ---------- Utilities ---------- */
  function esc(str) {
    return String(str == null ? '' : str)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  }
  function initials(name) {
    return name.split(/\s+/).filter(Boolean).slice(0, 2).map(w => w[0].toUpperCase()).join('');
  }
  let toastTimer;
  function toast(msg) {
    const el = $('#toast');
    el.textContent = msg;
    el.hidden = false;
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => { el.hidden = true; }, 3200);
  }

  /* ---------- Header / Navigation ---------- */
  const header = $('#site-header');
  const navToggle = $('#nav-toggle');
  const navMenu = $('#nav-menu');
  const navLinks = $$('.nav-link');
  const MOBILE_BP = 1024; // must match the CSS hamburger breakpoint

  function setMenu(open) {
    navMenu.classList.toggle('is-open', open);
    navToggle.setAttribute('aria-expanded', String(open));
    navToggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    document.body.classList.toggle('no-scroll', open && window.innerWidth <= MOBILE_BP);
  }
  navToggle.addEventListener('click', () => setMenu(!navMenu.classList.contains('is-open')));
  navMenu.addEventListener('click', (e) => { if (e.target.closest('a')) setMenu(false); });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && navMenu.classList.contains('is-open')) { setMenu(false); navToggle.focus(); } });
  window.addEventListener('resize', () => { if (window.innerWidth > MOBILE_BP) setMenu(false); });

  // Active section highlighting + header shadow + back-to-top
  const sections = $$('main section[id]');
  const backToTop = $('#back-to-top');
  function onScroll() {
    const y = window.scrollY;
    header.classList.toggle('is-scrolled', y > 10);
    backToTop.classList.toggle('is-visible', y > 600);
    const offset = header.offsetHeight + 80;
    let current = 'home';
    for (const s of sections) {
      if (s.offsetTop - offset <= y) current = s.id;
    }
    if (current === 'why-us') current = 'services';
    if (current === 'safety') current = 'about';
    navLinks.forEach(a => {
      const active = a.getAttribute('href') === '#' + current;
      a.classList.toggle('is-active', active);
      if (active) a.setAttribute('aria-current', 'page'); else a.removeAttribute('aria-current');
    });
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  backToTop.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));

  /* ---------- Render: Services ---------- */
  function renderServices() {
    const grid = $('#services-grid');
    grid.innerHTML = D.services.map((s, i) => {
      const shown = s.items.slice(0, 3);
      const more = s.items.length - shown.length;
      return `
      <article class="card service-card reveal reveal-delay-${i % 3}" id="service-${esc(s.id)}">
        <div class="card-icon" aria-hidden="true"><i class="${esc(s.icon)}"></i></div>
        <h3 class="card-title">${esc(s.title)}</h3>
        <p class="card-text">${esc(s.summary)}</p>
        <ul class="service-list">
          ${shown.map(it => `<li>${esc(it)}</li>`).join('')}
          ${more > 0 ? `<li class="service-more">+ ${more} more</li>` : ''}
        </ul>
        <button type="button" class="btn btn-outline btn-sm js-service-detail" data-service="${esc(s.id)}">
          <i class="fa-solid fa-circle-info" aria-hidden="true"></i> Learn More
        </button>
      </article>`;
    }).join('');

    // Populate service dropdown
    const select = $('#service_needed');
    D.services.forEach(s => {
      const opt = document.createElement('option');
      opt.value = s.title; opt.textContent = s.title;
      select.appendChild(opt);
    });
    ['Home Visit / General Inquiry', 'Other'].forEach(v => {
      const opt = document.createElement('option'); opt.value = v; opt.textContent = v; select.appendChild(opt);
    });
  }

  /* ---------- Render: Features / Steps / Values ---------- */
  function renderFeatures() {
    $('#features-grid').innerHTML = D.features.map((f, i) => `
      <article class="card feature-card reveal reveal-delay-${i % 3}">
        <div class="card-icon" aria-hidden="true"><i class="${esc(f.icon)}"></i></div>
        <h3 class="card-title">${esc(f.title)}</h3>
        <p class="card-text">${esc(f.text)}</p>
      </article>`).join('');
  }
  function renderSteps() {
    $('#steps-list').innerHTML = D.steps.map((s, i) => `
      <li class="card step-card reveal reveal-delay-${i % 3}">
        <div class="step-number" aria-hidden="true">${i + 1}</div>
        <h3 class="card-title"><span class="sr-only">Step ${i + 1}: </span>${esc(s.title)}</h3>
        <p class="card-text">${esc(s.text)}</p>
      </li>`).join('');
  }
  function renderValues() {
    $('#values-list').innerHTML = D.values.map(v => `
      <li><i class="${esc(v.icon)}" aria-hidden="true"></i><span>${esc(v.label)}</span></li>`).join('');
  }

  /* ---------- Render: Team ---------- */
  function renderTeam() {
    $('#team-grid').innerHTML = D.team.map((m, i) => {
      const placeholder = !m.hasProfile;
      const avatar = placeholder
        ? `<div class="team-avatar team-avatar--placeholder" aria-hidden="true"><i class="fa-solid fa-user"></i></div>`
        : `<div class="team-avatar" aria-hidden="true">${esc(m.initials || initials(m.name))}</div>`;
      const badges = placeholder
        ? `<span class="badge badge--muted"><i class="fa-regular fa-clock" aria-hidden="true"></i> Profile coming soon</span>`
        : (m.badges || []).map(b => `<span class="badge badge--gold"><i class="fa-solid fa-certificate" aria-hidden="true"></i> ${esc(b)}</span>`).join('') +
          `<span class="badge"><i class="fa-solid fa-location-dot" aria-hidden="true"></i> ${esc(m.publicLocation)}</span>`;
      return `
      <article class="card team-card ${placeholder ? 'team-card--placeholder' : ''} reveal reveal-delay-${i % 3}" id="team-${esc(m.id)}">
        ${avatar}
        <h3 class="team-name">${esc(m.name)}</h3>
        <p class="team-position">${esc(m.shortPosition || m.position)}</p>
        <p class="team-bio">${esc(m.bio)}</p>
        <div class="team-meta">${badges}</div>
        <div class="team-actions">
          <button type="button" class="btn btn-outline btn-sm js-team-profile" data-member="${esc(m.id)}"><i class="fa-solid fa-id-card" aria-hidden="true"></i> View Profile</button>
          <button type="button" class="btn btn-primary btn-sm js-team-resume" data-member="${esc(m.id)}"><i class="fa-solid fa-file-lines" aria-hidden="true"></i> View Resume</button>
        </div>
      </article>`;
    }).join('');
  }

  /* ---------- Modal system (generic) ---------- */
  let lastFocus = null;
  function trapFocus(dialog, e) {
    if (e.key !== 'Tab') return;
    const focusables = $$('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])', dialog).filter(el => !el.hasAttribute('disabled') && el.offsetParent !== null);
    if (!focusables.length) return;
    const first = focusables[0], last = focusables[focusables.length - 1];
    if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
  }
  function openModalEl(modal) {
    lastFocus = document.activeElement;
    modal.hidden = false;
    document.body.classList.add('no-scroll');
    const dialog = $('.modal-dialog', modal);
    dialog.scrollTop = 0;
    const content = $('.modal-content', modal); if (content) content.scrollTop = 0;
    const firstBtn = $('.modal-close, .resume-toolbar [data-close-resume]', modal);
    setTimeout(() => (firstBtn || dialog).focus(), 30);
  }
  function closeModalEl(modal) {
    modal.hidden = true;
    if (!$$('.modal:not([hidden])').length) document.body.classList.remove('no-scroll');
    if (lastFocus && typeof lastFocus.focus === 'function') lastFocus.focus();
  }
  const modal = $('#modal');
  const modalContent = $('#modal-content');
  const resumeModal = $('#resume-modal');
  const resumeContent = $('#resume-content');

  $$('[data-close-modal]').forEach(el => el.addEventListener('click', () => closeModalEl(modal)));
  $$('[data-close-resume]').forEach(el => el.addEventListener('click', () => closeModalEl(resumeModal)));
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      if (!resumeModal.hidden) closeModalEl(resumeModal);
      else if (!modal.hidden) closeModalEl(modal);
    }
    if (!resumeModal.hidden) trapFocus($('.modal-dialog', resumeModal), e);
    else if (!modal.hidden) trapFocus($('.modal-dialog', modal), e);
  });

  function openModal(html) { modalContent.innerHTML = html; openModalEl(modal); }

  /* ---------- Service detail modal ---------- */
  function openServiceModal(id) {
    const s = D.services.find(x => x.id === id); if (!s) return;
    openModal(`
      <div class="modal-header">
        <div class="card-icon" aria-hidden="true"><i class="${esc(s.icon)}"></i></div>
        <div>
          <h2 class="modal-title" id="modal-title">${esc(s.title)}</h2>
          <p class="modal-subtitle">Residential Electrical Service</p>
        </div>
      </div>
      <p class="modal-text">${esc(s.summary)}</p>
      <div class="modal-section">
        <h3 class="modal-section-title">${esc(s.intro || 'What\u2019s included')}</h3>
        <ul class="modal-list">${s.items.map(it => `<li>${esc(it)}</li>`).join('')}</ul>
      </div>
      <div class="modal-section">
        <p class="modal-text" style="font-size:.88rem"><i class="fa-solid fa-triangle-exclamation text-gold" aria-hidden="true"></i> All services are subject to on-site assessment, electrical conditions, property requirements, and applicable local codes and regulations.</p>
      </div>
      <div class="modal-actions">
        <a href="#contact" class="btn btn-primary js-modal-request" data-service="${esc(s.title)}"><i class="fa-solid fa-paper-plane" aria-hidden="true"></i> Request This Service</a>
        <a href="#contact" class="btn btn-outline js-modal-visit" data-service="${esc(s.title)}"><i class="fa-solid fa-calendar-check" aria-hidden="true"></i> Book a Home Visit</a>
      </div>`);
  }

  /* ---------- Team profile modal ---------- */
  function openProfileModal(id) {
    const m = D.team.find(x => x.id === id); if (!m) return;
    if (!m.hasProfile) {
      openModal(`
        <div class="modal-header">
          <div class="team-avatar team-avatar--placeholder" style="width:72px;height:72px;font-size:1.6rem;margin:0" aria-hidden="true"><i class="fa-solid fa-user"></i></div>
          <div>
            <h2 class="modal-title" id="modal-title">${esc(m.name)}</h2>
            <p class="modal-subtitle">${esc(m.position)}</p>
          </div>
        </div>
        <div class="placeholder-box">
          <i class="fa-regular fa-id-card" aria-hidden="true"></i>
          <p><strong>Team member profile coming soon.</strong></p>
          <p>Name, photo, background, and contact details for this team member will be added once available.</p>
        </div>
        <div class="modal-actions">
          <button type="button" class="btn btn-primary js-team-resume" data-member="${esc(m.id)}"><i class="fa-solid fa-file-lines" aria-hidden="true"></i> View Resume</button>
          <button type="button" class="btn btn-ghost" data-close-modal-inline><i class="fa-solid fa-xmark" aria-hidden="true"></i> Close</button>
        </div>`);
      return;
    }
    const c = m.contact;
    openModal(`
      <div class="modal-header">
        <div class="team-avatar" style="width:72px;height:72px;font-size:1.4rem;margin:0" aria-hidden="true">${esc(m.initials || initials(m.name))}</div>
        <div>
          <h2 class="modal-title" id="modal-title">${esc(m.name)}</h2>
          <p class="modal-subtitle">${esc(m.position)}</p>
        </div>
      </div>
      <p class="modal-text">${esc(m.objective)}</p>
      <div class="modal-section">
        <h3 class="modal-section-title">Specialization &amp; Certification</h3>
        <div class="chip-list">
          <span class="chip"><i class="fa-solid fa-bolt text-gold" aria-hidden="true"></i> ${esc(m.specialization)}</span>
          ${m.certifications.map(x => `<span class="chip"><i class="fa-solid fa-certificate text-gold" aria-hidden="true"></i> ${esc(x.title)}</span>`).join('')}
        </div>
      </div>
      <div class="modal-section">
        <h3 class="modal-section-title">Education</h3>
        <ul class="modal-list">${m.education.map(e => `<li>${esc(e.title)} — ${esc(e.sub)} (${esc(e.detail)})</li>`).join('')}</ul>
      </div>
      <div class="modal-section">
        <h3 class="modal-section-title">Key Skills</h3>
        <div class="chip-list">${m.skills.technical.concat(m.skills.other).map(s => `<span class="chip">${esc(s)}</span>`).join('')}</div>
      </div>
      <div class="modal-section">
        <h3 class="modal-section-title">Contact</h3>
        <ul class="profile-contact">
          <li><i class="fa-solid fa-phone" aria-hidden="true"></i><a href="${esc(c.phoneHref)}">${esc(c.phone)}</a></li>
          <li><i class="fa-solid fa-envelope" aria-hidden="true"></i><a href="mailto:${esc(c.email)}">${esc(c.email)}</a></li>
          <li><i class="fa-brands fa-facebook" aria-hidden="true"></i><a href="${esc(c.facebookHref)}" target="_blank" rel="noopener noreferrer">${esc(c.facebook)}</a></li>
          <li><i class="fa-solid fa-location-dot" aria-hidden="true"></i><span>${esc(m.publicLocation)}</span></li>
        </ul>
      </div>
      <div class="modal-actions">
        <button type="button" class="btn btn-primary js-team-resume" data-member="${esc(m.id)}"><i class="fa-solid fa-file-lines" aria-hidden="true"></i> View Full Resume</button>
        <a href="${esc(c.phoneHref)}" class="btn btn-outline"><i class="fa-solid fa-phone" aria-hidden="true"></i> Call</a>
      </div>`);
  }

  /* ---------- Resume viewer ---------- */
  let currentResumeId = null;
  function openResume(id) {
    const m = D.team.find(x => x.id === id); if (!m) return;
    currentResumeId = id;
    const dl = $('#resume-download');
    if (!m.hasResume) {
      dl.disabled = true;
      resumeContent.innerHTML = `
        <div class="resume-placeholder">
          <div class="resume-photo resume-photo--placeholder" aria-hidden="true"><i class="fa-solid fa-user"></i></div>
          <h3 id="resume-title">${esc(m.name)}</h3>
          <p class="resume-position">${esc(m.position)}</p>
          <p><i class="fa-regular fa-file-lines" aria-hidden="true"></i></p>
          <p><strong>Resume not yet available. Please check back soon.</strong></p>
          <p style="font-size:.9rem;color:#64748b">Career objective, education, certifications, skills, work experience, and contact information will appear here once the resume has been provided.</p>
        </div>`;
    } else {
      dl.disabled = false;
      const c = m.contact;
      resumeContent.innerHTML = `
      <div class="resume">
        <aside class="resume-side">
          <div class="resume-photo" role="img" aria-label="Profile photo placeholder">${esc(m.initials || initials(m.name))}</div>
          <h3 class="resume-name" id="resume-title">${esc(m.name)}</h3>
          <p class="resume-position">${esc(m.position)}</p>

          <div class="resume-side-block">
            <h4 class="resume-side-title">Contact</h4>
            <ul>
              <li><i class="fa-solid fa-phone" aria-hidden="true"></i><a href="${esc(c.phoneHref)}">${esc(c.phone)}</a></li>
              <li><i class="fa-solid fa-envelope" aria-hidden="true"></i><a href="mailto:${esc(c.email)}">${esc(c.email)}</a></li>
              <li><i class="fa-brands fa-facebook" aria-hidden="true"></i><a href="${esc(c.facebookHref)}" target="_blank" rel="noopener noreferrer">${esc(c.facebook)}</a></li>
              <li><i class="fa-solid fa-location-dot" aria-hidden="true"></i><span>${esc(c.location)}</span></li>
            </ul>
          </div>
          <div class="resume-side-block">
            <h4 class="resume-side-title">Technical Skills</h4>
            <ul class="resume-skills">${m.skills.technical.map(s => `<li>${esc(s)}</li>`).join('')}</ul>
          </div>
          <div class="resume-side-block">
            <h4 class="resume-side-title">Other Skills</h4>
            <ul class="resume-skills">${m.skills.other.map(s => `<li>${esc(s)}</li>`).join('')}</ul>
          </div>
        </aside>
        <div class="resume-main">
          <section class="resume-block">
            <h4 class="resume-block-title"><i class="fa-solid fa-bullseye" aria-hidden="true"></i> Career Objective</h4>
            <p>${esc(m.objective)}</p>
          </section>
          <section class="resume-block">
            <h4 class="resume-block-title"><i class="fa-solid fa-bolt" aria-hidden="true"></i> Specialization</h4>
            <p>${esc(m.specialization)}</p>
          </section>
          <section class="resume-block">
            <h4 class="resume-block-title"><i class="fa-solid fa-graduation-cap" aria-hidden="true"></i> Education</h4>
            ${m.education.map(e => `<div class="resume-item"><div class="resume-item-title">${esc(e.title)}</div><div class="resume-item-sub">${esc(e.sub)} · ${esc(e.detail)}</div></div>`).join('')}
          </section>
          <section class="resume-block">
            <h4 class="resume-block-title"><i class="fa-solid fa-certificate" aria-hidden="true"></i> Certifications</h4>
            ${m.certifications.map(e => `<div class="resume-item"><div class="resume-item-title">${esc(e.title)}</div><div class="resume-item-sub">${esc(e.sub)}</div></div>`).join('')}
          </section>
          <section class="resume-block">
            <h4 class="resume-block-title"><i class="fa-solid fa-briefcase" aria-hidden="true"></i> Work Experience</h4>
            ${m.experience.map(e => `<div class="resume-item"><div class="resume-item-title">${esc(e.title)}</div><div class="resume-item-sub">${esc(e.sub)}</div><p>${esc(e.detail)}</p></div>`).join('')}
          </section>
          <section class="resume-block">
            <h4 class="resume-block-title"><i class="fa-solid fa-list-check" aria-hidden="true"></i> Skills Summary</h4>
            <ul class="resume-bullets">${m.skills.technical.concat(m.skills.other).map(s => `<li>${esc(s)}</li>`).join('')}</ul>
          </section>
        </div>
      </div>`;
    }
    openModalEl(resumeModal);
  }

  // Download = print-to-PDF of the resume view (works offline, no backend needed)
  $('#resume-download').addEventListener('click', () => {
    const m = D.team.find(x => x.id === currentResumeId);
    if (!m || !m.hasResume) { toast('Resume not yet available.'); return; }
    const prevTitle = document.title;
    document.title = m.name.replace(/\s+/g, '_') + '_Resume';
    document.body.classList.add('printing-resume');
    const cleanup = () => { document.body.classList.remove('printing-resume'); document.title = prevTitle; window.removeEventListener('afterprint', cleanup); };
    window.addEventListener('afterprint', cleanup);
    setTimeout(() => { window.print(); setTimeout(cleanup, 1500); }, 60);
  });

  /* ---------- Legal placeholder modal ---------- */
  function openLegal(key) {
    const l = D.legal[key]; if (!l) return;
    openModal(`
      <div class="modal-header">
        <div class="card-icon" aria-hidden="true"><i class="fa-solid fa-file-contract"></i></div>
        <div><h2 class="modal-title" id="modal-title">${esc(l.title)}</h2><p class="modal-subtitle">Placeholder — to be finalized</p></div>
      </div>
      ${l.body.map(p => `<p class="modal-text">${esc(p)}</p>`).join('')}
      <div class="modal-actions"><button type="button" class="btn btn-ghost" data-close-modal-inline><i class="fa-solid fa-xmark" aria-hidden="true"></i> Close</button></div>`);
  }

  /* ---------- Contact form ---------- */
  const form = $('#contact-form');
  const formStatus = $('#form-status');
  const formTitle = $('#contact-form-title');
  let submitType = 'service_request';

  function presetForm(opts) {
    opts = opts || {};
    const select = $('#service_needed');
    if (opts.service) {
      const match = Array.from(select.options).find(o => o.value === opts.service);
      select.value = match ? opts.service : 'Other';
    }
    if (opts.title) formTitle.textContent = opts.title;
    if (opts.message && !$('#message').value) $('#message').value = opts.message;
    if (opts.focus) setTimeout(() => $('#full_name').focus({ preventScroll: true }), 500);
  }

  form.addEventListener('click', (e) => {
    const btn = e.target.closest('button[type="submit"]');
    if (btn) submitType = btn.dataset.type || 'service_request';
  });

  function validate() {
    let ok = true;
    $$('[required]', form).forEach(field => {
      const valid = field.checkValidity() && field.value.trim() !== '';
      field.classList.toggle('is-invalid', !valid);
      field.setAttribute('aria-invalid', String(!valid));
      if (!valid) ok = false;
    });
    return ok;
  }

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    formStatus.className = 'form-status'; formStatus.textContent = '';
    if (!validate()) {
      formStatus.className = 'form-status is-error';
      formStatus.textContent = 'Please complete all required fields with valid information.';
      const firstInvalid = $('.is-invalid', form); if (firstInvalid) firstInvalid.focus();
      return;
    }
    const buttons = $$('button[type="submit"]', form);
    buttons.forEach(b => { b.disabled = true; });
    const payload = {
      full_name: $('#full_name').value.trim(),
      email: $('#email').value.trim(),
      phone: $('#phone').value.trim(),
      service_needed: $('#service_needed').value,
      message: $('#message').value.trim(),
      preferred_schedule: $('#preferred_schedule').value || '',
      request_type: submitType,
      status: 'new'
    };
    try {
      const res = await fetch('tables/service_requests', {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload)
      });
      if (!res.ok) throw new Error('Request failed: ' + res.status);
      formStatus.className = 'form-status is-success';
      formStatus.innerHTML = submitType === 'home_visit'
        ? '<i class="fa-solid fa-circle-check" aria-hidden="true"></i> Thank you! Your home visit request has been received. We\u2019ll contact you to confirm the schedule.'
        : '<i class="fa-solid fa-circle-check" aria-hidden="true"></i> Thank you! Your service request has been sent. We\u2019ll get back to you shortly.';
      form.reset();
      $('#service_needed').selectedIndex = 0;
      formTitle.textContent = 'Send a Service Request';
      toast('Request submitted successfully');
    } catch (err) {
      // Fallback: let the user send the request via their email app
      const subject = encodeURIComponent((submitType === 'home_visit' ? 'Home Visit Request' : 'Service Request') + ' — ' + payload.service_needed);
      const body = encodeURIComponent(
        'Name: ' + payload.full_name + '\nEmail: ' + payload.email + '\nPhone: ' + payload.phone +
        '\nService Needed: ' + payload.service_needed + '\nPreferred Schedule: ' + (payload.preferred_schedule || 'Flexible') +
        '\n\nMessage:\n' + payload.message);
      formStatus.className = 'form-status is-error';
      formStatus.innerHTML = '<i class="fa-solid fa-triangle-exclamation" aria-hidden="true"></i> We couldn\u2019t submit the form right now. You can <a href="mailto:padillolaurence28@gmail.com?subject=' + subject + '&body=' + body + '" style="color:inherit;text-decoration:underline">send your request by email</a> or call <a href="tel:+639708032709" style="color:inherit;text-decoration:underline">+63 970 803 2709</a>.';
    } finally {
      buttons.forEach(b => { b.disabled = false; });
    }
  });
  $$('[required]', form).forEach(f => f.addEventListener('input', () => { f.classList.remove('is-invalid'); f.removeAttribute('aria-invalid'); }));

  /* ---------- Global click delegation ---------- */
  document.addEventListener('click', (e) => {
    const t = e.target;
    const svc = t.closest('.js-service-detail');
    if (svc) { openServiceModal(svc.dataset.service); return; }
    const prof = t.closest('.js-team-profile');
    if (prof) { openProfileModal(prof.dataset.member); return; }
    const res = t.closest('.js-team-resume');
    if (res) { if (!modal.hidden) closeModalEl(modal); openResume(res.dataset.member); return; }
    const legal = t.closest('.js-legal');
    if (legal) { e.preventDefault(); openLegal(legal.dataset.legal); return; }
    if (t.closest('[data-close-modal-inline]')) { closeModalEl(modal); return; }

    const mReq = t.closest('.js-modal-request');
    if (mReq) { closeModalEl(modal); presetForm({ service: mReq.dataset.service, title: 'Request: ' + mReq.dataset.service, focus: true }); return; }
    const mVisit = t.closest('.js-modal-visit');
    if (mVisit) { closeModalEl(modal); presetForm({ service: mVisit.dataset.service, title: 'Book a Home Visit', focus: true }); submitType = 'home_visit'; return; }

    if (t.closest('.js-book-visit')) { presetForm({ service: 'Home Visit / General Inquiry', title: 'Book a Home Visit', focus: true }); return; }
    if (t.closest('.js-request-service')) { presetForm({ title: 'Request Electrical Service', focus: true }); return; }
    if (t.closest('.js-schedule-inspection')) { presetForm({ service: 'Basic Electrical Safety Inspection', title: 'Schedule an Inspection', focus: true }); return; }
    if (t.closest('.js-contact-electrician')) { presetForm({ title: 'Contact an Electrician', focus: true }); return; }
  });

  /* ---------- Scroll reveal ---------- */
  function initReveal() {
    const els = $$('.reveal');
    if (!('IntersectionObserver' in window) || window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      els.forEach(el => el.classList.add('is-visible')); return;
    }
    const io = new IntersectionObserver((entries) => {
      entries.forEach(en => { if (en.isIntersecting) { en.target.classList.add('is-visible'); io.unobserve(en.target); } });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
    els.forEach(el => io.observe(el));
  }

  /* ---------- Init ---------- */
  function init() {
    renderServices();
    renderFeatures();
    renderSteps();
    renderValues();
    renderTeam();
    initReveal();
    onScroll();
    $('#copyright-year').textContent = new Date().getFullYear();
    // Ensure hero sections without .reveal are visible; guard against missing hash targets
    if (location.hash) {
      const target = document.querySelector(location.hash);
      if (target) setTimeout(() => target.scrollIntoView(), 50);
    }
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();
