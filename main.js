const TIERS     = ["IRON","BRONZE","SILVER","GOLD","PLATINUM","EMERALD","DIAMOND","MASTER","GRANDMASTER","CHALLENGER"];
const cardsEl   = document.getElementById('cards');
const updatedEl = document.getElementById('updated');
const statsEl   = document.getElementById('stats');

async function load() {
  // 0) show loading state
  cardsEl.innerHTML = `
    <div class="loading">
      Loading…
      <img
        src="img/fizzy.jpg"
        alt="Loading…"
        class="loading-img"
      />
    </div>
  `;
  statsEl.innerHTML = '';      // clear old stats
  updatedEl.textContent = '';  // clear timestamp

  try {
    // 1) fetch players.json
    const pResp = await fetch('players.json', { cache: 'no-store' });
    if (!pResp.ok) throw new Error(`players.json → ${pResp.status}`);
    const players = await pResp.json();

    // 2) fetch rank data
    const rResp = await fetch(window.API_URL + '?t=' + Date.now(), { cache: 'no-store' });
    if (!rResp.ok) throw new Error(`fetch-ranks → ${rResp.status}`);
    const rankData = await rResp.json();

    // 3) merge & sort
    const merged = players
      .map(p => {
        const key = `${p.riotName}-${p.tag}`;
        return { ...p, ...(rankData[key] || {}) };
      })
      .sort(sortPlayers);

    // 4) render cards (pass total length for the poop logic)
    cardsEl.innerHTML = merged
      .map((p, i) => cardHTML(p, i + 1, merged.length))
      .join('');

    // 5) update “last updated” text
    const now = new Date();
    updatedEl.textContent = 
      `Last updated: ${now.toLocaleString()} (auto-refreshes every 5 minutes)`;

    // 6) compute & render your extra stats
    const totalGames = merged.reduce(
      (sum, p) => sum + (p.wins || 0) + (p.losses || 0),
      0
    );
    const avgRank = (
      merged.reduce((sum, _, idx) => sum + (idx + 1), 0) / merged.length
    ).toFixed(2);
    const secsPerGame = 29 * 60 + 21;
    const totalSecs   = totalGames * secsPerGame;
    const hours       = Math.floor(totalSecs / 3600);
    const minutes     = Math.floor((totalSecs % 3600) / 60);

    statsEl.innerHTML = `
      <div class="stat">Avg Rank: ${avgRank}</div>
      <div class="stat">Total Games: ${totalGames}</div>
      <div class="stat">Hours Not Touched Grass: ${hours}h ${minutes}m</div>
    `;

  } catch (err) {
    console.error('❌ load error:', err);
    cardsEl.innerHTML = `<div class="error">Error: ${err.message}</div>`;
    statsEl.innerHTML   = '';
    updatedEl.textContent = '';
  }
}

// Update this too: include totalPlayers so the last‐place 💩 works
function cardHTML(p, rank) {
  const total  = (p.wins||0) + (p.losses||0);
  const wr     = total ? Math.round(p.wins*100/total) : 0;
  const icon   = tierIcon(p.tier || 'UNRANKED');
  const opgg   = `https://op.gg/lol/summoners/na/${encodeURIComponent(p.riotName}-${p.tag)}`;

  return `
    <a href="${opgg}" target="_blank" rel="noopener" style="text-decoration:none;color:inherit;">
      <article class="card">
        <span class="rank-badge">#${rank}</span>
        <img class="avatar" src="${icon || fallbackIcon()}" alt="${p.displayName} OP.GG">
        <div class="lp">${p.tier || 'UNRANKED'} ${p.rank || ''} - ${p.lp || 0} LP</div>
        <div class="wl">${p.wins||0}W - ${p.losses||0}L (${wr}%)</div>
        <h2 class="name">${p.displayName}</h2>
        <div class="role">${p.role}</div>
      </article>
    </a>`;
}

function sortPlayers(a,b){
  const t = TIERS.indexOf((b.tier||"UNRANKED").toUpperCase())
          - TIERS.indexOf((a.tier||"UNRANKED").toUpperCase());
  if (t) return t;
  const r = (a.rank||'').localeCompare(b.rank||'');
  if (r) return r;
  return (b.lp||0) - (a.lp||0);
}

function tierIcon(tier){
  tier = tier.charAt(0).toUpperCase() + tier.slice(1).toLowerCase();
  return `https://wiki.leagueoflegends.com/en-us/images/Season_2023_-_${tier}.png`;
}

function fallbackIcon(){
  return "https://ddragon.leagueoflegends.com/cdn/latest/img/profileicon/588.png";
}

// kick it off
load();
setInterval(load, 5 * 60 * 1000);
