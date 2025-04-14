import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";

export default function Noticia() {
  const [noticia, setNoticia] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speechInstance, setSpeechInstance] = useState(null); // Para guardar a instância do SpeechSynthesisUtterance
  const [currentTime, setCurrentTime] = useState(0); // Para controlar o progresso
  const [duration, setDuration] = useState(0); // Para a duração total da leitura
  const [scrollProgress, setScrollProgress] = useState(0); // Barra de progresso de rolagem
  const [relatedNews, setRelatedNews] = useState([]);
  const { link } = useParams();
  const navigate = useNavigate();

  // Função para calcular o tempo de leitura
  const calcularTempoLeitura = (texto) => {
    const palavras = texto.split(/\s+/).length;
    const tempo = Math.ceil(palavras / 200); // Aproximadamente 200 palavras por minuto
    return tempo;
  };

  // Função para formatar o tempo no formato MM:SS
  const formatarTempo = (segundos) => {
    const minutos = Math.floor(segundos / 60);
    const segundosRestantes = segundos % 60;
    return `${minutos < 10 ? "0" : ""}${minutos}:${segundosRestantes < 10 ? "0" : ""}${segundosRestantes}`;
  };

  // Função para ouvir o texto
  const ouvirTexto = () => {
    if (speechInstance) {
      if (isPlaying) {
        window.speechSynthesis.pause();
        setIsPlaying(false);
      } else {
        window.speechSynthesis.resume();
        setIsPlaying(true);
      }
    } else {
      const texto = noticia.summary;
      const utterance = new SpeechSynthesisUtterance(texto);

      // Atualiza a duração da leitura quando o texto começar a ser lido
      utterance.onstart = () => {
        setDuration(calcularTempoLeitura(texto)); // Estima o tempo de leitura
        setIsPlaying(true);
      };

      // Atualiza o progresso do áudio enquanto ele estiver sendo lido
      utterance.onboundary = (event) => {
        const totalWords = texto.split(/\s+/).length;
        const wordsRead = event.charIndex / totalWords;
        setCurrentTime(wordsRead * duration); // Atualiza a linha do tempo
      };

      utterance.onend = () => {
        setIsPlaying(false);
        setCurrentTime(0);
      };

      window.speechSynthesis.speak(utterance);
      setSpeechInstance(utterance);
    }
  };

  // Função para manipular o progresso (linha do tempo)
  const handleTimeChange = (event) => {
    const newTime = event.target.value;
    setCurrentTime(newTime);

    if (speechInstance) {
      const texto = noticia.summary;
      const totalWords = texto.split(/\s+/).length;
      const targetWordIndex = Math.floor((newTime / duration) * totalWords);
      speechInstance.cancel();
      const utterance = new SpeechSynthesisUtterance(texto.slice(targetWordIndex));
      window.speechSynthesis.speak(utterance);
      setSpeechInstance(utterance);
    }
  };

  // Função para atualizar a barra de progresso de rolagem
  const handleScroll = () => {
    const scrollTop = window.scrollY;
    const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
    const scrolled = (scrollTop / scrollHeight) * 100;
    setScrollProgress(scrolled);
  };

  // Função para buscar as notícias relacionadas
  const fetchRelatedNews = (noticiaId) => {
    axios
      .get("https://boas-noticias-frontend.vercel.app/api/boas-noticias")
      .then((response) => {
        const related = response.data.filter((n) => n.link !== noticiaId);
        setRelatedNews(related.slice(0, 3)); // Pega 3 notícias relacionadas
      })
      .catch((error) => {
        console.error("Erro ao buscar notícias relacionadas:", error);
      });
  };

  // Função para ir para a home
  const goHome = () => {
    navigate("/");
  };

  useEffect(() => {
    async function fetchNoticia() {
      try {
        const response = await axios.get("https://boas-noticias-frontend.vercel.app/api/boas-noticias");
        const noticiaEncontrada = response.data.find(
          (n) => n.link === link
        );

        if (noticiaEncontrada) {
          setNoticia(noticiaEncontrada);
          fetchRelatedNews(noticiaEncontrada.link); // Buscar notícias relacionadas
        } else {
          navigate("/"); // Redireciona para a home se a notícia não for encontrada
        }
      } catch (error) {
        console.error("Erro ao buscar a notícia:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchNoticia();
  }, [link, navigate]);

  useEffect(() => {
    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-black text-white text-xl">
        Carregando notícia...
      </div>
    );
  }

  if (!noticia) {
    return (
      <div className="h-screen flex items-center justify-center bg-black text-white text-xl">
        Notícia não encontrada.
      </div>
    );
  }

  return (
    <div className="bg-black text-white min-h-screen">
      {/* Barra de Progresso de Rolagem */}
      <div className="h-1 bg-blue-600" style={{ width: `${scrollProgress}%` }}></div>

      {/* Botão Voltar para a Home */}
      <button
        onClick={goHome}
        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl m-4"
      >
        Voltar para a Home
      </button>

      {/* Imagem principal */}
      <div
        className="h-64 md:h-96 bg-cover bg-center"
        style={{
          backgroundImage: `url(${noticia.image || "default-image.jpg"})`,
        }}
      />

      {/* Conteúdo da notícia */}
      <div className="max-w-3xl mx-auto p-6 space-y-6">
        <div className="space-y-1">
          <h1 className="text-3xl md:text-4xl font-bold leading-tight">
            {noticia.title}
          </h1>
          <div className="text-sm text-gray-400 flex gap-4 flex-wrap">
            <span>{new Date(noticia.pubDate).toLocaleDateString()}</span>
            {noticia.author && <span>Por {noticia.author}</span>}
            {noticia.source && <span>Fonte: {noticia.source}</span>}
          </div>

          {/* Tempo de leitura */}
          <div className="text-sm text-gray-400 mt-2">
            Tempo estimado de leitura: {calcularTempoLeitura(noticia.summary)} min
          </div>
        </div>

        {/* Player de áudio */}
        <div className="flex items-center space-x-4 mt-6">
          <button
            onClick={ouvirTexto}
            className="bg-yellow-600 hover:bg-yellow-700 text-white px-4 py-2 rounded-xl"
          >
            {isPlaying ? "Pausar" : "Reproduzir"}
          </button>

          {/* Tempo no formato MM:SS */}
          <span>{formatarTempo(currentTime)}</span>

          {/* Linha do tempo */}
          <input
            type="range"
            min="0"
            max={duration}
            value={currentTime}
            onChange={handleTimeChange}
            className="w-full"
          />
        </div>

        {/* Resumo da notícia */}
        <div className="prose prose-invert prose-p:leading-relaxed prose-p:mb-4 max-w-none text-lg">
          {noticia.summary
            .split("\n")
            .map((par, i) => <p key={i}>{par.trim()}</p>)}
        </div>

        <a
          href={noticia.link}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-block bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-semibold transition"
        >
          Ler no site original
        </a>

        {/* Botão de Compartilhar */}
        <button
          onClick={() => {
            if (navigator.share) {
              navigator
                .share({
                  title: noticia.title,
                  text: noticia.summary,
                  url: noticia.link,
                })
                .then(() => console.log("Notícia compartilhada com sucesso!"))
                .catch((error) => console.error("Erro ao compartilhar a notícia:", error));
            } else {
              alert("Compartilhamento não suportado neste navegador.");
            }
          }}
          className="inline-block bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-xl font-semibold mt-4 transition"
        >
          Compartilhar
        </button>

        {/* Outras Notícias */}
        <div className="mt-8 space-y-4">
          <h2 className="text-xl font-semibold">Outras Notícias</h2>
          {relatedNews.map((news) => (
            <div key={news.link} className="bg-gray-800 p-4 rounded-lg">
              <h3 className="text-lg font-semibold">{news.title}</h3>
              <a href={`/noticia/${news.link}`} className="text-blue-500">
                Ver mais
              </a>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
