import Parser from 'rss-parser';
import Sentiment from 'sentiment';

const parser = new Parser();
const sentiment = new Sentiment();

const FEEDS = [
  'https://g1.globo.com/rss/g1/',
  'https://feeds.bbci.co.uk/portuguese/rss.xml',
];

// Cache simples para não classificar o mesmo título duas vezes
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

export default async function handler(req, res) {
  try {
    const allNews = [];

    // Loop para processar todos os feeds
    for (const feedUrl of FEEDS) {
      let feed;
      try {
        feed = await parser.parseURL(feedUrl);
      } catch (feedError) {
        console.error(`Erro ao processar o feed ${feedUrl}:`, feedError);
        continue;
      }

      // Verificação de integridade do feed
      if (!feed || !feed.items || feed.items.length === 0) {
        console.warn(`O feed ${feedUrl} não contém itens válidos ou não é um RSS válido.`);
        continue;
      }

      // Mapeando cada item de feed para o formato esperado
      const parsedNews = await Promise.all(
        feed.items.map(async (item) => {
          const title = item.title || '';
          const content = item.contentSnippet || item.content || '';
          const categoria = classificarNoticia(title + ' ' + content);
          const tempoLeitura = estimateReadingTime(content);

          return {
            title: title, // Alterado de "titulo" para "title"
            content: content, // Alterado de "conteudo" para "content"
            link: item.link,
            date: item.pubDate, // Alterado de "data" para "date"
            image: item.enclosure?.url || null, // Alterado de "imagem" para "image"
            author: item.creator || item.author || 'Desconhecido', // Alterado de "autor" para "author"
            source: feed.title, // Alterado de "veiculo" para "source"
            category: categoria, // Alterado de "categoria" para "category"
            readingTime: tempoLeitura // Alterado de "tempoLeitura" para "readingTime"
          };
        })
      );

      allNews.push(...parsedNews);
    }

    // Filtrando apenas as notícias boas
    const boasNoticias = allNews.filter((n) => n.category === 'boa');

    // Verificação para caso não haja notícias boas
    if (boasNoticias.length === 0) {
      return res.status(200).json({ message: 'Nenhuma notícia boa encontrada.' });
    }

    // Enviando as notícias boas no formato esperado
    res.status(200).json({ noticias: boasNoticias });
  } catch (error) {
    console.error('Erro ao obter notícias:', error);
    res.status(500).json({ error: 'Erro ao obter notícias' });
  }
}
