import Parser from 'rss-parser';
import Sentiment from 'sentiment';

const parser = new Parser();
const sentiment = new Sentiment();

const FEEDS = [
  'https://g1.globo.com/rss/g1/',
  'https://feeds.bbci.co.uk/portuguese/rss.xml',
];

const cache = new Map();

function classificarNoticia(texto) {
  if (cache.has(texto)) {
    return cache.get(texto);
  }

  const resultado = sentiment.analyze(texto || '');
  let classificacao;

  if (resultado.score > 1) classificacao = 'boa';
  else if (resultado.score < -1) classificacao = 'ruim';
  else classificacao = 'neutra';

  cache.set(texto, classificacao);
  return classificacao;
}

function estimateReadingTime(content) {
  const wordsPerMinute = 200;
  const wordCount = content?.split(/\s+/).length || 0;
  return Math.ceil(wordCount / wordsPerMinute);
}

function extractImageUrl(item) {
  const htmlContent = item.content || item['content:encoded'] || '';
  const imgRegex = /<img[^>]+src=["']([^"']+)["']/;
  const match = htmlContent.match(imgRegex);
  if (match) return match[1];

  if (item.enclosure?.url) return item.enclosure.url;
  if (item['media:content']?.url) return item['media:content'].url;
  if (item['media:thumbnail']?.url) return item['media:thumbnail'].url;
  if (item.image?.url) return item.image.url;

  return null;
}

export default async function handler(req, res) {
  try {
    const cursor = parseInt(req.query.cursor) || 0; // Use a cursor for infinite scrolling
    const limit = 10; // Number of items to load per request
    const allNews = [];

    for (const feedUrl of FEEDS) {
      let feed;
      try {
        feed = await parser.parseURL(feedUrl);
      } catch (feedError) {
        console.error(`Erro ao processar o feed ${feedUrl}:`, feedError);
        continue;
      }

      if (!feed || !feed.items || feed.items.length === 0) {
        console.warn(`O feed ${feedUrl} não contém itens válidos ou não é um RSS válido.`);
        continue;
      }

      const parsedNews = await Promise.all(
        feed.items.map(async (item) => {
          const title = item.title || '';
          const content =
            item.contentSnippet ||
            item.summary ||
            item.description ||
            item['content:encoded'] ||
            item.content ||
            '';

          const categoria = classificarNoticia(title + ' ' + content);
          const tempoLeitura = estimateReadingTime(content);
          const imageUrl = extractImageUrl(item);
          const rawDate = item.pubDate || item.isoDate || '';
          const date = rawDate ? new Date(rawDate).toISOString() : null;
          const author = item.creator || item.author || 'Desconhecido';

          const noticia = {
            id: `${feedUrl}-${item.link}`, // Unique ID for each news item
            title,
            content,
            link: item.link,
            date,
            image: imageUrl,
            author,
            source: feed.title,
            category: categoria,
            readingTime: tempoLeitura,
            likes: 0, // Placeholder for likes
            shares: 0, // Placeholder for shares
          };

          console.log('Notícia processada:', noticia);
          return noticia;
        })
      );

      allNews.push(...parsedNews);
    }

    // Sort news by date, newest first
    allNews.sort((a, b) => new Date(b.date) - new Date(a.date));

    // Implement infinite scrolling with cursor
    const paginatedNews = allNews.slice(cursor, cursor + limit);

    console.log('Notícias paginadas:', paginatedNews);

    res.status(200).json({
      noticias: paginatedNews,
      nextCursor: cursor + limit, // Send the next cursor for the next batch of news
    });
  } catch (error) {
    console.error('Erro ao obter notícias:', error);
    res.status(500).json({ error: 'Erro ao obter notícias' });
  }
}
