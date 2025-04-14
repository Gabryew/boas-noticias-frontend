import { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";

export default function Noticia() {
  const [noticia, setNoticia] = useState(null);
  const [loading, setLoading] = useState(true);
  const [noticiasRelacionadas, setNoticiasRelacionadas] = useState([]);
  const [tempoLeitura, setTempoLeitura] = useState("");
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const synthRef = useRef(window.speechSynthesis);
  const utteranceRef = useRef(null);
  const audioInterval = useRef(null);
  const { link } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    async function fetchNoticia() {
      try {
        const response = await axios.get("https://boas-noticias-frontend.vercel.app/api/boas-noticias");
        const noticiaEncontrada = response.data.find((n) => n.link === link);

        if (noticiaEncontrada) {
          setNoticia(noticiaEncontrada);

          const outras = response.data
            .filter((n) => n.link !== link)
            .slice(0, 3);
          setNoticiasRelacionadas(outras);

          const tempo = calcularTempoLeitura(noticiaEncontrada.summary);
          setTempoLeitura(tempo);
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

  useEffect(() => {
    function atualizarBarraDeProgresso() {
      const scrollTop = window.scrollY;
      const scrollHeight = document.body.scrollHeight - window.innerHeight;
      const scrolled = (scrollTop / scrollHeight) * 100;
      setProgress(scrolled);
    }

    window.addEventListener("scroll", atualizarBarraDeProgresso);
    return () => window.removeEventListener("scroll", atualizarBarraDeProgresso);
  }, []);

  const calcularTempoLeitura = (texto) => {
    const palavras = texto.split(/\s+/).length;
    const minutos = Math.ceil(palavras / 200);
    const totalSegundos = minutos * 60;
    const min = String(Math.floor(totalSegundos / 60)).padStart(2, "0");
    const sec = String(totalSegundos % 60).padStart(2, "0");
    return `${min}:${sec}`;
  };

  const compartilharNoticia = () => {
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
  };

  const toggleAudio = () => {
    if (!utteranceRef.current && noticia) {
      utteranceRef.current = new SpeechSynthesisUtterance(noticia.summary);
      utteranceRef.current.onend = () => {
        setIsPlaying(false);
        clearInterval(audioInterval.current);
      };
    }

    if (synthRef.current.speaking) {
      synthRef.current.pause();
      setIsPlaying(false);
    } else {
      if (synthRef.current.paused) {
        synthRef.current.resume();
      } else {
        synthRef.current.speak(utteranceRef.current);
      }
      setIsPlaying(true);
    }
  };

  const goHome = () => navigate("/");

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
      <div className="h-1 bg-white fixed top-0 left-0 z-50">
        <div className="h-full bg-green-400 transition-all duration-200" style={{ width: `${progress}%` }} />
      </div>

      {/* Imagem principal */}
      <div
        className="h-64 md:h-96 bg-cover bg-center"
        style={{
          backgroundImage: `url(${noticia.image || "default-image.jpg"})`,
        }}
      />

      {/* Conteúdo */}
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
          <div className="text-sm text-yellow-400 font-medium">⏱️ Tempo de leitura: {tempoLeitura}</div>
        </div>

        {/* Player de áudio */}
        <div className="flex items-center gap-4">
          <button
            onClick={toggleAudio}
            className="bg-white text-black px-4 py-2 rounded-lg font-semibold"
          >
            {isPlaying ? "⏸ Pausar" : "▶️ Ouvir Notícia"}
          </button>
        </div>

        {/* Texto da notícia */}
        <div className="prose prose-invert prose-p:leading-relaxed prose-p:mb-4 max-w-none text-lg">
          {noticia.summary
            .split("\n")
            .map((par, i) => <p key={i}>{par.trim()}</p>)}
        </div>

        {/* Outras Notícias */}
        <div className="space-y-4 pt-8">
          <h2 className="text-2xl font-semibold">Outras notícias</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {noticiasRelacionadas.map((n, i) => (
              <div
                key={i}
                onClick={() => navigate(`/noticia/${encodeURIComponent(n.link)}`)}
                className="cursor-pointer bg-zinc-800 rounded-xl overflow-hidden hover:scale-[1.02] transition"
              >
                {n.image && (
                  <div
                    className="h-32 bg-cover bg-center"
                    style={{ backgroundImage: `url(${n.image})` }}
                  />
                )}
                <div className="p-4">
                  <h3 className="text-white text-md font-semibold leading-tight">
                    {n.title}
                  </h3>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Ações finais */}
        <div className="flex flex-col sm:flex-row gap-4 pt-8">
          <a
            href={noticia.link}
            target="_blank"
            rel="noopener noreferrer"
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-semibold transition text-center"
          >
            Ler no site original
          </a>
          <button
            onClick={compartilharNoticia}
            className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-xl font-semibold transition"
          >
            Compartilhar
          </button>
          <button
            onClick={goHome}
            className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-xl font-semibold transition"
          >
            Voltar para a Home
          </button>
        </div>
      </div>
    </div>
  );
}
