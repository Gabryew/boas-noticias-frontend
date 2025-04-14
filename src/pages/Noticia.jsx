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
  const { link } = useParams();
  const navigate = useNavigate();

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
        setDuration(texto.split(/\s+/).length / 200); // Estimativa do tempo de leitura
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

  useEffect(() => {
    async function fetchNoticia() {
      try {
        const response = await axios.get("https://boas-noticias-frontend.vercel.app/api/boas-noticias");
        const noticiaEncontrada = response.data.find(
          (n) => n.link === link
        );

        if (noticiaEncontrada) {
          setNoticia(noticiaEncontrada);
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
        </div>

        <div className="prose prose-invert prose-p:leading-relaxed prose-p:mb-4 max-w-none text-lg">
          {noticia.summary
            .split("\n")
            .map((par, i) => <p key={i}>{par.trim()}</p>)}
        </div>

        {/* Player de áudio */}
        <div className="flex items-center space-x-4 mt-6">
          <button
            onClick={ouvirTexto}
            className="bg-yellow-600 hover:bg-yellow-700 text-white px-4 py-2 rounded-xl"
          >
            {isPlaying ? "Pausar" : "Reproduzir"}
          </button>

          {/* Linha do tempo */}
          <input
            type="range"
            min="0"
            max={duration}
            value={currentTime}
            onChange={handleTimeChange}
            className="w-full"
          />
          <span>{Math.round(currentTime)} / {Math.round(duration)}</span>
        </div>
      </div>
    </div>
  );
}
