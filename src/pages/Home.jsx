import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

// Função para calcular o tempo de leitura
function calcularTempoLeitura(texto) {
  if (!texto) return null;
  const palavras = texto.trim().split(/\s+/).length;
  const palavrasPorMinuto = 200;
  const minutos = Math.ceil(palavras / palavrasPorMinuto);
  return minutos === 1 ? "1 minuto" : `${minutos} minutos`;
}

export default function Home() {
  const [noticias, setNoticias] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1); // Controle de página
  const [hasMore, setHasMore] = useState(true); // Verifica se há mais notícias
  const navigate = useNavigate();

  useEffect(() => {
    async function fetchNoticias() {
      try {
        setLoading(true);
        const response = await axios.get("https://boas-noticias-frontend.vercel.app/api/boas-noticias", {
          params: { page } // Envia a página para a API
        });
        
        if (response.data.length === 0) {
          setHasMore(false); // Se não houver mais notícias, desabilita o infinite scroll
        }
        
        const noticiasComTempo = response.data.map((noticia) => ({
          ...noticia,
          readingTime: calcularTempoLeitura(noticia.content || noticia.summary), // Calculando o tempo de leitura
        }));
        
        setNoticias((prevNoticias) => [...prevNoticias, ...noticiasComTempo]); // Adiciona as novas notícias à lista
      } catch (error) {
        console.error("Erro ao buscar notícias:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchNoticias();
  }, [page]); // Carregar mais notícias sempre que a página mudar

  const handleScroll = (e) => {
    const { scrollTop, scrollHeight, clientHeight } = e.target;
    if (scrollHeight - scrollTop <= clientHeight + 100 && hasMore && !loading) {
      setPage((prevPage) => prevPage + 1); // Carregar mais notícias
    }
  };

  if (loading && page === 1) {
    return (
      <div className="flex items-center justify-center h-screen bg-black">
        <div className="w-12 h-12 border-4 border-t-transparent border-white rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div
      className="w-screen h-screen overflow-y-scroll snap-y snap-mandatory bg-black text-white"
      onScroll={handleScroll}
    >
      {noticias.map((noticia, index) => (
        <motion.div
          key={index}
          className="w-screen h-screen snap-start relative flex items-end justify-center cursor-pointer"
          onClick={() => navigate(`/noticia/${encodeURIComponent(noticia.link)}`)}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: index * 0.1 }}
          style={{
            backgroundImage: `url(${noticia.image})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            backgroundRepeat: "no-repeat",
          }}
        >
          {/* Gradiente de fundo para legibilidade */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/50 to-transparent z-0" />

          {/* Conteúdo */}
          <div className="relative z-10 w-full px-6 py-12 text-left space-y-4 backdrop-blur-sm">
            <h1 className="text-3xl md:text-4xl font-extrabold leading-tight drop-shadow-lg">
              {noticia.title}
            </h1>
            <div className="text-sm text-gray-300 flex flex-wrap gap-4 font-light">
              {noticia.source && <span>{noticia.source}</span>} {/* Exibindo a fonte */}
            </div>
            <div className="text-sm text-gray-300 font-light">
              {noticia.readingTime && <span>Tempo de leitura: {noticia.readingTime}</span>} {/* Exibindo o tempo de leitura */}
            </div>
          </div>
        </motion.div>
      ))}
      {loading && page > 1 && (
        <div className="flex items-center justify-center py-4 bg-black">
          <div className="w-12 h-12 border-4 border-t-transparent border-white rounded-full animate-spin" />
        </div>
      )}
    </div>
  );
}
