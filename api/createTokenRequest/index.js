const Ably = require("ably/promises");

export default async function handler(request, response) {
  const id = `id- + ${Math.random().toString(36).substr(2, 16)}`;
  const client = new Ably.Realtime(process.env.ABLY_API_KEY);
  const tokenRequestData = await client.auth.createTokenRequest({ clientId: id });
  return response.status(200).json(tokenRequestData);
}
