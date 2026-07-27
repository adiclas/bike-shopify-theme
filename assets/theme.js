const toggles = document.querySelectorAll('[data-menu-toggle]');
const navigation = document.querySelector('[data-mobile-navigation]');

function toggleMenu(force) {
  if (!navigation) return;
  const open = typeof force === 'boolean' ? force : !navigation.classList.contains('is-open');
  navigation.classList.toggle('is-open', open);
  document.body.classList.toggle('menu-open', open);
  toggles.forEach((toggle) => toggle.setAttribute('aria-expanded', String(open)));
}

toggles.forEach((toggle) => toggle.addEventListener('click', () => toggleMenu()));
document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape') toggleMenu(false);
});

const searchToggles = document.querySelectorAll('[data-search-toggle]');
const searchForm = document.querySelector('[data-search-form]');
const searchInput = searchForm ? searchForm.querySelector('input') : null;

function setSearch(force) {
  if (!searchForm) return;
  const isHidden = searchForm.hasAttribute('hidden');
  const open = typeof force === 'boolean' ? force : isHidden;
  if (open) {
    searchForm.removeAttribute('hidden');
    requestAnimationFrame(() => searchForm.classList.add('is-open'));
    if (searchInput) setTimeout(() => searchInput.focus(), 60);
  } else {
    searchForm.classList.remove('is-open');
    setTimeout(() => searchForm.setAttribute('hidden', ''), 180);
  }
  searchToggles.forEach((toggle) => toggle.setAttribute('aria-expanded', String(open)));
}

searchToggles.forEach((toggle) => toggle.addEventListener('click', () => setSearch()));
document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape') {
    setSearch(false);
    closePredictive();
  }
});

document.querySelectorAll('[data-variant-select]').forEach((select) => {
  select.addEventListener('change', () => {
    const option = select.options[select.selectedIndex];
    const price = select.closest('[data-product-section]')?.querySelector('[data-product-price] strong');
    if (price && option.dataset.price) price.textContent = option.dataset.price;
  });
});

if ('IntersectionObserver' in window) {
  const easeOutQuad = (t) => t * (2 - t);
  const counterObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      const el = entry.target;
      const from = parseInt(el.dataset.countFrom, 10) || 0;
      const to = parseInt(el.dataset.countTo, 10) || 0;
      const duration = parseInt(el.dataset.countDuration, 10) || 1500;
      const start = performance.now();
      const format = (value) => value.toLocaleString('en-US');
      el.textContent = '$' + format(from);
      const step = (now) => {
        const elapsed = now - start;
        const progress = Math.min(elapsed / duration, 1);
        const value = Math.round(from + (to - from) * easeOutQuad(progress));
        el.textContent = '$' + format(value);
        if (progress < 1) {
          requestAnimationFrame(step);
        } else {
          el.textContent = '$' + format(to);
        }
      };
      requestAnimationFrame(step);
      counterObserver.unobserve(el);
    });
  }, { threshold: 0.4 });
  document.querySelectorAll('[data-count]').forEach((el) => counterObserver.observe(el));
}

const header = document.querySelector('[data-header]');
if (header) {
  let lastScrolled = false;
  const updateHeader = () => {
    const scrolled = window.scrollY > 30;
    if (scrolled !== lastScrolled) {
      header.classList.toggle('is-scrolled', scrolled);
      lastScrolled = scrolled;
    }
  };
  window.addEventListener('scroll', updateHeader, { passive: true });
  updateHeader();
}

document.querySelectorAll('[data-mega-trigger]').forEach((trigger) => {
  const panel = trigger.querySelector('[data-mega-panel]');
  if (!panel) return;
  let closeTimer;
  const open = () => {
    clearTimeout(closeTimer);
    document.querySelectorAll('[data-mega-panel].is-open').forEach((other) => {
      if (other !== panel) other.classList.remove('is-open');
    });
    panel.classList.add('is-open');
  };
  const scheduleClose = () => {
    clearTimeout(closeTimer);
    closeTimer = setTimeout(() => panel.classList.remove('is-open'), 180);
  };
  trigger.addEventListener('mouseenter', open);
  trigger.addEventListener('mouseleave', scheduleClose);
  panel.addEventListener('mouseenter', () => clearTimeout(closeTimer));
  panel.addEventListener('mouseleave', scheduleClose);
  const link = trigger.querySelector('a');
  if (link) {
    link.addEventListener('focus', open);
    link.addEventListener('keydown', (event) => {
      if (event.key === 'Escape') {
        panel.classList.remove('is-open');
        link.blur();
      }
    });
  }
});
document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape') document.querySelectorAll('[data-mega-panel].is-open').forEach((panel) => panel.classList.remove('is-open'));
});

const predictiveInput = document.querySelector('[data-predictive-input]');
const predictiveResults = document.querySelector('[data-predictive-results]');
const predictiveContent = document.querySelector('[data-predictive-content]');
const recentKey = 'tb_recent_searches';

