import Parser from "rss-parser";
const parser = new Parser();
const fs = require('fs');

const RSS_FEEDS = [
  "https://g1.globo.com/rss/g1/",
  "https://www.bbc.com/portuguese/index.xml",
  "https://www.catracalivre.com.br/feed/",
  "https://agenciabrasil.ebc.com.br/rss/ultimasnoticias/feed.xml",
  "https://www.cnnbrasil.com.br/rss/",
];

function loadKeywords() {
  const data = fs.readFileSync('keywords.json', 'utf8');
  return JSON.parse(data);
}

function saveKeywords(keywords) {
  fs.writeFileSync('keywords.json', JSON.stringify(keywords, null, 2));
}

function cleanText(text) {
  return text.replace(/[^\w\s]/g, "").toLowerCase();
}

function extractImage(item) {
  const possibleFields = [
    item.enclosure?.url,
    item["media:content"]?.url,
    item["content:encoded"],
    item["content"],
    item["summary"],
    item["content:encodedSnippet"],
    item["summaryDetail"]?.value,
  ];

  for (const field of possibleFields) {
    if (typeof field === "string") {
      const match = field.match(/<img[^>]+src="([^">]+)"/);
      if (match) return match[1];
    }
  }

  return null;
}

function extractSourceFromLink(link) {
  try {
    const url = new URL(link);
    const hostname = url.hostname.replace("www.", "");
    const parts = hostname.split(".");
    if (parts.length > 1) {
      return parts[0].toUpperCase(); // Ex: g1.globo.com → G1
    }
    return hostname.toUpperCase();
  } catch (e) {
    return null;
  }
}

function updateKeywords(noticia, classification) {
  const keywords = loadKeywords();
  const text = cleanText(`${noticia.title} ${noticia.contentSnippet || ""}`);
  const words = text.split(/\s+/);

  words.forEach(word => {
    if (classification === 'good' && !keywords.positiveKeywords.includes(word)) {
      keywords.positiveKeywords.push(word);
    } else if (classification === 'bad' && !keywords.negativeKeywords.includes(word)) {
      keywords.negativeKeywords.push(word);
    }
  });

  saveKeywords(keywords);
}

function classifyNews(noticia) {
  const keywords = loadKeywords();
  const text = cleanText(`${noticia.title} ${noticia.contentSnippet || ""}`);
  let score = 0;

  keywords.positiveKeywords.forEach(word => {
    if (text.includes(word)) score += 1;
  });

  keywords.negativeKeywords.forEach(word => {
    if (text.includes(word)) score -= 1;
  });

  const classification = score > 1 ? "good" : score < -1 ? "bad" : "neutral";
  const image = extractImage(noticia);

  updateKeywords(noticia, classification); // Atualiza as palavras-chave

  return { classification, image };
}

export default async (req, res) => {
  try {
    const todasNoticias = [];

    for (const url of RSS_FEEDS) {
      const feed = await parser.parseURL(url);

      const noticiasClassificadas = feed.items.map(item => {
        const { classification, image } = classifyNews(item);
        const source = extractSourceFromLink(item.link);
        const author = item.creator || item.author || null;

        return {
          title: item.title,
          summary: item.contentSnippet,
          link: item.link,
          pubDate: item.pubDate,
          classification,
          image,
          author,
          source,
        };
      });

      todasNoticias.push(...noticiasClassificadas);
    }

    res.status(200).json(
      todasNoticias.sort((a, b) => new Date(b.pubDate) - new Date(a.pubDate))
    );
  } catch (err) {
    console.error("Erro ao buscar notícias:", err);
    res.status(500).json({ error: "Erro ao buscar notícias." });
  }
};
