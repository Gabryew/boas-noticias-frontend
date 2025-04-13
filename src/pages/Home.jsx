import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSwipeable } from "react-swipeable";
import { motion, AnimatePresence } from "framer-motion";
import ClipLoader from "react-spinners/ClipLoader";

function Home({ modoNoturno }) {
  const [noticias, setNoticias] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [noticiaAtual, setNoticiaAtual] = useState(0);
  const [filtro, setFiltro] = useState("all");
  const navigate = useNavigate();

  useEffect(() => {
    fetch("https://boas-noticias-frontend.vercel.app/api/boas-noticias")
      .then((res) => res.json())
      .then((data) => {
        setNoticias(data || []);
        setCarregando(false);
      })
      .catch((error) => {
        console.error("Erro ao buscar notícias:", error);
        setCarregando(false);
      });
  }, []);

  const filtrarNoticias = () => {
    if (filtro === "all") return noticias;
    return noticias.filter((n) => n.classification === filtro);
  };

  const noticiasFiltradas = filtrarNoticias();

  const handleSwipe = (direction) => {
    if (direction === "up" && noticiaAtual < noticiasFiltradas.length - 1) {
      setNoticiaAtual(noticiaAtual + 1);
    } else if (direction === "down" && noticiaAtual > 0) {
      setNoticiaAtual(noticiaAtual - 1);
    }
  };

  const swipeHandlers = useSwipeable({
    onSwipedUp: () => handleSwipe("up"),
    onSwipedDown: () => handleSwipe("down"),
    trackMouse: true,
  });

  const corBotao = modoNoturno ? "bg-zinc-800 text-white" : "bg-zinc-200 text-zinc-900";

  return (
    <div
      {...swipeHandlers}
      className={`flex flex-col items-center min-h-screen transition-colors duration-300 px-4 py-8 ${
        modoNoturno ? "bg-zinc-900 text-white" : "bg-zinc-100 text-zinc-900"
      }`}
    >
      {/* Filtro */}
      <div className="flex gap-2 mb-6">
        {["all", "good", "neutral", "bad"].map((tipo) => (
          <button
            key={tipo}
            onClick={() => {
              setFiltro(tipo);
              setNoticiaAtual(0);
            }}
            className={`px-4 py-2 rounded-full text-sm font-medium border ${
              filtro === tipo
                ? "bg-blue-500 text-white border-blue-500"
                : "border-zinc-400 dark:border-zinc-600"
            } ${corBotao}`}
          >
            {tipo === "all"
              ? "Todas"
              : tipo === "good"
              ? "Boas"
              : tipo === "neutral"
              ? "Neutras"
              : "Ruins"}
          </button>
        ))}
      </div>

      {/* Loader / Erro */}
      {carregando ? (
        <ClipLoader color={modoNoturno ? "#f8f9fa" : "#333"} size={50} />
      ) : noticiasFiltradas.length === 0 ? (
        <p>Nenhuma notícia encontrada.</p>
      ) : (
        <>
          {/* Notícia atual com animação */}
          <div className="w-full max-w-2xl flex-1 flex justify-center items-center relative">
            <AnimatePresence mode="wait">
              <motion.div
                key={noticiaAtual}
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -50 }}
                transition={{ duration: 0.4 }}
                onClick={() => navigate(`/noticia/${noticiasFiltradas[noticiaAtual].id}`)}
                className="w-full p-4 cursor-pointer flex flex-col justify-between bg-white dark:bg-zinc-800 rounded-xl shadow-lg"
              >
                {/* Classificação */}
                {noticiasFiltradas[noticiaAtual].classification === "good" && (
                  <div className="bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300 p-2 rounded-md text-center font-bold mb-2">
                    Boa notícia! 🌞
                  </div>
                )}

                {/* Imagem */}
                {noticiasFiltradas[noticiaAtual].image && (
                  <img
                    src={noticiasFiltradas[noticiaAtual].image}
                    alt={noticiasFiltradas[noticiaAtual].title}
                    className="w-full max-h-[300px] object-cover rounded-lg mb-4"
                  />
                )}

                {/* Texto */}
                <div className="flex flex-col gap-2 px-2">
                  <h2 className="text-2xl font-semibold">
                    {noticiasFiltradas[noticiaAtual].title}
                  </h2>
                  <p className="text-sm text-zinc-500 dark:text-zinc-400">
                    {new Date(noticiasFiltradas[noticiaAtual].pubDate).toLocaleDateString("pt-BR", {
                      weekday: "long",
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </p>
                  <p className="text-sm italic">
                    {noticiasFiltradas[noticiaAtual].author} ({noticiasFiltradas[noticiaAtual].source})
                  </p>
                </div>
              </motion.div>
            </AnimatePresence>

            {/* Botões de navegação */}
            <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 flex gap-4">
              <button
                onClick={() => handleSwipe("down")}
                disabled={noticiaAtual === 0}
                className="bg-zinc-300 dark:bg-zinc-700 p-2 rounded-full text-xl disabled:opacity-30"
              >
                ⬇️
              </button>
              <button
                onClick={() => handleSwipe("up")}
                disabled={noticiaAtual === noticiasFiltradas.length - 1}
                className="bg-zinc-300 dark:bg-zinc-700 p-2 rounded-full text-xl disabled:opacity-30"
              >
                ⬆️
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default Home;
