import Parser from "rss-parser";
import { db } from "../lib/firebaseAdmin"; // 👈 ajuste o caminho se necessário
import { doc, getDoc, setDoc } from "firebase-admin/firestore";

const parser = new Parser();

const RSS_FEEDS = [
  "https://g1.globo.com/rss/g1/",
  "https://www.bbc.com/portuguese/index.xml",
  "https://www.catracalivre.com.br/feed/",
  "https://agenciabrasil.ebc.com.br/rss/ultimasnoticias/feed.xml",
  "https://www.cnnbrasil.com.br/rss/",
];

async function loadKeywords() {
  try {
    const docRef = doc(db, "keywords", "keywords");
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return docSnap.data();
    } else {
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
  } catch (error) {
    console.error("Erro ao carregar palavras-chave:", error);
    throw error;
  }
}

async function saveKeywords(keywords) {
  try {
    const docRef = doc(db, "keywords", "keywords");
    await setDoc(docRef, keywords);
  } catch (error) {
    console.error("Erro ao salvar palavras-chave:", error);
    throw error;
  }
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
    return parts.length > 1 ? parts[0].toUpperCase() : hostname.toUpperCase();
  } catch (e) {
    return null;
  }
}

async function updateKeywords(noticia, classification) {
  try {
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
  } catch (error) {
    console.error("Erro ao atualizar palavras-chave:", error);
    throw error;
  }
}

async function classifyNews(noticia) {
  try {
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
  } catch (error) {
    console.error("Erro ao classificar notícia:", error);
    throw error;
  }
}

export default async (req, res) => {
  try {
    const todasNoticias = [];

    for (const url of RSS_FEEDS) {
      try {
        console.log(`Buscando feed RSS: ${url}`);
        const feed = await parser.parseURL(url);
        console.log(`Feed RSS carregado: ${url}`);

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
      } catch (feedError) {
        console.error(`Erro ao buscar feed RSS: ${url}`, feedError);
      }
    }

    res.status(200).json(
      todasNoticias.sort((a, b) => new Date(b.pubDate) - new Date(a.pubDate))
    );
  } catch (err) {
    console.error("Erro ao buscar notícias:", err);
    res.status(500).json({ error: "Erro ao buscar notícias." });
  }
};
