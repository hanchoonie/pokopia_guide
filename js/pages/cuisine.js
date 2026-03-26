function getFlavorClass(flavor) {
    const map = {
        '甜': 'flavor-甜',
        '酸': 'flavor-酸',
        '苦': 'flavor-苦',
        '辣': 'flavor-辣',
        '澀': 'flavor-澀',
        '無': 'flavor--'
    };
    return map[flavor] || 'flavor--';
}

function renderCuisineSections() {
    const container = document.getElementById('cuisineSections');
    if (!container) return;

    container.innerHTML = CUISINE_DATA.map(section => `
        <section class="cuisine-section">
            <h2>${section.icon} ${section.category}（強化技能：${section.skill}）</h2>
            <p style="color:var(--text3);font-size:13px;margin-bottom:10px;">料理器具：${section.tool}</p>

            <table class="data-table">
                <tr>
                    <th>料理名稱</th>
                    <th>等級</th>
                    <th>味道</th>
                    <th>配方需求</th>
                </tr>
                ${section.items.map(item => `
                    <tr>
                        <td>${item.name}</td>
                        <td><span class="level-badge">${item.level}</span></td>
                        <td><span class="flavor-tag ${getFlavorClass(item.flavor)}">${item.flavor}</span></td>
                        <td>${item.recipe}</td>
                    </tr>
                `).join('')}
            </table>
        </section>
    `).join('');
}

function renderKabutopsEffects() {
    const container = document.getElementById('kabutopsEffects');
    if (!container) return;

    container.innerHTML = `
        <table class="data-table">
            <tr>
                <th>味道</th>
                <th>效果</th>
            </tr>
            ${KABUTOPS_EFFECTS.map(item => `
                <tr>
                    <td>${item.flavor}</td>
                    <td>${item.effect}</td>
                </tr>
            `).join('')}
        </table>
    `;
}

mountLayout('cuisine');
renderCuisineSections();
renderKabutopsEffects();