require('dotenv').config();

module.exports = {
  searchCategoryBookFromGoogle: async (req, res) => {
    try {
      const { q, limit = 20 } = req.query;

      if (!q) {
        return res.status(400).json({ message: 'Search query is required' });
      }

      const maxResults = Math.min(Number(limit) || 20, 40);
      const apiKey = process.env.GOOGLE_BOOKS_API_KEY;

      const params = new URLSearchParams({
        q: `subject:${q}`,
        maxResults: String(maxResults),
        key: apiKey, //  Include your key here
      });

      const url = `https://www.googleapis.com/books/v1/volumes?${params.toString()}`;

      const response = await fetch(url);

      if (!response.ok) {
        const errorText = await response.text();
        return res.status(response.status).json({
          message: 'Google Books error',
          details: errorText,
        });
      }

      const data = await response.json();

      const books = (data.items || []).map((item, index) => {
        const info = item.volumeInfo || {};
        const img =
          info.imageLinks?.thumbnail || info.imageLinks?.smallThumbnail || null;

        const hdCover = img
          ? img.replace('http://', 'https://').replace(/zoom=\d+/, 'zoom=3')
          : null;

        return {
          key: item.id || String(index),
          title: info.title || 'Untitled',
          author: (info.authors && info.authors[0]) || 'Unknown',
          publishedDate: info.publishedDate || null,
          categories: info.categories || [],
          isbn:
            info.industryIdentifiers?.find((x) => x.type === 'ISBN_13')
              ?.identifier ||
            info.industryIdentifiers?.find((x) => x.type === 'ISBN_10')
              ?.identifier ||
            null,
          coverUrl: hdCover,
        };
      });

      return res.status(200).json({
        total: data.totalItems || 0,
        results: books,
      });
    } catch (err) {
      console.error('Server error:', err);
      return res.status(500).json({ message: 'Server error' });
    }
  },
};
