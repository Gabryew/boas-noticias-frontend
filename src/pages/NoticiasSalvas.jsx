import { useEffect, useState } from "react";
import { useNavigate, Link, useLocation } from "react-router-dom";

export default function NoticiasSalvas() {
  const [salvas, setSalvas] = useState([]);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const noticiasSalvas = JSON.parse(localStorage.getItem("noticiasSalvas")) || [];
    setSalvas(noticiasSalvas);
  }, []);

  const handleUnsave = (index) => {
    const updatedSalvas = salvas.filter((_, i) => i !== index);
    setSalvas(updatedSalvas);
    localStorage.setItem("noticiasSalvas", JSON.stringify(updatedSalvas));
  };

  return (
    <div className="w-screen h-screen flex flex-col overflow-y-scroll bg-black text-white">
      {/* Menu superior esquerdo */}
      <div className="flex justify-between items-center px-4 py-3 bg-black/80 sticky top-0 z-50 backdrop-blur">
        <div className="flex space-x-6">
          <Link
            to="/"
            className={`flex items-center gap-2 hover:underline ${location.pathname === "/" ? "text-white" : "text-gray-400"}`}
          >
            <i className="bi bi-house-fill"></i>
            <span>Início</span>
          </Link>
          <Link
            to="/noticias-salvas"
            className={`flex items-center gap-2 hover:underline ${location.pathname === "/noticias-salvas" ? "text-white" : "text-gray-400"}`}
          >
            <i className="bi bi-bookmarks-fill"></i>
            <span>Salvas</span>
          </Link>
        </div>
      </div>

      {salvas.length === 0 ? (
        <div className="flex items-center justify-center h-screen bg-black text-white">
          <p className="text-lg">Você ainda não salvou nenhuma notícia.</p>
        </div>
      ) : (
        <div className="p-6 flex-1 overflow-y-auto">
          <h1 className="text-3xl font-bold mb-4">Notícias Salvas</h1>
          {salvas.map((noticia, index) => (
            <div
              key={index}
              className="mb-6 relative cursor-pointer"
              onClick={() => navigate(`/noticia/${encodeURIComponent(noticia.link)}`)}
            >
              <div
                className="h-40 bg-cover bg-center rounded-xl mb-2"
                style={{ backgroundImage: `url(${noticia.image || "default-image.jpg"})` }}
              />
              <h2 className="text-xl font-semibold">{noticia.title}</h2>
              <div className="text-sm text-gray-300">
                <span>{noticia.source}</span>
                {noticia.readingTime && <span> - Tempo de leitura: {noticia.readingTime}</span>}
              </div>
              <i
                className="bi bi-bookmark-heart-fill absolute top-2 right-2 text-red-500 text-2xl"
                onClick={(e) => {
                  e.stopPropagation();
                  handleUnsave(index);
                }}
              ></i>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}