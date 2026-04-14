const API_KEY = process.env.NYT_API_KEY;

module.exports = {
  lastViewed7Days: async (req, res) => {
    try {
      if (!API_KEY) {
        return res
          .status(500)
          .json({ message: 'NYT_API_KEY missing in backend .env' });
      }

      const url = `https://api.nytimes.com/svc/mostpopular/v2/emailed/7.json?api-key=${API_KEY}`;
      const response = await fetch(url);

      if (!response.ok) {
        const text = await response.text().catch(() => '');
        return res.status(response.status).json({
          message: 'NYT Most Popular API error',
          status: response.status,
          details: text,
        });
      }

      const data = await response.json();

      const books = (data.results || []).slice(0, 20).map((item, index) => {
        const mediaMeta = item.media?.[0]?.['media-metadata'] || [];

        const image =
          mediaMeta[2]?.url || mediaMeta[1]?.url || mediaMeta[0]?.url || null;

        return {
          index: index + 1,
          id: item.id,
          title: item.title,
          abstract: item.abstract,
          byline: item.byline,
          section: item.section,
          published_date: item.published_date,
          url: item.url,
          image,
        };
      });

      return res.json({ count: books.length, books });
    } catch (error) {
      return res.status(500).json({
        message: 'Server error fetching NYT data',
        error: error?.message || String(error),
      });
    }
  },

  artistLastViewed7Days: async (req, res) => {
    try {
      if (!API_KEY) {
        return res
          .status(500)
          .json({ message: 'NYT_API_KEY missing in backend .env' });
      }

      const url = `https://api.nytimes.com/svc/mostpopular/v2/viewed/30.json?api-key=${API_KEY}`;
      const response = await fetch(url);

      if (!response.ok) {
        const text = await response.text().catch(() => '');
        return res.status(response.status).json({
          message: 'NYT Most Popular API error',
          status: response.status,
          details: text,
        });
      }

      const data = await response.json();

      const books = (data.results || []).slice(0, 20).map((item, index) => {
        const mediaMeta = item.media?.[0]?.['media-metadata'] || [];

        const image =
          mediaMeta[2]?.url || mediaMeta[1]?.url || mediaMeta[0]?.url || null;

        return {
          index: index + 1,
          id: item.id,
          title: item.title,
          abstract: item.abstract,
          byline: item.byline,
          section: item.section,
          published_date: item.published_date,
          url: item.url,
          image,
        };
      });

      return res.json({ count: books.length, books });
    } catch (error) {
      return res.status(500).json({
        message: 'Server error fetching NYT data',
        error: error?.message || String(error),
      });
    }
  },
};
