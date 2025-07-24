// netlify/functions/get-summoner.js
const fetch    = global.fetch;
const RIOT_KEY = process.env.RIOT_API_KEY;

exports.handler = async (event) => {
  // event.queryStringParameters.name === "riotName-tag"
  const riotId = event.queryStringParameters.name || '';
  // Split into [name, tag] using the last dash
  const match = riotId.match(/^(.+)-([^–-]+)$/);
  if (!match) {
    return { statusCode: 400, body: JSON.stringify({ error: "Invalid name format" }) };
  }
  const [ , name, tag ] = match;

  const url = `https://americas.api.riotgames.com/riot/account/v1/accounts/by-riot-id/` +
              `${encodeURIComponent(name)}/${encodeURIComponent(tag)}`;

  try {
    const res  = await fetch(url, {
      headers: { 'X-Riot-Token': RIOT_KEY }
    });
    const data = await res.json();
    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
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
