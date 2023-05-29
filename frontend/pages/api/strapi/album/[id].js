export async function handler(req, res) {
  if (req.method === 'GET') {
    const accessToken = process.env.STRAPI_API_TOKEN;

    if (!accessToken) {
      res.status(403).end('Not authorized');
      return;
    }
    try {
      const albumResponse = await axios.get(
        `${process.env.STRAPI_API_URL}/products/${req.query.id}`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );
      console.log(albumResponse);
      res.status(200).json(albumResponse.data);
    } catch (error) {
      console.log(error.response);
      res.status(500).json({ message: 'An error occurred.' });
    }
  } else {
    res.setHeader('Allow', ['GET']);
    res.status(405).end('Method Not Allowed');
  }
}
