import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSwipeable } from "react-swipeable";
import ClipLoader from "react-spinners/ClipLoader";

function Home({ modoNoturno }) {
  const [noticias, setNoticias] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [noticiaAtual, setNoticiaAtual] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    fetch("/api/boas-noticias")
      .then((res) => res.json())
      .then((data) => {
        if (data && data.length > 0) {
          setNoticias(data);
        } else {
          setNoticias([]);
        }
        setCarregando(false);
      })
      .catch((error) => {
        console.error("Erro ao buscar notícias:", error);
        setCarregando(false);
      });
  }, []);

  const handleSwipe = (direction) => {
    if (direction === "up" && noticiaAtual < noticias.length - 1) {
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

  return (
    <div
      {...swipeHandlers}
      className={`flex justify-center items-center min-h-screen transition-colors duration-300 overflow-hidden ${
        modoNoturno ? "bg-zinc-900 text-white" : "bg-zinc-100 text-zinc-900"
      }`}
    >
      <button
        className="absolute top-5 right-5 text-2xl bg-transparent border-none"
        style={{ color: modoNoturno ? "#f8f9fa" : "#333" }}
      >
        {modoNoturno ? "🌞" : "🌙"}
      </button>

      {carregando ? (
        <ClipLoader color={modoNoturno ? "#f8f9fa" : "#333"} size={50} />
      ) : noticias.length === 0 ? (
        <p>Nenhuma notícia encontrada.</p>
      ) : (
        <div className="w-full h-full flex justify-center items-center relative">
          <div
            onClick={() => navigate(`/noticia/${noticiaAtual}`)}
            className="w-full h-full p-4 cursor-pointer flex flex-col justify-between bg-white dark:bg-zinc-800 rounded-xl shadow-lg transition-all duration-300"
          >
            {noticias[noticiaAtual].classification === "good" && (
              <div className="bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300 p-2 rounded-md text-center font-bold mb-2">
                Boa notícia! 🌞
              </div>
            )}

            {noticias[noticiaAtual].image && (
              <img
                src={noticias[noticiaAtual].image}
                alt={noticias[noticiaAtual].title}
                className="w-full max-h-[300px] object-cover rounded-lg mb-4"
              />
            )}

            <div className="flex flex-col gap-2 px-2">
              <h2 className="text-2xl font-semibold">{noticias[noticiaAtual].title}</h2>
              <p className="text-sm text-zinc-500 dark:text-zinc-400">
                {new Date(noticias[noticiaAtual].pubDate).toLocaleDateString("pt-BR", {
                  weekday: "long",
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </p>
              <p className="text-sm italic">
                {noticias[noticiaAtual].author} ({noticias[noticiaAtual].source})
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Home;
