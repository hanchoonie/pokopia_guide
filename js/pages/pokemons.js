const checkedPokemons = new Set();

let activeFilterType = '';
let activeFilterValue = null;

function normalizeText(value) {
    return (value || '').toString().trim();
}

function isValidValue(value) {
    return value && value !== '--';
}

function getPokemonFilterValues(p, type) {
    switch (type) {
        case 'skills':
            return (p.skills || [])
                .map(v => normalizeText(v))
                .filter(v => isValidValue(v));

        case 'flavor':
            return isValidValue(p.flavor) ? [normalizeText(p.flavor)] : [];

        case 'favorite_food':
            return (p.favorite_food || [])
                .map(v => normalizeText(v))
                .filter(v => isValidValue(v));

        case 'favorite_environment':
            return (p.favorite_environment || [])
                .map(v => normalizeText(v))
                .filter(v => isValidValue(v));

        case 'favorite_things':
            return (p.favorite_things || [])
                .map(v => normalizeText(v))
                .filter(v => isValidValue(v));

        default:
            return [];
    }
}

function parsePokemonId(id) {
    const withoutP = id.replace(/^p/, '');
    const underIdx = withoutP.indexOf('_');
    const numPart = withoutP.substring(0, underIdx);
    const namePart = withoutP.substring(underIdx + 1);

    return { numPart, namePart };
}

function getPokemonByCheckedId(id) {
    const { numPart, namePart } = parsePokemonId(id);
    return POKEMONS.find(pk => pk.num === numPart && pk.name === namePart);
}

function setFilter(value, clickedChip) {
    activeFilterValue = value || null;

    document.querySelectorAll('#filterBar .chip').forEach(c => {
        c.classList.remove('active');
    });

    if (clickedChip) {
        clickedChip.classList.add('active');
    }

    renderPokemons();
}

function handleFilterTypeChange() {
    const select = document.getElementById('filterTypeSelect');
    activeFilterType = select.value;
    activeFilterValue = null;
    buildFilters();
    renderPokemons();
}

function buildFilters() {
    const bar = document.getElementById('filterBar');
    bar.innerHTML = '';

    if (!activeFilterType) {
        bar.style.display = 'none';
        return;
    }

    bar.style.display = 'flex';

    const values = new Set();

    POKEMONS.forEach(p => {
        getPokemonFilterValues(p, activeFilterType).forEach(v => values.add(v));
    });

    const items = [...values];

    const allChip = document.createElement('div');
    allChip.className = 'chip' + (!activeFilterValue ? ' active' : '');
    allChip.textContent = '全部';
    allChip.onclick = () => setFilter(null, allChip);
    bar.appendChild(allChip);

    if (activeFilterType === 'skills') {
        const normalItems = items
            .filter(v => !SPECIAL_SKILLS.has(v))
            .sort((a, b) => a.localeCompare(b, 'zh-Hant'));

        normalItems.forEach(value => {
            const chip = document.createElement('div');
            chip.className = 'chip';
            chip.textContent = value;
            chip.onclick = () => setFilter(value, chip);
            bar.appendChild(chip);
        });

        const hasSpecial = items.some(v => SPECIAL_SKILLS.has(v));
        if (hasSpecial) {
            const specialChip = document.createElement('div');
            specialChip.className = 'chip special' + (activeFilterValue === '__special__' ? ' active' : '');
            specialChip.textContent = '✨ 特殊';
            specialChip.onclick = () => setFilter('__special__', specialChip);
            bar.appendChild(specialChip);
        }

        return;
    }

    items
        .sort((a, b) => a.localeCompare(b, 'zh-Hant'))
        .forEach(value => {
            const chip = document.createElement('div');
            chip.className = 'chip';
            chip.textContent = value;
            chip.onclick = () => setFilter(value, chip);
            bar.appendChild(chip);
        });
}

function makeTagHtml(values, className = '') {
    if (!values || values.length === 0) return '';

    return values
        .map(v => `<span class="poke-tag ${className}">${v}</span>`)
        .join('');
}

function makeFieldRow(label, tagsHtml) {
    if (!tagsHtml) return '';

    return `
      <div class="poke-field-row">
        <span class="field-label">${label}</span>
        <div class="poke-tags-wrap">${tagsHtml}</div>
      </div>
    `;
}

