let activeItemFilterType = '';
let activeCategoryFilters = new Set();
let activeTagFilters = new Set();

function normalizeText(value) {
    return (value || '').toString().trim();
}

function escapeHtml(str) {
    return (str || '').replace(/[&<>"']/g, ch => {
        const map = {
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&#39;'
        };
        return map[ch];
    });
}

function makeTagHtml(values, className = '') {
    if (!values || values.length === 0) return '';
    return values
        .map(v => `<span class="poke-tag ${className}">${escapeHtml(v)}</span>`)
        .join('');
}

function getAllFilterValues(type) {
    const values = new Set();

    (POKEMON_FAVORITE_THINGS || []).forEach(item => {
        const list = item[type] || [];
        list.forEach(v => {
            const text = normalizeText(v);
            if (text) values.add(text);
        });
    });

    return [...values].sort((a, b) => a.localeCompare(b, 'zh-Hant'));
}

function toggleFilter(value, type) {
    const targetSet = type === 'categories' ? activeCategoryFilters : activeTagFilters;

    if (targetSet.has(value)) {
        targetSet.delete(value);
    } else {
        targetSet.add(value);
    }

    buildItemFilters();
    renderSelectedFilters();
    renderItems();
}

function removeSelectedFilter(type, value) {
    if (type === 'categories') {
        activeCategoryFilters.delete(value);
    } else if (type === 'tags') {
        activeTagFilters.delete(value);
    }

    buildItemFilters();
    renderSelectedFilters();
    renderItems();
}

function clearAllFilters() {
    document.getElementById('itemSearch').value = '';
    document.getElementById('itemFilterType').value = '';
    activeItemFilterType = '';
    activeCategoryFilters.clear();
    activeTagFilters.clear();

    buildItemFilters();
    renderSelectedFilters();
    renderItems();
}

function buildItemFilters() {
    const bar = document.getElementById('itemFilterBar');
    if (!bar) return;

    bar.innerHTML = '';

    if (!activeItemFilterType) {
        bar.style.display = 'none';
        return;
    }

    const values = getAllFilterValues(activeItemFilterType);
    bar.style.display = 'flex';

    const clearTypeChip = document.createElement('button');
    clearTypeChip.type = 'button';
    clearTypeChip.className = 'chip';
    clearTypeChip.textContent = activeItemFilterType === 'categories' ? '清除類別' : '清除標籤';
    clearTypeChip.onclick = () => {
        if (activeItemFilterType === 'categories') {
            activeCategoryFilters.clear();
        } else {
            activeTagFilters.clear();
        }
        buildItemFilters();
        renderSelectedFilters();
        renderItems();
    };
    bar.appendChild(clearTypeChip);

    values.forEach(value => {
        const chip = document.createElement('button');
        chip.type = 'button';

        const isActive = activeItemFilterType === 'categories'
            ? activeCategoryFilters.has(value)
            : activeTagFilters.has(value);

        chip.className = 'chip' + (isActive ? ' active' : '');
        chip.textContent = value;
        chip.onclick = () => toggleFilter(value, activeItemFilterType);

        bar.appendChild(chip);
    });
}

