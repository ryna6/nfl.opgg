const fetch = global.fetch;

const RIOT_KEY = process.env.RIOT_API_KEY;
const ACCOUNT_HOST = "https://americas.api.riotgames.com";
const PLATFORM_HOST = region => `https://${region}.api.riotgames.com`;

// CDN cache time 5 min)
const CACHE_SECONDS = 300;

exports.handler = async () => {
  const players = require('../../players.json');
  const out = {};

  for (const p of players) {
    try {
      const account = await riot(`${ACCOUNT_HOST}/riot/account/v1/accounts/by-riot-id/${encodeURIComponent(p.riotName)}/${encodeURIComponent(p.tag)}`);
      const summ = await riot(`${PLATFORM_HOST(p.region)}/lol/summoner/v4/summoners/by-puuid/${account.puuid}`);
      const leagues = await riot(`${PLATFORM_HOST(p.region)}/lol/league/v4/entries/by-summoner/${summ.id}`);
      const solo = leagues.find(l => l.queueType === "RANKED_SOLO_5x5") || {};

      out[p.riotName] = {
        tier: solo.tier || "UNRANKED",
        rank: solo.rank || "",
        lp: solo.leaguePoints || 0,
        wins: solo.wins || 0,
        losses: solo.losses || 0,
        profileIconURL: `https://ddragon.leagueoflegends.com/cdn/latest/img/profileicon/${summ.profileIconId}.png`
      };
    } catch (err) {
      out[p.riotName] = { error: err.message };
    }
  }

  return {
    statusCode: 200,
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*",
      "Cache-Control": `public, max-age=${CACHE_SECONDS}, stale-while-revalidate=${CACHE_SECONDS}`
    },
    body: JSON.stringify(out)
  };
};

async function riot(url){
  const res = await fetch(url, { headers: { "X-Riot-Token": RIOT_KEY }});
  if (!res.ok) throw new Error(`Riot API ${res.status}: ${await res.text()}`);
  return res.json();
}
