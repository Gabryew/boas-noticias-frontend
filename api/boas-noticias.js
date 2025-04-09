const Parser = require("rss-parser");
const parser = new Parser();

const RSS_FEEDS = [
  "https://g1.globo.com/rss/g1/",
  "https://www.bbc.com/portuguese/index.xml",
  "https://www.catracalivre.com.br/feed/",
];

const palavrasChaveBoas = [
  "descobre", "cura", "vence", "salva", "ajuda", "melhora",
  "esperança", "sustentável", "herói", "heróico", "positivo",
  "recorde", "vitória", "avanço", "progresso", "acesso", "impacto positivo"
];

function filtrarNoticia(noticia) {
  const texto = `${noticia.title} ${noticia.contentSnippet}`.toLowerCase();
  return palavrasChaveBoas.some(palavra => texto.includes(palavra));
}

module.exports = async (req, res) => {
  try {
    const todasNoticias = [];

    for (const url of RSS_FEEDS) {
      const feed = await parser.parseURL(url);
      const boas = feed.items.filter(filtrarNoticia).map(item => ({
        title: item.title,
        summary: item.contentSnippet,
        link: item.link,
        pubDate: item.pubDate
      }));
      todasNoticias.push(...boas);
    }

    res.status(200).json(
      todasNoticias.sort((a, b) => new Date(b.pubDate) - new Date(a.pubDate))
    );
  } catch (err) {
    console.error("Erro:", err);
    res.status(500).json({ error: "Erro ao buscar notícias." });
  }
};