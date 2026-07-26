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

document.querySelectorAll('[data-variant-select]').forEach((select) => {
  select.addEventListener('change', () => {
    const option = select.options[select.selectedIndex];
    const price = select.closest('[data-product-section]')?.querySelector('[data-product-price] strong');
    if (price && option.dataset.price) price.textContent = option.dataset.price;
  });
});
