const Parser = require("rss-parser");
const nlp = require("compromise");
const sentiment = require("wink-sentiment");

const parser = new Parser();

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

function cleanText(text) {
  // Limpa o texto removendo pontuação e deixando tudo em minúsculas
  return text.replace(/[^\w\s]/g, "").toLowerCase();
}

function analyzeSentiment(text) {
  // Analisa o sentimento da notícia (positivo, neutro ou negativo)
  const analysis = sentiment(text);
  return analysis.score;
}

function classifyNews(noticia) {
  const texto = `${noticia.title} ${noticia.contentSnippet}`;
  const clean = cleanText(texto);
  
  const sentimentScore = analyzeSentiment(clean);

  // Verifica palavras-chave no texto
  const hasPositiveKeywords = positiveKeywords.some(keyword => clean.includes(keyword));
  const hasNegativeKeywords = negativeKeywords.some(keyword => clean.includes(keyword));

  // Classificação
  if (sentimentScore > 1 || hasPositiveKeywords) {
    return "good";  // Boa notícia
  } else if (sentimentScore < -1 || hasNegativeKeywords) {
    return "bad";  // Notícia ruim
  } else {
    return "neutral";  // Notícia neutra
  }
}

module.exports = async (req, res) => {
  try {
    const todasNoticias = [];

    console.log("Iniciando a busca por feeds...");

    for (const url of RSS_FEEDS) {
      console.log(`Buscando feed: ${url}`);
      const feed = await parser.parseURL(url);
      console.log(`Feed ${url} encontrado, processando itens...`);

      // Classifica as notícias e filtra apenas as boas, neutras e ruins
      const noticiasClassificadas = feed.items.map(item => {
        const classification = classifyNews(item);

        return {
          title: item.title,
          summary: item.contentSnippet,
          link: item.link,
          pubDate: item.pubDate,
          classification: classification,  // Adiciona a classificação
        };
      });

      // Filtra as boas e neutras, você pode ajustar para o que precisar
      const boasENeutras = noticiasClassificadas.filter(noticia => noticia.classification === "good");
      todasNoticias.push(...boasENeutras);
    }

    console.log("Feeds processados, retornando notícias...");
    res.status(200).json(
      todasNoticias.sort((a, b) => new Date(b.pubDate) - new Date(a.pubDate))  // Ordena por data
    );
  } catch (err) {
    console.error("Erro:", err);
    res.status(500).json({ error: "Erro ao buscar notícias." });
  }
};