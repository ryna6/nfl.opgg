exports.handler = async () => {
  await fetch(process.env.SELF_URL + "/.netlify/functions/fetch-ranks");
  return { statusCode: 200, body: "warmed" };
};

exports.config = { schedule: "*/5 * * * *" }; // every 5 minutes
