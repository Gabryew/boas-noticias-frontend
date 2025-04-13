import Parser from "rss-parser";

// Instanciando o Parser RSS
const parser = new Parser();

// Listagem de feeds RSS
const RSS_FEEDS = [
  "https://g1.globo.com/rss/g1/",
  "https://www.bbc.com/portuguese/index.xml",
  "https://www.catracalivre.com.br/feed/",
  "https://agenciabrasil.ebc.com.br/rss/ultimasnoticias/feed.xml",
  "https://www.cnnbrasil.com.br/rss/",
];

// Palavras-chave para notícias boas
const positiveKeywords = [
  "cura", "descoberta", "ajudou", "vitória", "solidariedade", "avançou", "reconhecimento",
  "conquista", "inovação", "superação", "melhoria", "comunidade", "ajuda", "preservação", 
  "vacinado", "campanha", "educação", "recuperação", "aliança", "progresso", "acolhimento", 
  "inclusão", "emprego", "desemprego", "renovação", "acordo", "acidente evitado", "projeto social", 
  "ajustado", "salvamento", "renascimento", "ajuda humanitária", "medicação", "apoio", "expansão"
];

// Palavras-chave para notícias ruins
const negativeKeywords = [
  "tragédia", "morte", "assassinato", "crime", "violência", "desastre", "incêndio", "fogo", "desabamento", 
  "acidente", "explosão", "tragicamente", "incidente", "colapso", "guerra", "conflito", "corrupção", "fraude", 
  "enfermo", "crise", "desemprego", "destruição", "falência", "desmoronamento", "dano", "assalto", "ferido", 
  "fugitivo", "quebrada", "infecção", "barragem", "envenenamento", "atentado", "caos", "inundação", 
  "desespero", "crise econômica", "subalimentação", "lockdown", "pandemia", "falta de", "quase morte", 
  "explosivo", "repressão", "desabrigo", "enxurrada", "tragédias ambientais"
];

// Função para limpar e preparar o texto
function cleanText(text) {
  return text.replace(/[^\w\s]/g, "").toLowerCase();
}

// Função para classificar a notícia com base nas palavras-chave
function classifyNews(noticia) {
  const texto = `${noticia.title} ${noticia.contentSnippet}`;
  const clean = cleanText(texto);

  // Inicializando a pontuação de sentimento
  let sentimentScore = 0;

  // Verificando palavras-chave positivas
  positiveKeywords.forEach(keyword => {
    if (clean.includes(keyword)) {
      sentimentScore += 1;
    }
  });

  // Verificando palavras-chave negativas
  negativeKeywords.forEach(keyword => {
    if (clean.includes(keyword)) {
      sentimentScore -= 1;
    }
  });

  // Extrair a imagem da notícia
  const image = extractImage(noticia);

  // Classificando a notícia com base no score
  if (sentimentScore > 1) {
    return {
      classification: "good",  // Boa notícia
      image: image,            // Adiciona a imagem
    };
  } else if (sentimentScore < -1) {
    return {
      classification: "bad",   // Notícia ruim
      image: image,            // Adiciona a imagem
    };
  } else {
    return {
      classification: "neutral", // Notícia neutra
      image: image,             // Adiciona a imagem
    };
  }
}

// Função para extrair a imagem de um item de notícia
function extractImage(item) {
  // Verifica no campo "enclosure" (se presente)
  if (item.enclosures && item.enclosures.length > 0) {
    return item.enclosures[0].url; // Retorna a URL da imagem
  }

  // Verifica no campo "media:content" (se presente)
  if (item["media:content"] && item["media:content"].url) {
    return item["media:content"].url;
  }

  // Verifica no campo "content:encoded" (se a imagem estiver no conteúdo HTML)
  if (item["content:encoded"]) {
    const imgMatch = item["content:encoded"].match(/<img.*?src="(.*?)"/);
    if (imgMatch && imgMatch[1]) {
      return imgMatch[1]; // Retorna a URL da imagem encontrada
    }
  }

  // Retorna null se não encontrar imagem
  return null;
}

export default async (req, res) => {
  try {
    const todasNoticias = [];

    console.log("Iniciando a busca por feeds...");

    for (const url of RSS_FEEDS) {
      console.log(`Buscando feed: ${url}`);
      const feed = await parser.parseURL(url);
      console.log(`Feed ${url} encontrado, processando itens...`);

      // Classificando e filtrando as notícias
      const noticiasClassificadas = feed.items.map(item => {
        const { classification, image } = classifyNews(item);

        return {
          title: item.title,
          summary: item.contentSnippet,
          link: item.link,
          pubDate: item.pubDate,
          classification: classification,
          image: image,
        };
      });

      // Filtrando as boas e neutras
      const boasENeutras = noticiasClassificadas.filter(noticia => noticia.classification === "good");
      todasNoticias.push(...boasENeutras);
    }

    console.log("Feeds processados, retornando notícias...");
    res.status(200).json(
      todasNoticias.sort((a, b) => new Date(b.pubDate) - new Date(a.pubDate))  // Ordenando por data
    );
  } catch (err) {
    console.error("Erro:", err);
    res.status(500).json({ error: "Erro ao buscar notícias." });
  }
};
