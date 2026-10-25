// Editorial atmosphere shared by the home, todoos and view pages:
// drifting aurora, film grain and a soft glow that follows the cursor.
(function () {
    if (document.querySelector('.ed-aurora')) return;

    const mount = () => {
        const layers = document.createElement('div');
        layers.setAttribute('aria-hidden', 'true');
        layers.innerHTML = `
            <div class="ed-aurora">
                <div class="ed-blob ed-blob--a"></div>
                <div class="ed-blob ed-blob--b"></div>
                <div class="ed-blob ed-blob--c"></div>
            </div>
            <div class="ed-glow"></div>
            <div class="ed-grain"></div>
        `;
        document.body.prepend(...layers.children);

        if (!matchMedia('(hover: hover)').matches) return;

        let tx = innerWidth / 2, ty = innerHeight * 0.3, x = tx, y = ty;
        addEventListener('pointermove', (e) => { tx = e.clientX; ty = e.clientY; });
        const tick = () => {
            x += (tx - x) * 0.08;
            y += (ty - y) * 0.08;
            document.body.style.setProperty('--gx', `${x}px`);
            document.body.style.setProperty('--gy', `${y}px`);
            requestAnimationFrame(tick);
        };
        tick();
    };

    if (document.body) mount();
    else document.addEventListener('DOMContentLoaded', mount);
})();

// The settings overlay opens as a circle growing out of the icon that was clicked.
document.addEventListener('click', (e) => {
    const trigger = e.target.closest && e.target.closest('.settings-toggle');
    const panel = document.getElementById('settings-drawer');
    if (!trigger || !panel) return;
    const r = trigger.getBoundingClientRect();
    panel.style.setProperty('--ox', `${r.left + r.width / 2}px`);
    panel.style.setProperty('--oy', `${r.top + r.height / 2}px`);
}, true);
