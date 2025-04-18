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
  if (cache.has(title)) {
    console.log(`Resultado do cache para o título: "${title}"`);
    return cache.get(title);
  }

  try {
    const response = await fetch('https://api-inference.huggingface.co/models/pierreguillou/bert-base-cased-sentiment-analysis-sst2-ptbr', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.HUGGINGFACE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ inputs: title }),
    });

    const contentType = response.headers.get('content-type') || '';
    if (!contentType.includes('application/json')) {
      const errorText = await response.text();
      console.error('❌ Resposta da Hugging Face não é JSON:', errorText);
      return 'neutra';
    }

    const result = await response.json();

    if (!Array.isArray(result) || !result[0]) {
      console.warn('⚠️ Resposta inesperada da Hugging Face:', result);
      return 'neutra';
    }

    const labels = result[0];
    const highestLabel = labels.reduce((prev, current) => (prev.score > current.score) ? prev : current);

    let classification;
    switch (highestLabel.label.toLowerCase()) {
      case 'positive':
        classification = 'boa';
        break;
      case 'negative':
        classification = 'ruim';
        break;
      default:
        classification = 'neutra';
    }

    console.log(`🎯 Título: "${title}", Classificação: ${classification} (${highestLabel.label})`);

    cache.set(title, classification);
    return classification;

  } catch (error) {
    console.error('🔥 Erro na classificação NLP:', error);
    return 'neutra';
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

    // Verificando se a classificação das notícias está funcionando corretamente
    console.log("Todas as notícias processadas:", allNews);

    // Filtra apenas as notícias boas
    const boasNoticias = allNews.filter((n) => n.categoria === 'boa');
    
    // Verificando as boas notícias filtradas
    console.log("Boas notícias filtradas:", boasNoticias);

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
