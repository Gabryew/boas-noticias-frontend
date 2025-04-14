import Parser from "rss-parser";

// Instanciando o Parser RSS
const parser = new Parser();

// Lista de feeds RSS a serem analisados
const RSS_FEEDS = [
  "https://g1.globo.com/rss/g1/",
  "https://www.bbc.com/portuguese/index.xml",
  "https://www.catracalivre.com.br/feed/",
  "https://agenciabrasil.ebc.com.br/rss/ultimasnoticias/feed.xml",
  "https://www.cnnbrasil.com.br/rss/",
];

// Função para limpar e preparar o texto
function cleanText(text) {
  return text.replace(/[^\w\s]/g, "").toLowerCase();
}

// Extrai a imagem do item RSS, se houver
function extractImage(item) {
  if (item.enclosure?.url) return item.enclosure.url;
  if (item["media:content"]?.url) return item["media:content"].url;

  if (item["content:encoded"]) {
    const match = item["content:encoded"].match(/<img[^>]+src="([^">]+)"/);
    if (match) return match[1];
  }

  return null;
}

// Classifica a notícia com base nas palavras-chave
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

// Função principal da API
export default async (req, res) => {
  try {
    const todasNoticias = [];

    for (const url of RSS_FEEDS) {
      const feed = await parser.parseURL(url);

      const noticiasClassificadas = feed.items.map(item => {
        const { classification, image } = classifyNews(item);

        return {
          title: item.title,
          summary: item.contentSnippet,
          link: item.link,
          pubDate: item.pubDate,
          classification,
          image,
        };
      });

      const boasENeutras = noticiasClassificadas.filter(n => n.classification === "good");
      todasNoticias.push(...boasENeutras);
    }

    res.status(200).json(
      todasNoticias.sort((a, b) => new Date(b.pubDate) - new Date(a.pubDate))
    );
  } catch (err) {
    console.error("Erro ao buscar notícias:", err);
    res.status(500).json({ error: "Erro ao buscar notícias." });
  }
};
