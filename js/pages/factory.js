function renderFactory() {
    const container = document.getElementById('factorySteps');
    if (!container) return;

    container.innerHTML = FACTORY_DATA.map(s => `
        <div class="factory-step">
            <div class="factory-step-header">
                <div class="step-num">${s.num}</div>
                <div>
                    <div class="step-title">${s.icon} ${s.name}</div>
                    <div class="step-goal">🎯 ${s.goal}</div>
                </div>
            </div>
            <div class="step-body">
                <p>${s.body}</p>
                ${s.zones.map(z => `
                    <div class="sub-zone">
                        <div class="sub-zone-title">${z.title}</div>
                        <p>推薦寶可夢：${z.pokes.map(pk => `<span class="poke-tag">${pk}</span>`).join('')}</p>
                        <p style="margin-top:5px;">${z.desc}</p>
                    </div>
                `).join('')}
            </div>
        </div>
    `).join('');
}

mountLayout('factory');
renderFactory();