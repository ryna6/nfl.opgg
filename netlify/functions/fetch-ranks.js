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
    
    const key = `${p.riotName}-${p.tag}`; // test 1
    
    try {
      const account = await riot(`${ACCOUNT_HOST}/riot/account/v1/accounts/by-riot-id/${encodeURIComponent(p.riotName)}/${encodeURIComponent(p.tag)}`);
      const summ = await riot(`${PLATFORM_HOST(p.region)}/lol/summoner/v4/summoners/by-puuid/${account.puuid}`);
      const leagues = await riot(`${PLATFORM_HOST(p.region)}/lol/league/v4/entries/by-summoner/${summ.id}`);
      const solo = leagues.find(l => l.queueType === "RANKED_SOLO_5x5") || {};


      // test 2
       const {
        tier          = "UNRANKED",
        rank          = "",
        leaguePoints: lp   = 0,
        wins          = 0,
        losses        = 0
      } = solo;

      out[key] = {
        tier,
        rank,
        lp,
        wins,
        losses,
        profileIconId: summ.profileIconId,
        role: p.role    // if you need role on front-end
      };

    } catch (err) {
      console.error(`❌ fetch failed for ${key}:`, err);
      out[key] = {
        tier: "UNRANKED",
        rank: "",
        lp: 0,
        wins: 0,
        losses: 0,
        profileIconId: null,
        role: p.role,
        error: err.message
      };

      // end of test 2
      
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
  const res = await fetch(url, { headers: { "X-Riot-Token": process.env.RIOT_API_KEY }});
  if (!res.ok) throw new Error(`Riot API ${res.status}: ${await res.text()}`);
  return res.json();
}
