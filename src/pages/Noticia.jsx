import { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { motion } from "framer-motion";
import { Play, Pause } from "lucide-react";

export default function Noticia() {
  const [noticia, setNoticia] = useState(null);
  const [loading, setLoading] = useState(true);
  const [ouvir, setOuvir] = useState(false);
  const [tempoLeitura, setTempoLeitura] = useState(0);
  const [progresso, setProgresso] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const audioRef = useRef(null);
  const { link } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    async function fetchNoticia() {
      try {
        const response = await axios.get("https://boas-noticias-frontend.vercel.app/api/boas-noticias");
        const noticiaEncontrada = response.data.find((n) => n.link === link);
        if (noticiaEncontrada) {
          setNoticia(noticiaEncontrada);
          calcularTempoLeitura(noticiaEncontrada.summary);
        } else {
          navigate("/");
        }
      } catch (error) {
        console.error("Erro ao buscar a notícia:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchNoticia();
  }, [link, navigate]);

  const calcularTempoLeitura = (texto) => {
    const palavras = texto.split(/\s+/).length;
    const minutos = Math.ceil(palavras / 200);
    setTempoLeitura(minutos);
  };

  const compartilharNoticia = () => {
    if (navigator.share) {
      navigator.share({
        title: noticia.title,
        text: noticia.summary,
        url: noticia.link,
      });
    } else {
      alert("Compartilhamento não suportado neste navegador.");
    }
  };

  const formatarTempo = (segundos) => {
    const min = String(Math.floor(segundos / 60)).padStart(2, "0");
    const sec = String(Math.floor(segundos % 60)).padStart(2, "0");
    return `${min}:${sec}`;
  };

  const toggleAudio = () => {
    const audio = audioRef.current;
    if (audio) {
      if (ouvir) {
        audio.pause();
      } else {
        audio.play();
      }
      setOuvir(!ouvir);
    }
  };

  useEffect(() => {
    const atualizarBarra = () => {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const scrollPercent = (scrollTop / docHeight) * 100;
      setProgresso(scrollPercent);
    };

    window.addEventListener("scroll", atualizarBarra);
    return () => window.removeEventListener("scroll", atualizarBarra);
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
      {/* Barra de progresso de leitura */}
      <div className="fixed top-0 left-0 w-full h-1 bg-white z-50">
        <motion.div
          className="h-full bg-blue-500 origin-left"
          style={{ width: `${progresso}%` }}
          initial={{ width: 0 }}
          animate={{ width: `${progresso}%` }}
          transition={{ ease: "linear" }}
        />
      </div>

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

        <p className="text-sm text-gray-300">⏱️ Tempo de leitura: {tempoLeitura} mins</p>

        {/* Player de áudio */}
        <div className="bg-white/10 p-4 rounded-xl flex flex-col gap-2">
          <audio
            ref={audioRef}
            onTimeUpdate={() => setCurrentTime(audioRef.current.currentTime)}
            onLoadedMetadata={() => setDuration(audioRef.current.duration)}
            onEnded={() => setOuvir(false)}
          >
            <source src={`data:audio/wav;base64,${btoa(noticia.summary)}`} />
          </audio>

          <div className="flex items-center gap-4">
            <button
              onClick={toggleAudio}
              className="p-2 bg-white text-black rounded-full hover:scale-110 transition"
            >
              {ouvir ? <Pause size={20} /> : <Play size={20} />}
            </button>
            <div className="flex-1">
              <div className="w-full bg-white/20 h-2 rounded-full">
                <div
                  className="bg-green-500 h-2 rounded-full"
                  style={{ width: `${(currentTime / duration) * 100 || 0}%` }}
                />
              </div>
              <div className="text-xs text-gray-300 mt-1 text-right">
                {formatarTempo(currentTime)} / {formatarTempo(duration)}
              </div>
            </div>
          </div>
        </div>

        {/* Texto da notícia */}
        <div className="prose prose-invert prose-p:leading-relaxed prose-p:mb-4 max-w-none text-lg">
          {noticia.summary
            .split("\n")
            .map((par, i) => <p key={i}>{par.trim()}</p>)}
        </div>

        {/* Botões de ação */}
        <div className="flex flex-col md:flex-row gap-4 pt-4 border-t border-white/10 mt-6">
          <button
            onClick={() => navigate("/")}
            className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-xl font-semibold transition w-full md:w-auto"
          >
            Voltar
          </button>

          <a
            href={noticia.link}
            target="_blank"
            rel="noopener noreferrer"
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-semibold transition w-full md:w-auto text-center"
          >
            Ler no site original
          </a>

          <button
            onClick={compartilharNoticia}
            className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-xl font-semibold transition w-full md:w-auto"
          >
            Compartilhar
          </button>
        </div>

        {/* Outras notícias */}
        <div className="mt-12 space-y-6">
          <h2 className="text-2xl font-bold">Outras notícias</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {noticia.outros?.map((outra, i) => (
              <div
                key={i}
                onClick={() => navigate(`/noticia/${encodeURIComponent(outra.link)}`)}
                className="cursor-pointer group"
              >
                <div
                  className="h-40 bg-cover bg-center rounded-xl mb-2"
                  style={{ backgroundImage: `url(${outra.image || "default-image.jpg"})` }}
                />
                <p className="group-hover:underline">{outra.title}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
