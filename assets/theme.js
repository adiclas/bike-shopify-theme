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
  if (event.key === 'Escape') setSearch(false);
});

document.querySelectorAll('[data-variant-select]').forEach((select) => {
  select.addEventListener('change', () => {
    const option = select.options[select.selectedIndex];
    const price = select.closest('[data-product-section]')?.querySelector('[data-product-price] strong');
    if (price && option.dataset.price) price.textContent = option.dataset.price;
  });
});
