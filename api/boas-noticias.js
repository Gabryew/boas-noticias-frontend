import Parser from "rss-parser";
const parser = new Parser();

const RSS_FEEDS = [
  "https://g1.globo.com/rss/g1/",
  "https://www.bbc.com/portuguese/index.xml",
  "https://www.catracalivre.com.br/feed/",
  "https://agenciabrasil.ebc.com.br/rss/ultimasnoticias/feed.xml",
  "https://www.cnnbrasil.com.br/rss/",
];

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

function classifyNews(noticia) {
  const text = cleanText(`${noticia.title} ${noticia.contentSnippet || ""}`);
  let score = 0;

  const positiveKeywords = [
    "cura", "descoberta", "ajudou", "vitória", "solidariedade", "avançou", "reconhecimento",
    "conquista", "inovação", "superação", "melhoria", "comunidade", "ajuda", "preservação",
    "vacinado", "campanha", "educação", "recuperação", "aliança", "progresso", "acolhimento",
    "inclusão", "emprego", "renovação", "acordo", "projeto social", "salvamento", "renascimento",
    "ajuda humanitária", "medicação", "apoio", "expansão"
  ];

  const negativeKeywords = [
    "tragédia", "morte", "assassinato", "crime", "violência", "desastre", "incêndio", "fogo",
    "desabamento", "acidente", "explosão", "tragicamente", "colapso", "guerra", "conflito",
    "corrupção", "fraude", "crise", "falência", "dano", "assalto", "ferido", "infecção",
    "envenenamento", "atentado", "caos", "inundação", "desespero", "lockdown", "pandemia",
    "falta de", "explosivo", "repressão", "desabrigo", "enxurrada", "tragédias ambientais"
  ];

  positiveKeywords.forEach(word => {
    if (text.includes(word)) score += 1;
  });

  negativeKeywords.forEach(word => {
    if (text.includes(word)) score -= 1;
  });

  const classification = score > 1 ? "good" : score < -1 ? "bad" : "neutral";
  const image = extractImage(noticia);

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
