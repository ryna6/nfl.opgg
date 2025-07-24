// netlify/functions/get-match-detail.js
const fetch    = global.fetch;
const RIOT_KEY = process.env.RIOT_API_KEY;

exports.handler = async (event) => {
  const { id } = event.queryStringParameters || {};

  if (!id) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: "Missing required parameter: id" })
    };
  }

  const url = `https://americas.api.riotgames.com/lol/match/v5/matches/${id}`;

  try {
    const res  = await fetch(url, {
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
