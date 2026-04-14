const express = require('express');
const router = express.Router();
const fetch = require('node-fetch');

router.get('/', async (req, res) => {
  const q = req.query.q;
  if (!q) return res.status(400).json({ error: 'Missing query' });

  const safeQuery = encodeURIComponent(q.trim());
  const apiKey = process.env.GOOGLE_BOOKS_API_KEY;

  try {
    const response = await fetch(
      `https://www.googleapis.com/books/v1/volumes?q=${safeQuery}&maxResults=5&key=${apiKey}`,
    );

    const data = await response.json();
    const titles = (data.items || []).map(
      (item) => item.volumeInfo?.title || 'No Title',
    );

    res.json({ suggestions: titles });
  } catch (err) {
    console.error('Google Books Suggest Error:', err);
    res.status(500).json({ error: 'API failed' });
  }
});

module.exports = router;
