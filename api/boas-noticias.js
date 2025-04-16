import Parser from 'rss-parser';
import { keywords } from './keywords.js';

const parser = new Parser();
const FEEDS = [
  'https://g1.globo.com/rss/g1/',
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
  const wordsPerMinute = 200;  // Média de palavras por minuto
  const wordCount = content?.split(/\s+/).length || 0;  // Conta o número de palavras
  return Math.ceil(wordCount / wordsPerMinute);  // Retorna o tempo de leitura arredondado para cima
}

export default async function handler(req, res) {
  try {
    const allNews = [];

    // Tenta obter notícias de cada feed
    for (const feedUrl of FEEDS) {
      let feed;
      try {
        feed = await parser.parseURL(feedUrl);
      } catch (feedError) {
        console.error(`Erro ao processar o feed ${feedUrl}:`, feedError);
        continue; // Se um feed falhar, tenta o próximo
      }

      // Verifica se o feed tem itens válidos
      if (!feed || !feed.items || feed.items.length === 0) {
        console.warn(`O feed ${feedUrl} não contém itens válidos ou não é um RSS válido.`);
        continue; // Se o feed não contiver itens válidos, pula ele
      }

      // Processa cada item do feed
      const parsedNews = feed.items.map((item) => {
        const title = item.title || '';
        const content = item.contentSnippet || item.content || '';  // Pega o conteúdo de texto
        const categoria = classifyNews(title, content);
        const tempoLeitura = estimateReadingTime(content);

        return {
          titulo: title,
          conteudo: content,
          link: item.link,
          data: item.pubDate,
          imagem: item.enclosure?.url || null,  // Pega a URL da imagem, se houver
          autor: item.creator || item.author || 'Desconhecido',  // Autor da notícia
          veiculo: feed.title,  // Veículo de mídia
          categoria,
          tempoLeitura
        };
      });

      allNews.push(...parsedNews);  // Adiciona as notícias do feed ao array principal
    }

    // Filtra apenas as notícias boas
    const boasNoticias = allNews.filter((n) => n.categoria === 'boa');

    // Responde com as boas notícias ou uma mensagem de erro se não houver nenhuma
    if (boasNoticias.length === 0) {
      return res.status(200).json({ message: 'Nenhuma notícia boa encontrada.' });
    }

    res.status(200).json({ noticias: boasNoticias });
  } catch (error) {
    console.error('Erro ao obter notícias:', error);
    res.status(500).json({ error: 'Erro ao obter notícias' });
  }
}
