import React, { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

function calcularTempoDeLeitura(texto) {
  const palavras = texto.trim().split(/\s+/).length;
  return Math.ceil(palavras / 200); // 200 palavras por minuto
}

function Noticia({ modoNoturno }) {
  const { id } = useParams();
  const [noticia, setNoticia] = useState(null);
  const [tempoDeLeitura, setTempoDeLeitura] = useState(0);
  const [progresso, setProgresso] = useState(0);
  const navigate = useNavigate();
  const containerRef = useRef(null);

  useEffect(() => {
    fetch(`https://boas-noticias-frontend.vercel.app/api/boas-noticias`)
      .then((res) => res.json())
      .then((data) => {
        const encontrada = data.find((n) => n.id === id);
        setNoticia(encontrada);
        if (encontrada?.content) {
          setTempoDeLeitura(calcularTempoDeLeitura(encontrada.content));
        }
      });
  }, [id]);

  useEffect(() => {
    const atualizarProgresso = () => {
      const el = containerRef.current;
      if (!el) return;
      const scrollTop = window.scrollY;
      const scrollHeight = document.body.scrollHeight - window.innerHeight;
      const progressoAtual = (scrollTop / scrollHeight) * 100;
      setProgresso(progressoAtual);
    };

    window.addEventListener("scroll", atualizarProgresso);
    return () => window.removeEventListener("scroll", atualizarProgresso);
  }, []);

  if (!noticia) return <div className="p-6">Carregando notícia...</div>;

  return (
    <div
      ref={containerRef}
      className={`min-h-screen px-4 py-6 transition-colors duration-300 ${
        modoNoturno ? "bg-zinc-900 text-white" : "bg-white text-zinc-900"
      }`}
    >
      {/* Barra de progresso de leitura */}
      <div className="fixed top-0 left-0 w-full h-1 bg-blue-300 z-50">
        <div
          className="h-full bg-blue-600 transition-all"
          style={{ width: `${progresso}%` }}
        />
      </div>

      {/* Botão Voltar */}
      <button
        onClick={() => navigate(-1)}
        className="mb-6 px-4 py-2 bg-zinc-200 dark:bg-zinc-800 rounded-full hover:bg-zinc-300 dark:hover:bg-zinc-700 transition"
      >
        ← Voltar
      </button>

      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="max-w-3xl mx-auto flex flex-col gap-4"
      >
        <h1 className="text-3xl font-bold">{noticia.title}</h1>

        <div className="text-sm text-zinc-500 dark:text-zinc-400 italic">
          {new Date(noticia.pubDate).toLocaleDateString("pt-BR", {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
          })}
          {" • "}
          {noticia.author} ({noticia.source})
        </div>

        {noticia.image && (
          <img
            src={noticia.image}
            alt={noticia.title}
            className="w-full rounded-xl max-h-[400px] object-cover shadow"
          />
        )}

        {/* Tempo de leitura */}
        <div className="text-sm text-blue-600 dark:text-blue-400 mt-2">
          ⏱️ Tempo estimado de leitura: {tempoDeLeitura} minuto
          {tempoDeLeitura > 1 ? "s" : ""}
        </div>

        {/* Conteúdo */}
        <div className="prose dark:prose-invert prose-zinc max-w-none text-lg leading-relaxed">
          {noticia.content}
        </div>

        {/* Ações */}
        <div className="mt-8 flex gap-4">
          <button
            onClick={() => alert("Função de ouvir ainda não implementada")}
            className="px-4 py-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition"
          >
            🔊 Ouvir
          </button>

          <button
            onClick={() => navigator.share?.({ title: noticia.title, url: window.location.href }) || alert("Compartilhamento indisponível")}
            className="px-4 py-2 bg-green-600 text-white rounded-full hover:bg-green-700 transition"
          >
            📤 Compartilhar
          </button>
        </div>
      </motion.div>
    </div>
  );
}

export default Noticia;
