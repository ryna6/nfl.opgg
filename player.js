// === File: player.js ===

async function loadPlayer() {
  // … your setup code …

  // 1) Highest mastery
  try {
    const mRes = await fetch(`/.netlify/functions/fetch-masteries?puuid=${p.puuid}`);
    const mastery = mRes.ok ? (await mRes.json())[0] : null;
    document.getElementById('highest-mastery').textContent =
      mastery
        ? `Highest Mastery: Champion ${mastery.championId} (${mastery.championPoints.toLocaleString()} pts)`
        : 'No mastery data';
  } catch {
    document.getElementById('highest-mastery').textContent = 'Error loading mastery';
  }

  // 2) 10 most recent games (IDs only)
  try {
    const ids = await fetch(`/.netlify/functions/fetch-games?puuid=${p.puuid}&count=10`)
                       .then(r => r.ok ? r.json() : []);
    const listEl = document.getElementById('recent-games');
    listEl.innerHTML = ids.length
      ? ids.map(id => `<li>${id}</li>`).join('')
      : '<li>No games found</li>';
  } catch {
    document.getElementById('recent-games').innerHTML = '<li>Error loading games</li>';
  }

  // (Optional) If you also want timelines in your UI:
  //   fetch each timeline via fetch-timeline.js exactly the same way

  // 3) Active shards
  try {
    const shardData = await fetch(`/.netlify/functions/fetch-shards?puuid=${p.puuid}`)
                             .then(r => r.ok ? r.json() : {});
    document.getElementById('active-shards').textContent =
      shardData.activeShard
        ? `Active Shard: ${shardData.activeShard}`
        : 'No shard info';
  } catch {
    document.getElementById('active-shards').textContent = 'Error loading shards';
  }
}

loadPlayer();
