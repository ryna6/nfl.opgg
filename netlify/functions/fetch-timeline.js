const fetch = require('node-fetch');
exports.handler = async (event) => {
  const { matchId } = event.queryStringParameters;
  const API_KEY = process.env.RIOT_API_KEY;
  const url = `https://americas.api.riotgames.com/lol/match/v5/matches/${matchId}/timeline`;
  const res = await fetch(url, { headers: { 'X-Riot-Token': API_KEY } });
  const data = await res.json();
  return { statusCode: res.status, body: JSON.stringify(data) };
};
