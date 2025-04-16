import Parser from 'rss-parser';
import fetch from 'node-fetch';
import dotenv from 'dotenv';
dotenv.config();

const parser = new Parser();
const FEEDS = [
  'https://g1.globo.com/rss/g1/',
  'https://feeds.bbci.co.uk/portuguese/rss.xml',
];

// Cache para armazenar resultados de classificação e evitar chamadas repetidas
const cache = new Map();

async function classifyNews(title) {
  // Verifica se o resultado da classificação já está em cache
  if (cache.has(title)) {
    return cache.get(title); // Retorna o resultado em cache
  }

  try {
    const response = await fetch('https://api-inference.huggingface.co/models/finiteautomata/bertweet-base-sentiment-analysis', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.HUGGINGFACE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ inputs: title }), // Apenas o título da notícia é enviado
    });

    const result = await response.json();

    if (!Array.isArray(result) || !result[0]) {
      console.warn('Resposta inesperada da Hugging Face:', result);
      return 'neutra'; // Fallback para 'neutra' se der errado
    }

    // Pegando o label com o maior score
    const labels = result[0];
    const highestLabel = labels.reduce((prev, current) => (prev.score > current.score) ? prev : current);

    // Classificando com base no maior score
    const classification = highestLabel.label === 'POS' ? 'boa' : highestLabel.label === 'NEG' ? 'ruim' : 'neutra';

    // Armazena o resultado no cache
    cache.set(title, classification);

    return classification;

  } catch (error) {
    console.error('Erro na classificação NLP:', error);
    return 'neutra'; // Se der erro, considera como 'neutra'
  }
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

      // Processa cada item do feed em paralelo (melhora o tempo de execução)
      const parsedNews = await Promise.all(
        feed.items.map(async (item) => {
          const title = item.title || '';
          const content = item.contentSnippet || item.content || '';  // Pega o conteúdo de texto
          const categoria = await classifyNews(title); // Agora passamos apenas o título
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
        })
      );

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
