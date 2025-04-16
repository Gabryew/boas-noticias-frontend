import React from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";

const CardNoticia = ({ noticia, salva, toggleSalvarNoticia }) => {
  const navigate = useNavigate();
  const encodedLink = encodeURIComponent(noticia.link);

  const handleClick = () => navigate(`/noticia/${encodedLink}`);

  const handleSalvar = (e) => {
    e.stopPropagation();
    toggleSalvarNoticia(noticia);
  };

  const getClassificacaoEstilo = (tipo) => {
    switch (tipo) {
      case "good":
        return "bg-green-100 text-green-800";
      case "neutral":
        return "bg-yellow-100 text-yellow-800";
      case "bad":
        return "bg-red-100 text-red-800";
      default:
        return "";
    }
  };

  return (
    <motion.div
      className="w-full bg-white dark:bg-zinc-900 rounded-2xl shadow-lg overflow-hidden cursor-pointer hover:shadow-xl transition-shadow"
      whileHover={{ scale: 1.02 }}
      onClick={handleClick}
    >
      {noticia.image && (
        <div
          className="w-full h-48 bg-cover bg-center"
          style={{ backgroundImage: `url(${noticia.image})` }}
        />
      )}
      <div className="p-4">
        <h2 className="text-xl font-semibold mb-2">{noticia.title}</h2>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          {noticia.author} ({noticia.source}) –{" "}
          {new Date(noticia.date).toLocaleDateString()}
        </p>
        <p className="text-sm mt-1">⏱️ {noticia.tempoLeitura}</p>
        <div className="mt-2 flex justify-between items-center">
          <span
            className={`px-2 py-1 rounded-full text-xs font-semibold ${getClassificacaoEstilo(
              noticia.classification
            )}`}
          >
            {noticia.classification === "good"
              ? "Boa"
              : noticia.classification === "neutral"
              ? "Neutra"
              : "Ruim"}
          </span>
          <button
            onClick={handleSalvar}
            className="text-sm text-blue-500 hover:underline"
          >
            {salva ? "Remover" : "Salvar"}
          </button>
        </div>
      </div>
    </motion.div>
  );
};

export default CardNoticia;
