const TIERS = ["IRON","BRONZE","SILVER","GOLD","PLATINUM","EMERALD","DIAMOND","MASTER","GRANDMASTER","CHALLENGER"];
const cardsEl = document.getElementById('cards');
const updatedEl = document.getElementById('updated');

async function load() {
  cardsEl.innerHTML = `<div class="loading"> 
  Loading...
  <img
      src="img/fizzy.jpg"
      alt="Loading…"
      class="loading-img"
    />
  </div>`; // fizzy just ranked down !!!

try {
    // 1) Fetch players data
    const pResp = await fetch("players.json");
    if (!pResp.ok) throw new Error(`players.json → ${pResp.status}`);
    const players = await pResp.json();

    // 2) Fetch rank data from your Netlify function
    const rResp = await fetch("/.netlify/functions/fetch-ranks");
    if (!rResp.ok) throw new Error(`fetch-ranks → ${rResp.status}`);
    const ranks = await rResp.json();

    // 3) Merge ranks into players
    const merged = players.map(p => {
      const match = ranks.find(r => 
        r.riotName === p.riotName && r.tag === p.tag
      ) || {};
      return { ...p, ...match };
    })
    .sort(sortPlayers);

    // 4) Render the 3x3 grid of cards
    cardsEl.innerHTML = merged
      .map((p, i) => cardHTML(p, i + 1, merged.length))
      .join("");

    // 5) Update the “last updated” timestamp
    const now = new Date();
    updatedEl.textContent = 
      `Last updated: ${now.toLocaleString()} (auto-refreshes every 5 minutes)`;

    // ─── NEW: Compute & render your extra stats ────────────────────────────
    const statsEl = document.getElementById("stats");
    // total games = sum of wins + losses
    const totalGames = merged.reduce(
      (sum, p) => sum + (p.wins || 0) + (p.losses || 0),
      0
    );
    // average rank
    const avgRank = (
      merged.reduce((sum, _, idx) => sum + (idx + 1), 0)
      / merged.length
    ).toFixed(2);
    // hours not touched grass = games × 29m21s
    const secsPerGame = 29 * 60 + 21;
    const totalSecs   = totalGames * secsPerGame;
    const hours       = Math.floor(totalSecs / 3600);
    const minutes     = Math.floor((totalSecs % 3600) / 60);

    statsEl.innerHTML = `
      <div class="stat">Avg Rank: ${avgRank}</div>
      <div class="stat">Total Games: ${totalGames}</div>
      <div class="stat">
        Hours Not Touched Grass: ${hours}h ${minutes}m
      </div>
    `;

  } catch (e) {
    cardsEl.innerHTML = `<div class="error">Failed to load: ${e}</div>`;
  }
}

// initial load + auto-refresh
load();
setInterval(load, 5 * 60 * 1000);
