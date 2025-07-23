const fetch = require('node-fetch');
exports.handler = async (event) => {
  const { puuid, count = 10 } = event.queryStringParameters;
  const API_KEY = process.env.RIOT_API_KEY;
  // match-v5 uses the region routing value “americas”
  const url = `https://americas.api.riotgames.com/lol/match/v5/matches/by-puuid/${puuid}/ids?start=0&count=${count}`;
  const res = await fetch(url, { headers: { 'X-Riot-Token': API_KEY } });
  const data = await res.json();
  return { statusCode: res.status, body: JSON.stringify(data) };
};
