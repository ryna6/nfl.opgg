exports.handler = async () => {
  await fetch(process.env.SELF_URL + "/.netlify/functions/fetch-ranks");
  return { statusCode: 200, body: "warmed" };
};

exports.config = { schedule: "*/30 * * * *" }; // every 30 minutes
