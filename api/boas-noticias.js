// api/boas-noticias.js
import Parser from 'rss-parser';
import { keywords } from './keywords.js';

const parser = new Parser();
const FEEDS = [
  'https://g1.globo.com/rss/g1/',
  'https://rss.uol.com.br/feed/noticias.xml',
  'https://feeds.bbci.co.uk/portuguese/rss.xml',
];

function classifyNews(title, content) {
  const text = `${title} ${content}`.toLowerCase();

  const positiveScore = keywords.positiveKeywords.filter((k) => text.includes(k)).length;
  const negativeScore = keywords.negativeKeywords.filter((k) => text.includes(k)).length;

  if (positiveScore > negativeScore) return 'boa';
  if (negativeScore > positiveScore) return 'ruim';
  return 'neutra';
}

function estimateReadingTime(content) {
  const wordsPerMinute = 200;
  const wordCount = content?.split(/\s+/).length || 0;
  return Math.ceil(wordCount / wordsPerMinute);
}

export default async function handler(req, res) {
  try {
    const allNews = [];

    for (const feedUrl of FEEDS) {
      const feed = await parser.parseURL(feedUrl);

      const parsedNews = feed.items.map((item) => {
        const title = item.title || '';
        const content = item.contentSnippet || item.content || '';
        const categoria = classifyNews(title, content);
        const tempoLeitura = estimateReadingTime(content);

        return {
          titulo: title,
          conteudo: content,
          link: item.link,
          data: item.pubDate,
          imagem: item.enclosure?.url || null,
          autor: item.creator || item.author || 'Desconhecido',
          veiculo: feed.title,
          categoria,
          tempoLeitura
        };
      });

      allNews.push(...parsedNews);
    }

    const boasNoticias = allNews.filter((n) => n.categoria === 'boa');

    res.status(200).json({ noticias: boasNoticias });
  } catch (error) {
    console.error('Erro ao obter notícias:', error);
    res.status(500).json({ error: 'Erro ao obter notícias' });
  }
}
