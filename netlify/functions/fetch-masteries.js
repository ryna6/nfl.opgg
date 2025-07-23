const fetch = require('node-fetch');
exports.handler = async (event) => {
  const { puuid } = event.queryStringParameters;
  const API_KEY = process.env.RIOT_API_KEY;
  // choose platform-route (e.g. `na1.api.riotgames.com`)
  const host = 'na1.api.riotgames.com';
  const url = `https://${host}/lol/champion-mastery/v4/champion-masteries/by-puuid/${puuid}/top`;
  const res = await fetch(url, { headers: { 'X-Riot-Token': API_KEY } });
  const data = await res.json();
  return { statusCode: res.status, body: JSON.stringify(data) };
};
