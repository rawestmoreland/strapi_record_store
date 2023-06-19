import axios from 'axios';

export default async function handler(req, res) {
  if (req.method === 'GET') {
    const accessToken = process.env.STRAPI_API_TOKEN;

    if (!accessToken) {
      res.status(403).end('Not authorized');
      return;
    }
    try {
      const artistResponse = await axios.get(
        `${process.env.STRAPI_API_URL}/search-genres?_search=${req.query._search}`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        },
      );
      res.status(200).json(artistResponse.data);
    } catch (error) {
      console.log(error.response);
      res.status(500).json({ message: 'An error occurred.' });
    }
  } else {
    res.setHeader('Allow', ['GET']);
    res.status(405).end('Method Not Allowed');
  }
}
