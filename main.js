const TIERS = ["IRON","BRONZE","SILVER","GOLD","PLATINUM","EMERALD","DIAMOND","MASTER","GRANDMASTER","CHALLENGER"];
const cardsEl = document.getElementById('cards');
const updatedEl = document.getElementById('updated');

async function load() {
  cardsEl.innerHTML = `<div class="loading"> 
  <img
      src="https://media.discordapp.net/attachments/1160467680244006987/1387648277461074012/8F48F253-B949-40FB-B27C-12BE14ECAF1A.jpg"
      alt="Loading image"
      class="loading-img"
    />
  Loading...
  </div>`; // fizzy just ranked down !!!

  try { // test 2
    // 1) fetch your players list
    console.log(">> fetching players.json from", "players.json");
    const pResp = await fetch("players.json");
    console.log("   players.json status", pResp.status);
    if (!pResp.ok) throw new Error(`players.json → ${pResp.status}`);
    const players = await pResp.json();
    console.log("   players loaded:", players);

    // 2) fetch the rank data
    console.log(">> fetching ranks from", API_URL);
    const rResp = await fetch(API_URL);
    console.log("   fetch-ranks status", rResp.status);
    if (!rResp.ok) throw new Error(`fetch-ranks → ${rResp.status}`);
    const data = await rResp.json();
    console.log("   rank data:", data);

    // test 3
    players.forEach((p, i) => {
  const key   = `${p.riotName}-${p.tag}`;
  console.log('looking for', key, 'in API data →', data[key]);
  const stats = data[key] || {};
  // … render using stats.tier, stats.lp, etc.
  });
  // end of test 3

    // …then your existing loop to render cards…
  } catch (err) {
    console.error("❌ load error:", err);
    cardsEl.innerHTML = `<div class="error">Error: ${err.message}</div>`;
  }
  // end of test 2
  
  try {
    const players = await (await fetch('players.json', {cache:'no-store'})).json();
    const res = await fetch(window.API_URL + '?t=' + Date.now(), {cache:'no-store'});
    const data = await res.json();

    const merged = players.map(p => ({ ...p, ...(data[p.riotName + '-' + p.tag] || {}) })).sort(sortPlayers);
    cardsEl.innerHTML = merged.map((p,i)=> cardHTML(p,i+1)).join('');

    const now = new Date();
    updatedEl.textContent = `Last updated: ${now.toLocaleString()} (auto-refreshes every 5 minutes)`;
  } catch (e) {
    cardsEl.innerHTML = `<div class="error">Failed to load: ${e}</div>`;
  }
}

function sortPlayers(a,b){
  const t = TIERS.indexOf((b.tier||"UNRANKED").toUpperCase()) - TIERS.indexOf((a.tier||"UNRANKED").toUpperCase());
  if (t !== 0) return t;
  const r = (a.rank||'').localeCompare(b.rank||'');
  if (r !== 0) return r;
  return (b.lp||0) - (a.lp||0);
}

function cardHTML(p, rank){
  const total = (p.wins||0) + (p.losses||0);
  const wr = total ? Math.round(p.wins*100/total) : 0;
  const icon = tierIcon(p.tier||'UNRANKED');
  const opgg = `https://op.gg/lol/summoners/na/${encodeURIComponent(p.riotName + '-' + p.tag)}`;
  const displayRank = (rank === total) ? '💩' : `#${rank}`;
  return `
  <a href="${opgg}" target="_blank" rel="noopener" style="text-decoration: none; color: inherit; background-color: none">
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

function tierIcon(tier){
  tier = tier.charAt(0).toUpperCase() + tier.slice(1).toLowerCase();
  return `https://wiki.leagueoflegends.com/en-us/images/Season_2023_-_${tier}.png`;
}

function fallbackIcon(){
  return "https://ddragon.leagueoflegends.com/cdn/latest/img/profileicon/588.png";
}

// initial load
load();
// auto refresh every 5 min
setInterval(load, 5 * 60 * 1000);
