const TIERS = ["IRON","BRONZE","SILVER","GOLD","PLATINUM","EMERALD","DIAMOND","MASTER","GRANDMASTER","CHALLENGER"];
const cardsEl = document.getElementById('cards');
const updatedEl = document.getElementById('updated');

// helper to turn a role string into an icon URL
function getRoleIcon(role) {
  const icons = {
    top: "https://i.namu.wiki/i/-b85HC9HE4KxEwsPhhK2BPPH13NHDE0nRWJWuRTVCP9vj-liKYPRwAt8oJM0S_0luEtbMngv2dP5dOdK2SiQAA.svg",
    jungle:     "https://i.namu.wiki/i/s0GFtCsIQWVTHfxQXU4Rd7ic5-mp7fHS9j72OQIuMx24CkRNbfey2NkrBBwbLJ1ebvQ78_qhsC7TP3N7oENZ5Q.svg",
    mid:        "https://i.namu.wiki/i/nd16RJpRR0Mjs4thhZFV1MBLoC8dLje6JnYsIjWMEzqkyU-AWJiGa-oOs6KZIDo4rBRnkH7WB5TCWE5ow_fzdw.svg",
    adc:        "https://i.namu.wiki/i/1rwqWmPwH6722znbshCRdJhldhVw-lxjKppOHJebL9B9A0TiJlpik5tzeUYKhROsNB3EW6NcAYI8o84JRFR64g.webp",
    sup:        "https://i.namu.wiki/i/bbi_LWEwJn55PI3bOoyjaj95tl7pxCwoEUzp6h73x8z_qPE9omZaoatY4Sib-94LFDp25lCwX0gwXUwyw_Dbgw.svg"
  };
  return icons[role.toLowerCase()] || "";
}

function cardHTML(p, rank, stats) {
  const opgg = `https://op.gg/lol/summoners/na/${encodeURIComponent(p.riotName + '-' + p.tag)}`;

  // test
  function cardHTML(p, rank, stats) {
  console.log("→ cardHTML for", p.riotName, "role:", p.role);
  // split into roles (will be an array, even if just one)
  const roles = (p.role||"").split("/").map(r=>r.trim());
  console.log("   parsed roles:", roles);
  // end of test

  // If multiple roles, split and trim
  const roles = p.role.split("/").map(r => r.trim());
  const roleHtml = roles.map(r => `
    <span class="role-item">
      <img src="${getRoleIcon(r)}" alt="${r}" class="role-icon"/>
      ${r}
    </span>
  `).join('<span class="role-separator">/</span>');

  return `
    <article class="card">
      <span class="rank-badge">#${rank}</span>
      <a href="${opgg}" target="_blank" rel="noopener noreferrer">
        <img 
          class="avatar" 
          src="${stats.profileIconId 
            ? `https://ddragon.leagueoflegends.com/cdn/${ddragonVersion}/img/profileicon/${stats.profileIconId}.png`
            : fallbackIcon()}" 
          alt="${p.displayName}"
        />
      </a>
      <div class="role">${roleHtml}</div>
      <!-- …other fields like tier, lp, winrate, etc.… -->
    </article>
  `;
}


async function load() {
  console.log('>> load() fired'); //test 1
  cardsEl.innerHTML = `<div class="loading">Loading...</div>`;

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
  return `
  <article class="card">
    <span class="rank-badge">#${rank}</span>
    <a href="${opgg}" target="_blank" rel="noopener">
      <img class="avatar" src="${icon || fallbackIcon()}" alt="${p.displayName} OP.GG">
    </a>
    <div class="lp">${p.tier || 'UNRANKED'} ${p.rank || ''} - ${p.lp || 0} LP</div>
    <div class="wl">${p.wins||0}W - ${p.losses||0}L (${wr}%)</div>
    <h2 class="name">${p.displayName}</h2>
    <div class="role">${p.role}</div>
  </article>`;
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
