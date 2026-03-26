function parseMaterialText(text) {
    const clean = text.replace(/\\\*/g, '*');
    const m = clean.match(/^(.+?)\*(\d+)$/);

    if (m) {
        return {
            name: m[1].trim(),
            count: parseInt(m[2], 10)
        };
    }

    return {
        name: clean.trim(),
        count: clean.trim() ? 1 : 0
    };
}

function renderHeader(activePage) {
    return `
      <header>
        <div class="header-inner">
          <div class="logo">Pokopia <span>Guide</span></div>
          <nav>
            <a href="habitats.html" class="${activePage === 'habitats' ? 'active' : ''}">棲息地</a>
            <a href="pokemons.html" class="${activePage === 'pokemons' ? 'active' : ''}">寶可夢</a>
            <a href="dream-islands.html" class="${activePage === 'dream-islands' ? 'active' : ''}">夢島</a>
            <a href="cuisine.html" class="${activePage === 'cuisine' ? 'active' : ''}">料理</a>
            <a href="materials.html" class="${activePage === 'materials' ? 'active' : ''}">材料</a>
            <a href="factory.html" class="${activePage === 'factory' ? 'active' : ''}">工廠</a>
          </nav>
        </div>
      </header>
    `;
}
