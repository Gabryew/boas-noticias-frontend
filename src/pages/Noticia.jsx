import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";

export default function Noticia() {
  const [noticia, setNoticia] = useState(null);
  const [loading, setLoading] = useState(true);
  const { link } = useParams(); // Obtém o link da URL
  const navigate = useNavigate();
  const [scrollProgress, setScrollProgress] = useState(0);
  const [noticias, setNoticias] = useState([]);

  // Função para calcular tempo de leitura estimado
  const calcularTempoLeitura = (texto) => {
    const palavrasPorMinuto = 200;
    const palavras = texto.split(/\s+/).length;
    return Math.ceil(palavras / palavrasPorMinuto);
  };

  // Função para ouvir o texto
  const ouvirTexto = () => {
    const texto = noticia.summary;
    const utterance = new SpeechSynthesisUtterance(texto);
    window.speechSynthesis.speak(utterance);
  };

  // Função para obter a porcentagem de progresso conforme o usuário rola
  const calcularProgressoScroll = () => {
    const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
    const currentPosition = window.scrollY;
    setScrollProgress((currentPosition / totalHeight) * 100);
  };

  useEffect(() => {
    async function fetchNoticia() {
      try {
        const response = await axios.get("https://boas-noticias-frontend.vercel.app/api/boas-noticias");

        // Converte o link da URL para o mesmo formato que está no feed
        const noticiaEncontrada = response.data.find(
          (n) => encodeURIComponent(n.link) === link
        );

        if (noticiaEncontrada) {
          setNoticia(noticiaEncontrada);
        } else {
          // Redireciona para a home se não encontrar a notícia
          navigate("/");
        }

        // Armazenando todas as notícias para exibir outras
        setNoticias(response.data);
      } catch (error) {
        console.error("Erro ao buscar a notícia:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchNoticia();
    window.addEventListener("scroll", calcularProgressoScroll);

    return () => {
      window.removeEventListener("scroll", calcularProgressoScroll);
    };
  }, [link, navigate]);

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
      {/* Barra de progresso de rolagem */}
      <div
        className="w-full h-1 bg-blue-500 fixed top-0 z-50"
        style={{ width: `${scrollProgress}%` }}
      ></div>

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
          <h1 className="text-3xl md:text-4xl font-bold leading-tight">{noticia.title}</h1>
          <div className="text-sm text-gray-400 flex gap-4 flex-wrap">
            <span>{new Date(noticia.pubDate).toLocaleDateString()}</span>
            {noticia.author && <span>Por {noticia.author}</span>}
            {noticia.source && <span>Fonte: {noticia.source}</span>}
          </div>
        </div>

        {/* Botões: Ler no site original, Compartilhar e Ouvir */}
        <div className="flex gap-4">
          <a
            href={noticia.link}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-semibold transition w-full text-center"
          >
            Ler no site original
          </a>
          <button
            onClick={compartilharNoticia}
            className="inline-block bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-xl font-semibold transition w-full text-center"
          >
            Compartilhar
          </button>
          <button
            onClick={ouvirTexto}
            className="inline-block bg-yellow-600 hover:bg-yellow-700 text-white px-6 py-3 rounded-xl font-semibold transition w-full text-center"
          >
            Ouvir Notícia
          </button>
        </div>

        {/* Conteúdo textual da notícia */}
        <div className="prose prose-invert prose-p:leading-relaxed prose-p:mb-4 max-w-none text-lg mt-6">
          {noticia.summary
            .split("\n")
            .map((par, i) => <p key={i}>{par.trim()}</p>)}
        </div>

        {/* Tempo de leitura */}
        <div className="text-sm text-gray-400">
          Tempo de leitura: {calcularTempoLeitura(noticia.summary)} minutos
        </div>

        {/* Botão para voltar à Home */}
        <button
          onClick={() => navigate("/")}
          className="inline-block bg-gray-600 hover:bg-gray-700 text-white px-6 py-3 rounded-xl font-semibold mt-4 transition"
        >
          Voltar para Home
        </button>

        {/* Sugerir outras notícias */}
        <div className="mt-8">
          <h2 className="text-2xl font-semibold">Outras notícias:</h2>
          <div className="space-y-4 mt-4">
            {noticias
              .filter((n) => n.link !== noticia.link)
              .slice(0, 3) // Exibe 3 outras notícias
              .map((n) => (
                <div key={n.link} className="flex flex-col space-y-2">
                  <a
                    href={n.link}
                    className="text-lg font-semibold hover:underline"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {n.title}
                  </a>
                  <p className="text-sm text-gray-400">{new Date(n.pubDate).toLocaleDateString()}</p>
                </div>
              ))}
          </div>
        </div>
      </div>
    </div>
  );
}
