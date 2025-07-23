// netlify/functions/fetch-ranks.js
const fetch = global.fetch;

const RIOT_KEY      = process.env.RIOT_API_KEY;
const ACCOUNT_HOST  = "https://americas.api.riotgames.com";
const PLATFORM_HOST = region => `https://${region}.api.riotgames.com`;
const CACHE_SECONDS = 300; // 5 minutes

exports.handler = async () => {
  const players = require("../../players.json");
  const out = {};

  for (const p of players) {
    // Build the same key your front-end uses:
    const key = `${p.riotName}-${p.tag}`;
    try {
      // 1) Lookup account by gameName+tag to get puuid
      const account = await riot(
        `${ACCOUNT_HOST}/riot/account/v1/accounts/by-riot-id/` +
        `${encodeURIComponent(p.riotName)}/${encodeURIComponent(p.tag)}`
      );

      // 2) Fetch Summoner object by PUUID
      const summ = await riot(
        `${PLATFORM_HOST(p.region)}/lol/league/v4/entries/by-puuid/` +
        account.puuid
      );

      // 3) Pick out the Solo/Duo entry (or default if unranked)
      const solo = summ.find(e => e.queueType === "RANKED_SOLO_5x5") || {};

      // 4) Destructure with sane defaults
      const {
        tier           = "UNRANKED",
        rank           = "",
        leaguePoints: lp   = 0,
        wins           = 0,
        losses         = 0
      } = solo;

      out[key] = {
        tier,
        rank,
        lp,
        wins,
        losses
      };

    } catch (err) {
      console.error(`❌ fetch failed for ${key}:`, err);
      out[key] = {
        tier:          "UNRANKED",
        rank:          "",
        lp:             0,
        wins:           0,
        losses:         0,
        error:         err.message
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