function renderSelectedFilters() {
    const wrap = document.getElementById('selectedFilters');
    if (!wrap) return;

    const categoryList = [...activeCategoryFilters];
    const tagList = [...activeTagFilters];

    if (categoryList.length === 0 && tagList.length === 0) {
        wrap.style.display = 'none';
        wrap.innerHTML = '';
        return;
    }

    wrap.style.display = 'flex';

    const parts = [];

    parts.push(`<div class="selected-filters-title">已選條件：</div>`);

    categoryList.forEach(value => {
        parts.push(`
            <button type="button" class="selected-filter-chip" data-type="categories" data-value="${escapeHtml(value)}">
                類別：${escapeHtml(value)} <span class="remove">✕</span>
            </button>
        `);
    });

    tagList.forEach(value => {
        parts.push(`
            <button type="button" class="selected-filter-chip" data-type="tags" data-value="${escapeHtml(value)}">
                標籤：${escapeHtml(value)} <span class="remove">✕</span>
            </button>
        `);
    });

    parts.push(`
        <button type="button" class="selected-filter-clear" id="selectedFilterClearBtn">
            清除全部
        </button>
    `);

    wrap.innerHTML = parts.join('');

    wrap.querySelectorAll('.selected-filter-chip').forEach(btn => {
        btn.addEventListener('click', () => {
            const type = btn.dataset.type;
            const value = btn.dataset.value;
            removeSelectedFilter(type, value);
        });
    });

    const clearBtn = document.getElementById('selectedFilterClearBtn');
    if (clearBtn) {
        clearBtn.addEventListener('click', clearAllFilters);
    }
}

function handleItemFilterTypeChange() {
    const select = document.getElementById('itemFilterType');
    activeItemFilterType = select.value;
    buildItemFilters();
}

function itemMatchesSearch(item, q) {
    if (!q) return true;

    const name = normalizeText(item.name).toLowerCase();
    const categories = (item.categories || []).map(v => normalizeText(v).toLowerCase());
    const tags = (item.tags || []).map(v => normalizeText(v).toLowerCase());

    return (
        name.includes(q) ||
        categories.some(v => v.includes(q)) ||
        tags.some(v => v.includes(q))
    );
}

function itemMatchesFilters(item) {
    const categories = (item.categories || []).map(normalizeText);
    const tags = (item.tags || []).map(normalizeText);

    const matchedCategories =
        activeCategoryFilters.size === 0 ||
        [...activeCategoryFilters].every(filter => categories.includes(filter));

    const matchedTags =
        activeTagFilters.size === 0 ||
        [...activeTagFilters].every(filter => tags.includes(filter));

    return matchedCategories && matchedTags;
}

function renderItems() {
    const grid = document.getElementById('itemsGrid');
    if (!grid) return;

    const q = normalizeText(document.getElementById('itemSearch')?.value).toLowerCase();

    const items = (POKEMON_FAVORITE_THINGS || []).filter(item => {
        return itemMatchesSearch(item, q) && itemMatchesFilters(item);
    });

    grid.innerHTML = '';

    if (items.length === 0) {
        grid.innerHTML = `<div class="items-empty">找不到符合條件的物品</div>`;
        return;
    }

    items.forEach(item => {
        const card = document.createElement('div');
        card.className = 'item-card';

        const categoriesHtml = makeTagHtml(item.categories || [], 'category-tag');
        const tagsHtml = makeTagHtml(item.tags || [], 'item-type-tag');

        card.innerHTML = `
            <div class="item-id">${escapeHtml(item.id || '')}</div>
            <div class="item-name">${escapeHtml(item.name || '未命名物品')}</div>

            <div class="item-field">
                <div class="item-label">類別</div>
                <div class="tag-wrap">${categoriesHtml || '<span style="color:#9ca3af;">--</span>'}</div>
            </div>

            <div class="item-field">
                <div class="item-label">標籤</div>
                <div class="tag-wrap">${tagsHtml || '<span style="color:#9ca3af;">--</span>'}</div>
            </div>
        `;

        grid.appendChild(card);
    });
}

function initFavoriteThingsPage() {
    mountLayout?.('favorite_things');

    const searchInput = document.getElementById('itemSearch');
    const filterTypeSelect = document.getElementById('itemFilterType');
    const clearAllBtn = document.getElementById('clearAllFiltersBtn');

    searchInput?.addEventListener('input', renderItems);
    filterTypeSelect?.addEventListener('change', handleItemFilterTypeChange);
    clearAllBtn?.addEventListener('click', clearAllFilters);

    buildItemFilters();
    renderSelectedFilters();
    renderItems();
}

initFavoriteThingsPage();