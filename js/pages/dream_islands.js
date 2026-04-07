function renderIslands() {
    const grid = document.getElementById('islandGrid');
    if (!grid) return;

    const data = DREAMISLAND_DATA || [];

    grid.innerHTML = `
        <table class="island-table">
            <thead>
                <tr>
                    <th>玩偶</th>
                    <th>獲取地</th>
                    <th>島嶼素材</th>
                </tr>
            </thead>
            <tbody>
                ${data.map(item => `
                    <tr>
                        <td class="col-doll">
                            <div class="doll-wrap">
                                <img src="${item.img}" class="doll-img">
                                <span>${item.doll}</span>
                            </div>
                        </td>

                        <td class="col-dest">
                            ${item.dest}
                        </td>

                        <td class="col-materials">
                            <ul>
                                ${item.materials.map(m => `<li>${m}</li>`).join('')}
                            </ul>
                        </td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
    `;
}

document.addEventListener('DOMContentLoaded', () => {
    if (typeof mountLayout === 'function') {
        mountLayout('dream_islands');
    }
    renderIslands();
});