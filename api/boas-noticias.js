const Parser = require("rss-parser");
const nlp = require("compromise");
const sentiment = require("wink-sentiment");

const parser = new Parser();

const RSS_FEEDS = [
  "https://g1.globo.com/rss/g1/",
  "https://www.bbc.com/portuguese/index.xml",
  "https://www.catracalivre.com.br/feed/",
  "https://rss.uol.com.br/feed/noticias.xml",
  "https://agenciabrasil.ebc.com.br/rss/ultimasnoticias/feed.xml",
  "https://www.cnnbrasil.com.br/rss/",
];

function filtrarSentimento(noticia) {
  const texto = `${noticia.title} ${noticia.contentSnippet}`;
  const analise = sentiment(texto);
  return analise.score > 1; // Mantém só as com sentimento bem positivo
}

module.exports = async (req, res) => {
  try {
    const todasNoticias = [];

    console.log("Iniciando a busca por feeds...");

    for (const url of RSS_FEEDS) {
      console.log(`Buscando feed: ${url}`);
      const feed = await parser.parseURL(url);
      console.log(`Feed ${url} encontrado, processando itens...`);
      const boas = feed.items.filter(filtrarSentimento).map(item => ({
        title: item.title,
        summary: item.contentSnippet,
        link: item.link,
        pubDate: item.pubDate
      }));
      todasNoticias.push(...boas);
    }

    console.log("Feeds processados, retornando notícias...");
    res.status(200).json(
      todasNoticias.sort((a, b) => new Date(b.pubDate) - new Date(a.pubDate))
    );
  } catch (err) {
    console.error("Erro:", err);
    res.status(500).json({ error: "Erro ao buscar notícias." });
  }
};