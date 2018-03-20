function toggleHidePanel(el) {
    el.dataset.text = el.dataset.text === '+'? '-': '+';
}

document.querySelectorAll('.hideable').forEach(ul => {
    const lh = ul.querySelector('lh');
    lh.dataset.text = '+';

    lh.addEventListener('click', () => {
        toggleHidePanel(lh);
        ul.querySelectorAll(':scope > li').forEach(li => {
            li.classList.toggle('hidden');
        })
    })
});
