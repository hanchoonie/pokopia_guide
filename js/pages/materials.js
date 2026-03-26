function renderMaterials() {
    const matGrid = document.getElementById('matGrid');
    if (!matGrid) return;

    const typeColor = {
        '食物/可加工': 'var(--green)',
        '食物/料理': 'var(--green)',
        '道具': 'var(--accent)',
        '材料': 'var(--blue)',
        '材料/可加工': 'var(--accent4)',
        '加工品': 'var(--orange)'
    };

    matGrid.innerHTML = MATERIALS_DATA.map(m => `
        <div class="mat-card">
            <div class="mat-type" style="color:${typeColor[m.type] || 'var(--text3)'}">【${m.type}】</div>
            <div class="mat-name-big">${m.name}</div>
            <div class="mat-from">📦 取得：${m.how}</div>
            ${m.where && m.where !== '—' ? `<div class="mat-from">📍 地點：${m.where}</div>` : ''}
            ${m.prereq ? `<div class="mat-prereq">⚠️ ${m.prereq}</div>` : ''}
            ${m.use && m.use !== '—' ? `<div class="mat-use">✦ 用途：${m.use}</div>` : ''}
        </div>
    `).join('');
}

mountLayout('materials');
renderMaterials();