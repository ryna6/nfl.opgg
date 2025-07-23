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

  // Basic info
  document.getElementById('player-name').textContent = p.displayName;
  document.getElementById('opgg-link').href =
    `https://op.gg/lol/summoners/na/${encodeURIComponent(p.riotName + '-' + p.tag)}`;

  // TODO: Fetch and display highest mastery champion
  // e.g. call /.netlify/functions/fetch-masteries?puuid=${p.puuid}

  // TODO: Fetch and display last 10 games (all queue types)
  // e.g. call /.netlify/functions/fetch-games?puuid=${p.puuid}&count=10

  // TODO: Fetch and display active shards
  // e.g. call /.netlify/functions/fetch-shards?region=${p.region}
}

loadPlayer();
