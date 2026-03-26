const checkedPokemons = new Set();
let activeSkillFilter = null;

function buildFilters() {
    const bar = document.getElementById('filterBar');
    bar.innerHTML = '';

    const allSkills = new Set();
    POKEMONS.forEach(p => p.skills.forEach(s => {
        if (s !== '--') allSkills.add(s.trim());
    }));

    const normalSkills = [...allSkills].filter(s => !SPECIAL_SKILLS.has(s)).sort();

    const allChip = document.createElement('div');
    allChip.className = 'chip active';
    allChip.textContent = '全部';
    allChip.onclick = () => setFilter('', allChip);
    bar.appendChild(allChip);

    normalSkills.forEach(skill => {
        const chip = document.createElement('div');
        chip.className = 'chip';
        chip.textContent = skill;
        chip.onclick = () => setFilter(skill, chip);
        bar.appendChild(chip);
    });

    const specChip = document.createElement('div');
    specChip.className = 'chip special';
    specChip.textContent = '✨ 特殊';
    specChip.onclick = () => setFilter('__special__', specChip);
    bar.appendChild(specChip);
}

function setFilter(skill, clickedChip) {
    activeSkillFilter = skill || null;
    document.querySelectorAll('#filterBar .chip').forEach(c => c.classList.remove('active'));
    clickedChip.classList.add('active');
    renderPokemons();
}

function renderPokemons() {
    const q = document.getElementById('pokeSearch').value.trim().toLowerCase();
    const grid = document.getElementById('pokeGrid');
    grid.innerHTML = '';

    const filtered = POKEMONS.filter(p => {
        if (q) {
            const name = p.name.toLowerCase();
            const hab = p.habitat.toLowerCase();
            const move = p.move.toLowerCase();
            const skills = p.skills.join(' ').toLowerCase();
            if (!name.includes(q) && !hab.includes(q) && !move.includes(q) && !skills.includes(q)) return false;
        }

        if (activeSkillFilter === '__special__') {
            return p.skills.some(s => SPECIAL_SKILLS.has(s.trim()));
        }

        if (activeSkillFilter) {
            return p.skills.some(s => s.trim() === activeSkillFilter);
        }

        return true;
    });

    filtered.forEach(p => {
        const id = `p${p.num}_${p.name}`;
        const isChecked = checkedPokemons.has(id);

        const card = document.createElement('div');
        card.className = 'pokemon-card' + (isChecked ? ' checked' : '');

        const skillHtml = p.skills.map(s => {
            s = s.trim();
            if (s === '--') return '';
            let cls = 'poke-skill';
            if (s === SCATTER_SKILL) cls += ' scatter';
            if (SPECIAL_SKILLS.has(s)) cls += ' special-tag';
            return `<span class="${cls}">${s}</span>`;
        }).join('');

        const scatterHtml = p.scatterItem ? `<div class="scatter-item">📦 亂撒：${p.scatterItem}</div>` : '';
        const moveHtml = p.move && p.move !== '--' ? `<div class="poke-move">⚡ 傳授：${p.move}</div>` : '';
        const habHtml = p.habitat && p.habitat !== '--' ? `<div class="poke-habitat">📍 ${p.habitat}</div>` : '';

        card.innerHTML = `
      <div class="poke-check"><span class="poke-check-icon">✓</span></div>
      <img class="poke-img" src="${p.img}" alt="${p.name}" onerror="this.style.display='none';this.nextElementSibling.style.display='flex'">
      <div class="poke-img-placeholder" style="display:none">🐾</div>
      <div class="poke-info">
        <div class="poke-num">No.${p.num}</div>
        <div class="poke-name">${p.name}</div>
        <div class="poke-skills-wrap">${skillHtml}</div>
        ${scatterHtml}
        ${moveHtml}
        ${habHtml}
      </div>
    `;

        card.addEventListener('click', () => togglePokemon(id, card));
        grid.appendChild(card);
    });
}

