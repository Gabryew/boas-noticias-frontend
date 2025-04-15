import Parser from "rss-parser";
import { db } from "../firebaseAdmin";
import { doc, getDoc, setDoc } from "firebase-admin/firestore";

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
    return parts.length > 1 ? parts[0].toUpperCase() : hostname.toUpperCase();
  } catch (e) {
    return null;
  }
}

async function loadKeywords() {
  const docRef = doc(db, "keywords", "keywords");
  const docSnap = await getDoc(docRef);

  if (docSnap.exists()) {
    return docSnap.data();
  }

  const initialKeywords = {
    positiveKeywords: [
      "cura", "descoberta", "ajudou", "vitória", "solidariedade", "avançou", "reconhecimento",
      "conquista", "inovação", "superação", "melhoria", "comunidade", "ajuda", "preservação",
      "vacinado", "campanha", "educação", "recuperação", "aliança", "progresso", "acolhimento",
      "inclusão", "emprego", "renovação", "acordo", "projeto social", "salvamento", "renascimento",
      "ajuda humanitária", "medicação", "apoio", "expansão"
    ],
    negativeKeywords: [
      "tragédia", "morte", "assassinato", "crime", "violência", "desastre", "incêndio", "fogo",
      "desabamento", "acidente", "explosão", "tragicamente", "colapso", "guerra", "conflito",
      "corrupção", "fraude", "crise", "falência", "dano", "assalto", "ferido", "infecção",
      "envenenamento", "atentado", "caos", "inundação", "desespero", "lockdown", "pandemia",
      "falta de", "explosivo", "repressão", "desabrigo", "enxurrada", "tragédias ambientais"
    ]
  };

  await setDoc(docRef, initialKeywords);
  return initialKeywords;
}

async function saveKeywords(keywords) {
  const docRef = doc(db, "keywords", "keywords");
  await setDoc(docRef, keywords);
}

async function updateKeywords(noticia, classification) {
  const keywords = await loadKeywords();
  const text = cleanText(`${noticia.title} ${noticia.contentSnippet || ""}`);
  const words = text.split(/\s+/);

  words.forEach(word => {
    if (classification === 'good' && !keywords.positiveKeywords.includes(word)) {
      keywords.positiveKeywords.push(word);
    } else if (classification === 'bad' && !keywords.negativeKeywords.includes(word)) {
      keywords.negativeKeywords.push(word);
    }
  });

  await saveKeywords(keywords);
}

async function classifyNews(noticia) {
  const keywords = await loadKeywords();
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

  await updateKeywords(noticia, classification);

  return { classification, image };
}

async function fetchNoticias() {
  const todasNoticias = [];

  for (const url of RSS_FEEDS) {
    const feed = await parser.parseURL(url);

    const noticiasClassificadas = await Promise.all(feed.items.map(async (item) => {
      const { classification, image } = await classifyNews(item);
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
    }));

    todasNoticias.push(...noticiasClassificadas);
  }

  return todasNoticias.sort((a, b) => new Date(b.pubDate) - new Date(a.pubDate));
}

// 🚀 Handler principal da função Vercel
export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  try {
    const noticias = await fetchNoticias();
    res.status(200).json(noticias);
  } catch (error) {
    console.error("Erro ao buscar notícias:", error);
    res.status(500).json({ error: "Erro ao buscar notícias" });
  }
}