function findMatchingFavoriteItemsForPokemon(pokemon) {
    const favoriteThings = new Set(
        (pokemon.favorite_things || [])
            .map(v => normalizeText(v))
            .filter(v => isValidValue(v))
    );

    if (favoriteThings.size === 0) return [];

    return (POKEMON_FAVORITE_THINGS || []).filter(item => {
        const name = normalizeText(item.name);
        const categories = (item.categories || []).map(normalizeText);
        const tags = (item.tags || []).map(normalizeText);

        if (favoriteThings.has(name)) return true;
        if (categories.some(v => favoriteThings.has(v))) return true;
        if (tags.some(v => favoriteThings.has(v))) return true;

        return false;
    });
}

function collectFavoriteItemsForCheckedPokemons() {
    const itemMap = new Map();

    checkedPokemons.forEach(id => {
        const p = getPokemonByCheckedId(id);
        if (!p) return;

        const matchedItems = findMatchingFavoriteItemsForPokemon(p);

        matchedItems.forEach(item => {
            const key = item.id || item.name;
            if (!itemMap.has(key)) {
                itemMap.set(key, item);
            }
        });
    });

    return [...itemMap.values()];
}

function renderPokemons() {
    const q = document.getElementById('pokeSearch').value.trim().toLowerCase();
    const grid = document.getElementById('pokeGrid');
    grid.innerHTML = '';

    const filtered = POKEMONS.filter(p => {
        if (q) {
            const name = (p.name || '').toLowerCase();
            const hab = (p.habitat || '').toLowerCase();
            const move = (p.move || '').toLowerCase();
            const skills = (p.skills || []).join(' ').toLowerCase();
            const flavor = (p.flavor || '').toLowerCase();
            const favoriteFood = (p.favorite_food || []).join(' ').toLowerCase();
            const favoriteEnvironment = (p.favorite_environment || []).join(' ').toLowerCase();
            const favoriteThings = (p.favorite_things || []).join(' ').toLowerCase();

            const matched =
                name.includes(q) ||
                hab.includes(q) ||
                move.includes(q) ||
                skills.includes(q) ||
                flavor.includes(q) ||
                favoriteFood.includes(q) ||
                favoriteEnvironment.includes(q) ||
                favoriteThings.includes(q);

            if (!matched) return false;
        }

        if (activeFilterValue) {
            if (activeFilterType === 'skills' && activeFilterValue === '__special__') {
                return getPokemonFilterValues(p, 'skills').some(v => SPECIAL_SKILLS.has(v));
            }

            const values = getPokemonFilterValues(p, activeFilterType);
            return values.includes(activeFilterValue);
        }

        return true;
    });

    filtered.forEach(p => {
        const id = `p${p.num}_${p.name}`;
        const isChecked = checkedPokemons.has(id);

        const card = document.createElement('div');
        card.className = 'pokemon-card' + (isChecked ? ' checked' : '');
        card.dataset.pokemonId = id;

        const skillHtml = getPokemonFilterValues(p, 'skills')
            .map(s => {
                let cls = 'poke-tag skill-tag';
                if (s === SCATTER_SKILL) cls += ' scatter';
                if (SPECIAL_SKILLS.has(s)) cls += ' special-tag';
                return `<span class="${cls}">${s}</span>`;
            })
            .join('');

        const flavorHtml = makeTagHtml(getPokemonFilterValues(p, 'flavor'), 'flavor-tag');
        const foodHtml = makeTagHtml(getPokemonFilterValues(p, 'favorite_food'), 'food-tag');
        const envHtml = makeTagHtml(getPokemonFilterValues(p, 'favorite_environment'), 'env-tag');
        const thingHtml = makeTagHtml(getPokemonFilterValues(p, 'favorite_things'), 'thing-tag');

        const habitatTags = p.habitat && p.habitat !== '--'
            ? p.habitat
                .split(/[／/]/)
                .map(v => v.trim())
                .filter(v => v && v !== '--')
                .map(v => `<span class="poke-tag habitat-tag">${v}</span>`)
                .join('')
            : '';

        const scatterHtml = p.scatterItem
            ? `<div class="scatter-item">📦 亂撒：${p.scatterItem}</div>`
            : '';

        const moveHtml = p.move && p.move !== '--'
            ? `<div class="poke-move">⚡ 傳授：${p.move}</div>`
            : '';

        card.innerHTML = `
          <div class="poke-check"><span class="poke-check-icon">✓</span></div>

          <img
            class="poke-img"
            src="${p.img}"
            alt="${p.name}"
            onerror="this.style.display='none';this.nextElementSibling.style.display='flex'"
          >
          <div class="poke-img-placeholder" style="display:none">🐾</div>

          <div class="poke-info">
            <div class="poke-num">No.${p.num}</div>
            <div class="poke-name">${p.name}</div>

            ${makeFieldRow('✨ 技能', skillHtml)}
            ${scatterHtml}
            ${moveHtml}
            ${makeFieldRow('📍 棲息地', habitatTags)}
            ${makeFieldRow('🍽️ 口味', flavorHtml)}
            ${makeFieldRow('🥕 喜愛食物', foodHtml)}
            ${makeFieldRow('🌤️ 喜愛環境', envHtml)}
            ${makeFieldRow('🎀 喜歡事物', thingHtml)}
          </div>
        `;

        card.addEventListener('click', () => togglePokemon(id));
        grid.appendChild(card);
    });
}

