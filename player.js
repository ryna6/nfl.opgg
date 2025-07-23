// === File: player.js ===
// Client-side logic to load and display player details

async function loadPlayer() {
  const params = new URLSearchParams(window.location.search);
  const playerKey = params.get('player');
  if (!playerKey) {
    document.body.innerHTML = '<p>No player specified.</p>';
    return;
  }

  const [riotName, tag] = decodeURIComponent(playerKey).split('-');
  const players = await fetch('players.json').then(res => res.json());
  const p = players.find(x => x.riotName === riotName && x.tag === tag);
  if (!p) {
    document.body.innerHTML = '<p>Player not found.</p>';
    return;
  }

  // --- Basic info ---
  document.getElementById('player-name').textContent = p.displayName;
  document.getElementById('opgg-link').href =
    `https://op.gg/lol/summoners/na/${encodeURIComponent(p.riotName + '-' + p.tag)}`;

  const API_KEY = process.env.RIOT_API_KEY;
  const host = na1.api.riotgames.com`;

  // --- 1) Highest mastery champion ---
  try {
    const res = await fetch(
      `https://${host}/lol/champion-mastery/v4/champion-masteries/by-puuid/${p.puuid}/top`,
      { headers: { 'X-Riot-Token': API_KEY } }
    );
    if (res.ok) {
      const [top] = await res.json();
      document.getElementById('highest-mastery').textContent =
        `Highest Mastery: Champion ${top.championId} (${top.championPoints.toLocaleString()} pts)`;
    } else {
      document.getElementById('highest-mastery').textContent = 'Failed to load mastery';
    }
  } catch (err) {
    console.error(err);
    document.getElementById('highest-mastery').textContent = 'Error loading mastery';
  }

  // --- 2) 10 most recent games (all queues) ---
  try {
    // first get the last 10 match IDs
    const idsRes = await fetch(
      `https://${host}/lol/match/v5/matches/by-puuid/${p.puuid}/ids?start=0&count=10`,
      { headers: { 'X-Riot-Token': API_KEY } }
    );
    if (idsRes.ok) {
      const ids = await idsRes.json();
      // display as a simple list of IDs for now
      const listEl = document.getElementById('recent-games');
      listEl.innerHTML = ids.map(id => `<li>${id}</li>`).join('');
    } else {
      document.getElementById('recent-games').innerHTML = '<li>Unable to load games</li>';
    }
  } catch (err) {
    console.error(err);
    document.getElementById('recent-games').innerHTML = '<li>Error loading games</li>';
  }

  // --- 3) Active shards ---
  try {
    const shardsRes = await fetch(
      `https://${host}/riot/account/v1/active-shards/by-game/lol/by-puuid/${p.puuid}`,
      { headers: { 'X-Riot-Token': API_KEY } }
    );
    if (shardsRes.ok) {
      const shards = await shardsRes.json();
      document.getElementById('active-shards').textContent =
        `Active Shard: ${shards.activeShard || 'N/A'}`;
    } else {
      document.getElementById('active-shards').textContent = 'Failed to load shards';
    }
  } catch (err) {
    console.error(err);
    document.getElementById('active-shards').textContent = 'Error loading shards';
  }
}

loadPlayer();

