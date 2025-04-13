import React, { useEffect, useState, useRef } from "react";
import { useParams } from "react-router-dom";

function calcularTempoLeitura(texto) {
  const palavras = texto.trim().split(/\s+/).length;
  const minutos = Math.ceil(palavras / 200); // média de 200 palavras por minuto
  return minutos;
}

function Noticia({ modoNoturno }) {
  const [noticia, setNoticia] = useState(null);
  const { id } = useParams();
  const [progresso, setProgresso] = useState(0);
  const contentRef = useRef(null);
  const [lendo, setLendo] = useState(false);

  useEffect(() => {
    fetch(`/api/noticia/${id}`)
      .then((res) => res.json())
      .then((data) => setNoticia(data));
  }, [id]);

  // Scroll progress visual
  useEffect(() => {
    const handleScroll = () => {
      if (!contentRef.current) return;
      const element = contentRef.current;
      const { scrollTop, scrollHeight, clientHeight } = element;
      const progress = (scrollTop / (scrollHeight - clientHeight)) * 100;
      setProgresso(progress);
    };

    const el = contentRef.current;
    if (el) el.addEventListener("scroll", handleScroll);
    return () => el && el.removeEventListener("scroll", handleScroll);
  }, []);

  const handleOuvir = () => {
    if (!noticia) return;
    if (lendo) {
      window.speechSynthesis.cancel();
      setLendo(false);
    } else {
      const utterance = new SpeechSynthesisUtterance(noticia.content.replace(/<[^>]+>/g, ""));
      utterance.lang = "pt-BR";
      utterance.onend = () => setLendo(false);
      window.speechSynthesis.speak(utterance);
      setLendo(true);
    }
  };

  const handleCompartilhar = () => {
    if (navigator.share) {
      navigator.share({
        title: noticia.title,
        text: noticia.title,
        url: window.location.href,
      });
    } else {
      alert("Seu navegador não suporta o recurso de compartilhamento.");
    }
  };

  return (
    <div
      className={`min-h-screen transition-colors duration-300 ${
        modoNoturno ? "bg-zinc-900 text-white" : "bg-white text-zinc-900"
      }`}
    >
      <div className="fixed top-0 left-0 w-full h-1 bg-green-400 z-50" style={{ width: `${progresso}%` }} />
      <div ref={contentRef} className="pt-2 pb-10 px-4 max-w-3xl mx-auto overflow-y-auto h-screen">
        {noticia ? (
          <>
            {noticia.image && (
              <img
                src={noticia.image}
                alt={noticia.title}
                className="w-full h-auto rounded-lg mb-4 object-cover"
              />
            )}

            <h1 className="text-3xl font-bold mb-2">{noticia.title}</h1>

            <div className="flex justify-between items-center text-sm text-zinc-500 dark:text-zinc-400 mb-4">
              <span>
                {new Date(noticia.pubDate).toLocaleDateString("pt-BR", {
                  weekday: "long",
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </span>
              <span>
                {noticia.author} ({noticia.source})
              </span>
            </div>

            <div className="flex items-center gap-4 mb-4">
              <button
                onClick={handleCompartilhar}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition"
              >
                Compartilhar
              </button>

              <button
                onClick={handleOuvir}
                className="px-4 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition"
              >
                {lendo ? "Parar de ouvir" : "Ouvir notícia"}
              </button>

              <span className="ml-auto text-sm italic text-zinc-500 dark:text-zinc-400">
                ⏱ {calcularTempoLeitura(noticia.content)} min de leitura
              </span>
            </div>

            <div
              className="prose dark:prose-invert max-w-none"
              dangerouslySetInnerHTML={{ __html: noticia.content }}
            />
          </>
        ) : (
          <p>Carregando...</p>
        )}
      </div>
    </div>
  );
}

export default Noticia;
