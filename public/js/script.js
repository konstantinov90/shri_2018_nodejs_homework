/* eslint-disable no-undef */

/* eslint-disable no-param-reassign */
function toggleHidePanel(el) {
  el.dataset.text = el.dataset.text === '+' ? '-' : '+';
}
/* eslint-enable no-param-reassign */

document.querySelectorAll('.hideable').forEach((ul) => {
  const lh = ul.querySelector('h4');
  lh.dataset.text = '+';

  lh.addEventListener('click', () => {
    toggleHidePanel(lh);
    ul.querySelectorAll(':scope > li').forEach((li) => {
      li.classList.toggle('hidden');
    });
  });
});