function escapeHtml(value) {
  return String(value == null ? '' : value).replace(/[&<>"']/g, (ch) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[ch]));
}

function getRecent() {
  try {
    return JSON.parse(localStorage.getItem(recentKey) || '[]');
  } catch (e) {
    return [];
  }
}

function saveRecent(term) {
  if (!term) return;
  const list = [term, ...getRecent().filter((t) => t !== term)].slice(0, 5);
  try {
    localStorage.setItem(recentKey, JSON.stringify(list));
  } catch (e) {}
}

function renderRecent(term) {
  const recent = getRecent().filter((t) => t !== term).slice(0, 5);
  if (!recent.length) return '';
  return `<div class="predictive-search__group predictive-search__group--recent"><h3>Zuletzt gesucht</h3><ul>${recent.map((t) => `<li><a href="${predictiveUrl}?q=${encodeURIComponent(t)}">${escapeHtml(t)}</a></li>`).join('')}</ul></div>`;
}

function renderGroup(heading, list) {
  if (!list || list.length === 0) return '';
  return `<div class="predictive-search__group"><h3>${escapeHtml(heading)}</h3><ul>${list.map((item) => {
    const price = item.price != null ? `<span class="predictive-search__price">${escapeHtml(item.price)}</span>` : '';
    const img = item.image ? `<span class="predictive-search__thumb">${item.image}</span>` : '';
    return `<li><a href="${item.url}">${img}<span class="predictive-search__title">${escapeHtml(item.title)}</span>${price}</a></li>`;
  }).join('')}</ul></div>`;
}

function renderEmpty(term) {
  return `<div class="container predictive-search__inner"><p class="predictive-search__empty">Keine Ergebnisse für „${escapeHtml(term)}“.</p>${renderRecent('')}</div>`;
}

function renderPredictive(data, term) {
  const results = (data && data.resources && data.resources.results) || {};
  const products = results.products || [];
  const collections = results.collections || [];
  const articles = results.articles || [];
  const pages = results.pages || [];
  const sections = [
    renderGroup('Produkte', products),
    renderGroup('Kollektionen', collections),
    renderGroup('Artikel', articles),
    renderGroup('Seiten', pages)
  ].filter(Boolean).join('');
  if (!sections) return renderEmpty(term);
  return `<div class="container predictive-search__inner">${renderRecent(term)}<div class="predictive-search__grid">${sections}</div><a class="predictive-search__all" href="${searchUrl}?q=${encodeURIComponent(term)}&type=${encodeURIComponent(predictiveInput.dataset.searchType || 'product,collection,article,page')}">Alle Ergebnisse für „${escapeHtml(term)}“ anzeigen ↗</a></div>`;
}

function closePredictive() {
  if (!predictiveResults) return;
  predictiveResults.setAttribute('hidden', '');
  predictiveInput?.setAttribute('aria-expanded', 'false');
}

let predictiveTimer = null;
let predictiveController = null;
const predictiveUrl = document.querySelector('[data-predictive-input]')?.dataset.predictiveUrl || '';
const searchUrl = document.querySelector('[data-predictive-input]')?.dataset.searchUrl || '';

if (predictiveInput && predictiveResults && predictiveUrl) {
  predictiveInput.addEventListener('input', () => {
    clearTimeout(predictiveTimer);
    const term = predictiveInput.value.trim();
    predictiveInput.setAttribute('aria-expanded', 'true');
    if (term.length < 2) {
      closePredictive();
      return;
    }
    predictiveTimer = setTimeout(async () => {
      if (predictiveController) predictiveController.abort();
      predictiveController = new AbortController();
      try {
        const params = new URLSearchParams({ q: term });
        const types = (predictiveInput.dataset.searchType || 'product,collection,article,page').split(',');
        types.forEach((type) => params.append('resources[type]', type.trim()));
        params.append('resources[limit]', '4');
        const response = await fetch(`${predictiveUrl}?${params.toString()}`, { signal: predictiveController.signal, headers: { Accept: 'application/json' } });
        if (!response.ok) {
          closePredictive();
          return;
        }
        const data = await response.json();
        predictiveContent.innerHTML = renderPredictive(data, term);
        predictiveResults.removeAttribute('hidden');
      } catch (error) {
        if (error.name !== 'AbortError') closePredictive();
      }
    }, 180);
  });
  predictiveInput.addEventListener('keydown', (event) => {
    if (event.key === 'Enter') saveRecent(predictiveInput.value.trim());
  });
  predictiveInput.addEventListener('focus', () => {
    if (predictiveInput.value.trim().length === 0) {
      predictiveContent.innerHTML = `<div class="container predictive-search__inner">${renderRecent('')}</div>`;
      predictiveResults.removeAttribute('hidden');
      predictiveInput.setAttribute('aria-expanded', 'true');
    } else if (predictiveInput.value.trim().length >= 2) {
      predictiveInput.setAttribute('aria-expanded', 'true');
    }
  });
  document.addEventListener('click', (event) => {
    if (!predictiveResults.contains(event.target) && event.target !== predictiveInput) closePredictive();
  });
}
