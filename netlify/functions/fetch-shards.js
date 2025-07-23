const fetch = require('node-fetch');
exports.handler = async (event) => {
  const { puuid } = event.queryStringParameters;
  const API_KEY = process.env.RIOT_API_KEY;
  const host = 'na1.api.riotgames.com';
  const url = `https://${host}/riot/account/v1/active-shards/by-game/lol/by-puuid/${puuid}`;
  const res = await fetch(url, { headers: { 'X-Riot-Token': API_KEY } });
  const data = await res.json();
  return { statusCode: res.status, body: JSON.stringify(data) };
};
