// netlify/functions/get-match-ids.js
const fetch    = global.fetch;
const RIOT_KEY = process.env.RIOT_API_KEY;

exports.handler = async (event) => {
  const { puuid, count = 15 } = event.queryStringParameters || {};

  if (!puuid) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: "Missing required parameter: puuid" })
    };
  }

  const url = new URL(
    `https://americas.api.riotgames.com/lol/match/v5/matches/by-puuid/${puuid}/ids`
  );
  url.searchParams.set('type', 'tourney');
  url.searchParams.set('count', count);

  try {
    const res  = await fetch(url.toString(), {
      headers: { 'X-Riot-Token': RIOT_KEY }
    });
    const data = await res.json();

    return {
      statusCode: res.status,
      headers: {
        "Content-Type":               "application/json",
        "Access-Control-Allow-Origin": "*"
      },
      body: JSON.stringify(data)
    };
  } catch (err) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: err.message })
    };
  }
};
