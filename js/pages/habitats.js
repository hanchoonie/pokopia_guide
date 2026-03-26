const checkedHabitats = new Map();

function renderHabitats() {
    const q = document.getElementById('habSearch').value.trim().toLowerCase();
    const grid = document.getElementById('habGrid');
    grid.innerHTML = '';

    const filtered = HABITATS.filter(h => {
        if (!q) return true;
        const name = h.name.toLowerCase();
        const contents = h.contents.join(' ').toLowerCase();
        const pokes = h.pokemons.map(p => p.name).join(' ').toLowerCase();
        return name.includes(q) || contents.includes(q) || pokes.includes(q);
    });

    filtered.forEach(h => {
        const id = `h${h.num}_${h.activity ? 'a' : 'n'}`;
        const qty = checkedHabitats.get(id) || 0;
        const isChecked = qty > 0;

        const card = document.createElement('div');
        card.className = 'habitat-card' + (isChecked ? ' checked' : '');
        card.dataset.id = id;

        const imgEl = `
      <img class="hab-img" src="${h.img}" alt="${h.name}"
           onerror="this.style.display='none';this.nextElementSibling.style.display='flex'">
      <div class="hab-img-placeholder" style="display:none">🏕️</div>
    `;

        const contentsClean = h.contents.map(c => c.replace(/\\\*/g, '*')).join('、');
        const pokeHtml = h.pokemons.map(p => {
            let cls = p.stars === 3 ? 'star3' : p.stars === 2 ? 'star2' : '';
            const stars = '★'.repeat(p.stars);
            return `<span class="hab-poke ${cls}">${p.name}${stars}</span>`;
        }).join('');

        card.innerHTML = `
      <div class="hab-check"><span class="hab-check-icon">✓</span></div>
      ${imgEl}
      <div class="hab-info">
        <div class="hab-num">No.${h.num}${h.activity ? '<span class="activity-badge">活動限定</span>' : ''}</div>
        <div class="hab-name">${h.name}${qty > 0 ? ` <span style="color:var(--accent);font-size:12px;">×${qty}</span>` : ''}</div>
        <div class="hab-contents">${contentsClean}</div>
        <div class="hab-pokemon-list">${pokeHtml}</div>
      </div>
    `;

        card.addEventListener('click', () => toggleHabitat(id));
        grid.appendChild(card);
    });
}

function toggleHabitat(id) {
    const current = checkedHabitats.get(id) || 0;
    checkedHabitats.set(id, current + 1);
    renderHabitats();
    updateHabSide();
}

function clearCheckedHabitats() {
    checkedHabitats.clear();
    renderHabitats();
    updateHabSide();
}

function updateHabSide() {
    const materials = {};
    const selectedHabitats = {};

    checkedHabitats.forEach((qty, id) => {
        const [num, type] = id.split('_');
        const numStr = num.replace('h', '');
        const h = HABITATS.find(h => h.num === numStr && (type === 'a') === h.activity);
        if (!h) return;

        selectedHabitats[h.num] = {
            name: h.name,
            qty: (selectedHabitats[h.num]?.qty || 0) + qty
        };

        h.contents.forEach(c => {
            const parsed = parseMaterialText(c);
            if (!parsed.name) return;
            materials[parsed.name] = (materials[parsed.name] || 0) + parsed.count * qty;
        });
    });

    const count = Array.from(checkedHabitats.values()).reduce((sum, qty) => sum + qty, 0);

    const badge = document.getElementById('habCheckedCount');
    badge.textContent = count;
    badge.style.display = count > 0 ? 'inline-block' : 'none';

    const empty = document.getElementById('habEmpty');
    const matDiv = document.getElementById('habMaterials');

    if (Object.keys(materials).length === 0) {
        empty.style.display = 'block';
        matDiv.innerHTML = '';
        return;
    }

    empty.style.display = 'none';

    let html = `<div style="font-size:12px;color:var(--text3);margin-bottom:8px;">已選棲息地：</div>`;
    html += Object.entries(selectedHabitats)
        .sort((a, b) => a[0].localeCompare(b[0]))
        .map(([num, data]) =>
            `<div class="material-row">
      <span class="mat-name">No.${num} ${data.name}</span>
      <span class="mat-count">×${data.qty}</span>
    </div>`
        ).join('');

    html += `<div style="font-size:12px;color:var(--text3);margin:12px 0 8px;">所需材料合計：</div>`;
    html += Object.entries(materials)
        .sort((a, b) => b[1] - a[1])
        .map(([name, cnt]) =>
            `<div class="material-row"><span class="mat-name">${name}</span><span class="mat-count">×${cnt}</span></div>`
        ).join('');

    matDiv.innerHTML = html;
}

mountLayout('habitats');
document.getElementById('habSearch').addEventListener('input', renderHabitats);
document.getElementById('clearHabitatsBtn').addEventListener('click', clearCheckedHabitats);

renderHabitats();
updateHabSide();