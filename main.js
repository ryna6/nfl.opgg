const TIERS     = ["IRON","BRONZE","SILVER","GOLD","PLATINUM","EMERALD","DIAMOND","MASTER","GRANDMASTER","CHALLENGER"];
const cardsEl   = document.getElementById('cards');
const statsEl   = document.getElementById('stats');
const updatedEl = document.getElementById('updated');

async function load() {
  // 0) Show loading state
  cardsEl.innerHTML = `
    <div class="loading">
      Loading…
      <img src="img/fizzy.jpg" alt="Loading…" class="loading-img"/>
    </div>
  `;
  statsEl.innerHTML   = '';
  updatedEl.textContent = '';

  try {
    // 1) Fetch players
    const pResp = await fetch('players.json', { cache: 'no-store' });
    if (!pResp.ok) throw new Error(`players.json → ${pResp.status}`);
    const players = await pResp.json();

    // 2) Fetch ranks
    const rResp = await fetch(window.API_URL + '?t=' + Date.now(), { cache: 'no-store' });
    if (!rResp.ok) throw new Error(`fetch-ranks → ${rResp.status}`);
    const rankData = await rResp.json();

    // 3) Merge & sort
    const merged = players
      .map(p => {
        const key = `${p.riotName}-${p.tag}`;
        return { ...p, ...(rankData[key] || {}) };
      })
      .sort(sortPlayers);

    // 4) Render cards (pass merged.length so the poop-hat CSS only sits over #last)
    cardsEl.innerHTML = merged
      .map((p,i) => cardHTML(p, i+1, merged.length))
      .join('');

    // 5) Timestamp
    const now = new Date();
    updatedEl.textContent = 
      `Last updated: ${now.toLocaleString()} (auto-refreshes every 5 minutes)`;

    // 6) Stats
    const totalGames = merged.reduce(
      (sum, p) => sum + (p.wins||0) + (p.losses||0),
      0
    );
    // Compute true LP-weighted average rank
    const divisionMap = { IV: 1, III: 2, II: 3, I: 4 };
    const reverseDivision = { 1: 'IV', 2: 'III', 3: 'II', 4: 'I' };
    // Turn each player into a single numeric score
    const numericScores = merged.map(p => {
      const tierIdx = TIERS.indexOf(p.tier);
      if (tierIdx < 0 || !divisionMap[p.rank]) return 0;
      const divNum = divisionMap[p.rank];
      return tierIdx * 4 + divNum + (p.lp || 0) / 100;
    });
    // Compute the average
    const avgScore =
      numericScores.reduce((sum, v) => sum + v, 0) / numericScores.length;
    // Build back into tier/division/LP strings
    let avgRankStr;
    if (avgScore < 1) {
      avgRankStr = 'UNRANKED';
    } else {
      const tierIdx = Math.floor((avgScore - 1) / 4);
      const rem      = avgScore - tierIdx * 4;
      const divFloor = Math.min(Math.max(Math.floor(rem), 1), 4);
      const lpFrac   = rem - divFloor;
      const avgLp    = Math.min(Math.round(lpFrac * 100), 99);
      const tierName = TIERS[tierIdx] || 'UNRANKED';
      const division = reverseDivision[divFloor] || '';
      avgRankStr = `${tierName} ${division} ${avgLp} LP`.trim();
    }

    const secsPerGame = 29*60 + 21;
    const totalSecs   = totalGames * secsPerGame;
    const hours       = Math.floor(totalSecs / 3600);
    const minutes     = Math.floor((totalSecs % 3600) / 60);

    statsEl.innerHTML = `
    <div class="stat">
      <div class="stat-label">Avg Rank</div>
      <div class="stat-value avg-rank">${avgRankStr}</div>
    </div>
    <div class="stat">
      <div class="stat-label">Total Games</div>
      <div class="stat-value total-games">${totalGames}</div>
    </div>
    <div class="stat">
      <div class="stat-label">Hours Not Touched Grass</div>
      <div class="stat-value hours">${hours}h ${minutes}m</div>
    </div>
    `;
    
  } catch (err) {
    console.error('❌ load error:', err);
    cardsEl.innerHTML  = `<div class="error">Error: ${err.message}</div>`;
    statsEl.innerHTML  = '';
    updatedEl.textContent = '';
  }
}

// Renders a single card, always showing “#n” so the CSS hat handles the poop emoji
function cardHTML(p, rank) {
  const total  = (p.wins||0) + (p.losses||0);
  const wr     = total ? Math.round(p.wins*100/total) : 0;
  const icon   = tierIcon(p.tier||'UNRANKED');
  const url    = `https://op.gg/lol/summoners/na/${encodeURIComponent(p.riotName+'-'+p.tag)}`;
  return `
    <a href="${url}" target="_blank" rel="noopener" style="text-decoration:none;color:inherit">
      <article class="card">
        <span class="rank-badge">#${rank}</span>
        <img class="avatar" src="${icon||fallbackIcon()}" alt="${p.displayName} OP.GG">
        <div class="lp">${p.tier||'UNRANKED'} ${p.rank||''} - ${p.lp||0} LP</div>
        <div class="wl">${p.wins||0}W - ${p.losses||0}L (${wr}%)</div>
        <h2 class="name">${p.displayName}</h2>
        <div class="role">${p.role}</div>
      </article>
    </a>`;
}

function sortPlayers(a,b) {
  const ti = TIERS.indexOf((b.tier||"UNRANKED")) - TIERS.indexOf((a.tier||"UNRANKED"));
  if (ti) return ti;
  const ri = (a.rank||'').localeCompare(b.rank||'');
  if (ri) return ri;
  return (b.lp||0) - (a.lp||0);
}

function tierIcon(t){ t=t.charAt(0).toUpperCase()+t.slice(1).toLowerCase(); return `https://wiki.leagueoflegends.com/en-us/images/Season_2023_-_${t}.png`; }
function fallbackIcon(){ return "https://ddragon.leagueoflegends.com/cdn/latest/img/profileicon/588.png"; }

// kick it off
load();
setInterval(load, 5*60*1000);
