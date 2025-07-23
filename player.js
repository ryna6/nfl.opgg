// === File: player.js ===

async function loadPlayer() {
  // … same setup as before …

  // 1) Highest mastery
  try {
    const mRes = await fetch(`/.netlify/functions/fetch-masteries?puuid=${p.puuid}`);
    const [top] = mRes.ok ? await mRes.json() : [];
    document.getElementById('highest-mastery').textContent =
      top
        ? `Highest Mastery: Champion ${top.championId} (${top.championPoints.toLocaleString()} pts)`
        : 'No mastery data';
  } catch (e) {
    console.error(e);
    document.getElementById('highest-mastery').textContent = 'Error loading mastery';
  }

  // 2) Recent games + timelines
  try {
    // fetch the last 10 match IDs
    const ids = await fetch(`/.netlify/functions/fetch-games?puuid=${p.puuid}&count=10`)
                   .then(r => r.ok ? r.json() : []);
    const listEl = document.getElementById('recent-games');
    if (!ids.length) {
      listEl.innerHTML = '<li>No games found</li>';
    } else {
      // For each ID, fetch its timeline
      const timelines = await Promise.all(
        ids.map(id =>
          fetch(`/.netlify/functions/fetch-timeline?matchId=${id}`)
            .then(r => (r.ok ? r.json() : null))
            .catch(() => null)
        )
      );
      listEl.innerHTML = timelines.map((tl, i) => {
        if (!tl) return `<li>${ids[i]} — no timeline</li>`;
        // extract whatever you like from the timeline, e.g. game duration
        const dur = tl.info.gameDuration;
        return `<li>${ids[i]} — Duration: ${Math.floor(dur/60)}m ${dur%60}s</li>`;
      }).join('');
    }
  } catch (e) {
    console.error(e);
    document.getElementById('recent-games').innerHTML = '<li>Error loading games</li>';
  }

  // 3) Active shards
  try {
    const s = await fetch(`/.netlify/functions/fetch-shards?puuid=${p.puuid}`)
                     .then(r => r.ok ? r.json() : {});
    document.getElementById('active-shards').textContent =
      s.activeShard
        ? `Active Shard: ${s.activeShard}`
        : 'No shard info';
  } catch (e) {
    console.error(e);
    document.getElementById('active-shards').textContent = 'Error loading shards';
  }
}

loadPlayer();
