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

function extrairImagem(item) {
  // RSS pode ter imagem em "enclosure", "media:content", ou no conteúdo HTML.
  if (item.enclosure?.url) return item.enclosure.url;
  if (item["media:content"]?.url) return item["media:content"].url;

  const regex = /<img[^>]+src="([^">]+)"/i;
  const match = item.content?.match(regex);
  if (match && match[1]) return match[1];

  return null;
}

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
        pubDate: item.pubDate,
        image: extrairImagem(item)
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