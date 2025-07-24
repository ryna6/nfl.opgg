// netlify/functions/get-summoner.js
const fetch    = global.fetch;
const RIOT_KEY = process.env.RIOT_API_KEY;

exports.handler = async (event) => {
  // event.queryStringParameters.name is just the riotName (no “-tag”)
  const name   = event.queryStringParameters.name;
  const region = event.queryStringParameters.region || 'na1';

  if (!name) {
    return { statusCode: 400, body: JSON.stringify({ error: "Missing name" }) };
  }

  const url = `https://${region}.api.riotgames.com/lol/summoner/v4/summoners/by-name/` +
              `${encodeURIComponent(name)}`;

  try {
    const res  = await fetch(url, {
      headers: { 'X-Riot-Token': RIOT_KEY }
    });
    const data = await res.json();

    if (!res.ok) {
      // forward Riot’s error
      return {
        statusCode: res.status,
        headers: { 'Access-Control-Allow-Origin': '*' },
        body: JSON.stringify(data)
      };
    }

    // success — data.puuid is what we need
    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify({ puuid: data.puuid })
    };

  } catch (err) {
    return {
      statusCode: 500,
      headers: { 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify({ error: err.message })
    };
  }
};