function togglePokemon(id, card) {
    if (checkedPokemons.has(id)) {
        checkedPokemons.delete(id);
        card.classList.remove('checked');
    } else {
        checkedPokemons.add(id);
        card.classList.add('checked');
    }
    updatePokeSide();
}

function clearCheckedPokemons() {
    checkedPokemons.clear();
    renderPokemons();
    updatePokeSide();
}

function updatePokeSide() {
    const count = checkedPokemons.size;
    const badge = document.getElementById('pokeCheckedCount');
    badge.textContent = count;
    badge.style.display = count > 0 ? 'inline-block' : 'none';

    const empty = document.getElementById('pokeEmpty');
    const matDiv = document.getElementById('pokeMaterials');

    if (count === 0) {
        empty.style.display = 'block';
        matDiv.innerHTML = '';
        return;
    }

    empty.style.display = 'none';

    const habNeeded = new Map();
    const materials = {};

    checkedPokemons.forEach(id => {
        const withoutP = id.replace(/^p/, '');
        const underIdx = withoutP.indexOf('_');
        const numPart = withoutP.substring(0, underIdx);
        const namePart = withoutP.substring(underIdx + 1);
        const p = POKEMONS.find(pk => pk.num === numPart && pk.name === namePart);
        if (!p || !p.habitat || p.habitat === '--') return;

        const habNames = p.habitat.trim().split(/[／/]/).map(n => n.trim());

        habNames.forEach(habName => {
            const h = HABITATS.find(h => h.name === habName);
            if (!h) return;

            const current = habNeeded.get(habName);
            if (current) {
                current.qty += 1;
            } else {
                habNeeded.set(habName, { habitat: h, qty: 1 });
            }
        });
    });

    habNeeded.forEach(({ habitat, qty }) => {
        habitat.contents.forEach(c => {
            const parsed = parseMaterialText(c);
            if (!parsed.name) return;
            materials[parsed.name] = (materials[parsed.name] || 0) + parsed.count * qty;
        });
    });

    let html = '';

    if (habNeeded.size > 0) {
        const totalHabQty = Array.from(habNeeded.values()).reduce((sum, item) => sum + item.qty, 0);

        html += `<div style="font-size:12px;color:var(--text3);margin-bottom:8px;">需要 ${totalHabQty} 個棲息地：</div>`;

        habNeeded.forEach(({ habitat, qty }, habName) => {
            const imgEl = `<img style="width:40px;height:30px;object-fit:cover;border-radius:5px;flex-shrink:0;background:var(--bg3);" src="${habitat.img}" alt="${habName}" onerror="this.style.display='none'">`;

            html += `
        <div style="display:flex;align-items:center;justify-content:space-between;gap:8px;padding:5px 0;border-bottom:1px solid var(--border);font-size:12px;">
          <div style="display:flex;align-items:center;gap:8px;min-width:0;">
            ${imgEl}
            <span style="color:var(--text);">${habName}</span>
          </div>
          <span style="color:var(--accent);font-weight:700;flex-shrink:0;">×${qty}</span>
        </div>
      `;
        });

        if (Object.keys(materials).length > 0) {
            html += `<div style="font-size:12px;color:var(--text3);margin:12px 0 8px;">所需材料合計：</div>`;
            html += Object.entries(materials)
                .sort((a, b) => b[1] - a[1])
                .map(([name, cnt]) =>
                    `<div class="material-row"><span class="mat-name">${name}</span><span class="mat-count">×${cnt}</span></div>`
                ).join('');
        }
    }

    matDiv.innerHTML = html;
}

mountLayout('pokemons');
document.getElementById('pokeSearch').addEventListener('input', renderPokemons);
document.getElementById('clearPokeCheckedBtn').addEventListener('click', clearCheckedPokemons);

buildFilters();
renderPokemons();
updatePokeSide();