function togglePokemon(id) {
    if (checkedPokemons.has(id)) {
        checkedPokemons.delete(id);
    } else {
        checkedPokemons.add(id);
    }

    renderPokemons();
    updatePokeSide();
}

function removeSelectedPokemon(id) {
    if (!checkedPokemons.has(id)) return;
    checkedPokemons.delete(id);
    renderPokemons();
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

    const selectedPokemons = [];
    const habNeeded = new Map();
    const materials = {};

    checkedPokemons.forEach(id => {
        const p = getPokemonByCheckedId(id);
        if (!p) return;

        selectedPokemons.push({ id, pokemon: p });

        if (!p.habitat || p.habitat === '--') return;

        const habNames = p.habitat
            .trim()
            .split(/[／/]/)
            .map(n => n.trim());

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

    const favoriteItems = collectFavoriteItemsForCheckedPokemons();

    let html = '';

    if (selectedPokemons.length > 0) {
        html += `<div class="selected-section-title">已選擇的寶可夢（點擊可移除）：</div>`;
        html += `<div class="selected-pokemon-list">`;

        html += selectedPokemons
            .sort((a, b) => (a.pokemon.num || '').localeCompare(b.pokemon.num || '', 'zh-Hant'))
            .map(({ id, pokemon }) => `
                <button
                    type="button"
                    class="selected-pokemon-chip"
                    data-remove-id="${id}"
                    title="移除 ${pokemon.name}"
                >
                    <img
                        src="${pokemon.img}"
                        alt="${pokemon.name}"
                        onerror="this.style.display='none'"
                    >
                    <span class="name">${pokemon.name}</span>
                </button>
            `)
            .join('');

        html += `</div>`;
    }

    if (habNeeded.size > 0) {
        const totalHabQty = Array.from(habNeeded.values()).reduce((sum, item) => sum + item.qty, 0);

        html += `<div style="font-size:12px;color:var(--text3);margin-bottom:8px;">需要 ${totalHabQty} 個棲息地：</div>`;

        habNeeded.forEach(({ habitat, qty }, habName) => {
            const imgEl = `
              <img
                style="width:40px;height:30px;object-fit:cover;border-radius:5px;flex-shrink:0;background:var(--bg3);"
                src="${habitat.img}"
                alt="${habName}"
                onerror="this.style.display='none'"
              >
            `;

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
                .map(([name, cnt]) => `
                  <div class="material-row">
                    <span class="mat-name">${name}</span>
                    <span class="mat-count">×${cnt}</span>
                  </div>
                `)
                .join('');
        }
    }

    if (favoriteItems.length > 0) {
        html += `<div style="font-size:12px;color:var(--text3);margin:14px 0 8px;">對應的喜愛物品：</div>`;

        html += favoriteItems
            .sort((a, b) => (a.name || '').localeCompare((b.name || ''), 'zh-Hant'))
            .map(item => {
                const categoryHtml = (item.categories || [])
                    .map(v => `<span class="poke-tag thing-tag">${v}</span>`)
                    .join('');

                const tagHtml = (item.tags || [])
                    .map(v => `<span class="poke-tag env-tag">${v}</span>`)
                    .join('');

                return `
                  <div style="padding:8px 0;border-bottom:1px solid var(--border);">
                    <div style="font-size:13px;font-weight:700;color:var(--text);margin-bottom:6px;">
                      ${item.name}
                    </div>
                    <div style="display:flex;flex-wrap:wrap;gap:6px;">
                      ${categoryHtml}
                      ${tagHtml}
                    </div>
                  </div>
                `;
            })
            .join('');
    }

    matDiv.innerHTML = html;
    matDiv.scrollTop = 0;

    matDiv.querySelectorAll('[data-remove-id]').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            removeSelectedPokemon(btn.dataset.removeId);
        });
    });
}

mountLayout('pokemons');

document.getElementById('pokeSearch').addEventListener('input', renderPokemons);
document.getElementById('clearPokeCheckedBtn').addEventListener('click', clearCheckedPokemons);
document.getElementById('filterTypeSelect').addEventListener('change', handleFilterTypeChange);

buildFilters();
renderPokemons();
updatePokeSide();