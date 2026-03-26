function renderIslands() {
    const islands = [
        { doll: '伊布布偶', dest: '荒野夢島', legend: '水君', legendNote: '', materials: ['蘋野果', '藤蔓繩', '發光蘑菇'] },
        { doll: '皮卡丘布偶', dest: '汪洋夢島', legend: '雷公', legendNote: '須主線推進', materials: ['線團', '海玻璃碎片', '貝殼'] },
        { doll: '皮皮布偶', dest: '岩山夢島', legend: '—', legendNote: '', materials: ['成熟的蘑菇', '銅', '石灰石'] },
        { doll: '風速狗布偶', dest: '火山夢島', legend: '炎帝', legendNote: '', materials: ['鐵', '金子', '彩光石'] },
        { doll: '快龍布偶', dest: '天空夢島', legend: '超夢', legendNote: '須主線推進', materials: ['廢紙', '寶可金屬', '水晶碎片'] },
        { doll: '百變怪布偶', dest: '隨機', legend: '隨機', legendNote: '', materials: ['隨機'] },
        { doll: '替身布偶', dest: '隨機', legend: '隨機', legendNote: '', materials: ['隨機'] },
    ];

    const dollEmoji = {
        '伊布布偶': '🦊',
        '皮卡丘布偶': '⚡',
        '皮皮布偶': '🌸',
        '風速狗布偶': '🔥',
        '快龍布偶': '🐉',
        '百變怪布偶': '🟣',
        '替身布偶': '👻'
    };

    const grid = document.getElementById('islandGrid');
    grid.innerHTML = islands.map(i => `
      <div class="island-card">
        <div class="island-doll">${dollEmoji[i.doll] || '🧸'}</div>
        <div class="island-name">${i.doll}</div>
        <div class="island-dest">目的地：${i.dest}</div>
        <div class="island-legend">傳說寶可夢：${i.legend}${i.legendNote ? `（${i.legendNote}）` : ''}</div>
        <div class="island-materials">${i.materials.map(m => `<span>${m}</span>`).join('')}</div>
      </div>
    `).join('');
}

mountLayout('dream-islands');
renderIslands();
