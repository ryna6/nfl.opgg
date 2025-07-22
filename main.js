const TIERS = ["IRON","BRONZE","SILVER","GOLD","PLATINUM","EMERALD","DIAMOND","MASTER","GRANDMASTER","CHALLENGER"];
const cardsEl = document.getElementById('cards');
const updatedEl = document.getElementById('updated');

async function load() {
  cardsEl.innerHTML = `<div class="loading">Loading...</div>`;
  try {
    const players = await (await fetch('players.json', {cache:'no-store'})).json();
    const res = await fetch(window.API_URL + '?t=' + Date.now(), {cache:'no-store'});
    const data = await res.json();

    const merged = players.map(p => ({ ...p, ...(data[p.riotName + '-' + p.tag] || {}) })).sort(sortPlayers);
    cardsEl.innerHTML = merged.map((p,i)=> cardHTML(p,i+1)).join('');

    const now = new Date();
    updatedEl.textContent = `Last updated: ${now.toLocaleString()} (auto-refreshes every 30 minutes)`;
  } catch (e) {
    cardsEl.innerHTML = `<div class="error">Failed to load: ${e}</div>`;
  }
}

function sortPlayers(a,b){
  const t = TIERS.indexOf((b.tier||"UNRANKED").toUpperCase()) - TIERS.indexOf((a.tier||"UNRANKED").toUpperCase());
  if (t !== 0) return t;
  return (b.lp||0) - (a.lp||0);
}

function cardHTML(p, rank){
  const total = (p.wins||0) + (p.losses||0);
  const wr = total ? Math.round(p.wins*100/total) : 0;
  const icon = tierIcon(p.tier||'UNRANKED');
  const opgg = `https://op.gg/lol/summoners/na/${encodeURIComponent(p.riotName + '-' + p.tag)}`;
  return `
  <article class="card">
    <span class="rank-badge">#${rank}</span>
    <a href="${opgg}" target="_blank" rel="noopener">
      <img class="avatar" src="${p.profileIconURL || fallbackIcon()}" alt="${p.displayName}">
    </a>
    <img class="tier-icon" src="${icon}" alt="${p.tier||'Unranked'}">
    <div class="lp">${p.tier || 'UNRANKED'} ${p.rank || ''} - ${p.lp || 0} LP</div>
    <div class="wl">${p.wins||0}W - ${p.losses||0}L (${wr}%)</div>
    <h2 class="name">${p.displayName}</h2>
    <div class="role">${p.role}</div>
  </article>`;
}

function tierIcon(tier){
  const cap = tier[0].toUpperCase()+tier.slice(1).toLowerCase();
  return `https://raw.githubusercontent.com/pauloluan/riot-api-icons/master/ranked-emblems/Emblem_${cap}.png`;
}
function fallbackIcon(){
  return "https://ddragon.leagueoflegends.com/cdn/latest/img/profileicon/588.png";
}

// initial load
load();
// auto refresh every 30 min (1800000 ms)
setInterval(load, 30 * 60 * 1000);
