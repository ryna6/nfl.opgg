// netlify/functions/get-summoner.js
const fetch = global.fetch;
const RIOT_KEY = process.env.RIOT_API_KEY;

exports.handler = async (event) => {
  const name = event.queryStringParameters.name;
  const res  = await fetch(
    `https://na1.api.riotgames.com/lol/summoner/v4/summoners/by-name/${encodeURIComponent(name)}`,
    { headers: { 'X-Riot-Token': RIOT_KEY } }
  );
  const data = await res.json();
  return {
    statusCode: 200,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  };
};
