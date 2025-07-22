// netlify/functions/fetch-ranks.js
const fetch = global.fetch;

const RIOT_KEY     = process.env.RIOT_API_KEY;
const ACCOUNT_HOST = "https://americas.api.riotgames.com";
const PLATFORM_HOST = region => `https://${region}.api.riotgames.com`;
const CACHE_SECONDS = 300; // 5 min

exports.handler = async () => {
  const players = require("../../players.json");
  const out = {};

  for (const p of players) {
    // build the exact same key your front-end is looking up:
    const key = `${p.riotName}-${p.tag}`;

    try {
      // 1) get PUUID via gameName+tag
      const account = await riot(
        `${ACCOUNT_HOST}/riot/account/v1/accounts/by-riot-id/` +
        `${encodeURIComponent(p.riotName)}/${encodeURIComponent(p.tag)}`
      );

      // 2) get Summoner object by PUUID
      const summ = await riot(
        `${PLATFORM_HOST(p.region)}/lol/summoner/v4/summoners/by-puuid/${account.puuid}`
      );

      // 3) get all league entries for that Summoner ID
      const leagues = await riot(
        `${PLATFORM_HOST(p.region)}/lol/league/v4/entries/by-summoner/${summ.id}`
      );

      // pick out solo/duo, or empty object if never played ranked
      const solo = leagues.find(e => e.queueType === "RANKED_SOLO_5x5") || {};

      // destructure with defaults
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
    }
  }

  return {
    statusCode: 200,
    headers: {
      "Content-Type":               "application/json",
      "Access-Control-Allow-Origin":"*",
      "Cache-Control":              `public, max-age=${CACHE_SECONDS}, stale-while-revalidate=${CACHE_SECONDS}`
    },
    body: JSON.stringify(out)
  };
};

async function riot(url) {
  const res = await fetch(url, {
    headers: { "X-Riot-Token": RIOT_KEY }
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Riot API ${res.status}: ${text}`);
  }
  return res.json();
}
