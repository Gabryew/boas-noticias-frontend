import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function NoticiasSalvas() {
  const [salvas, setSalvas] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const noticiasSalvas = JSON.parse(localStorage.getItem("noticiasSalvas")) || [];
    setSalvas(noticiasSalvas);
  }, []);

  if (salvas.length === 0) {
    return (
      <div className="flex items-center justify-center h-screen bg-black text-white">
        <p className="text-lg">Você ainda não salvou nenhuma notícia.</p>
      </div>
    );
  }

  return (
    <div className="w-screen bg-black text-white">
      {/* Menu superior */}
      <div className="flex justify-between items-center px-4 py-3 bg-black/80 sticky top-0 z-50 backdrop-blur">
        <div className="flex gap-4 text-sm font-semibold">
          <Link
            to="/"
            className={`hover:underline ${location.pathname === "/" ? "text-white" : "text-gray-400"}`}
          >
            Últimas Notícias
          </Link>
          <Link
            to="/noticias-salvas"
            className={`hover:underline ${location.pathname === "/noticias-salvas" ? "text-white" : "text-gray-400"}`}
          >
            Notícias Salvas
          </Link>
        </div>
      </div>

      <div className="p-6">
        <h1 className="text-3xl font-bold mb-4">Notícias Salvas</h1>
        {salvas.map((noticia, index) => (
          <div
            key={index}
            className="mb-6 cursor-pointer"
            onClick={() => navigate(`/noticia/${encodeURIComponent(noticia.link)}`)}
          >
            <div
              className="h-40 bg-cover bg-center rounded-xl mb-2"
              style={{ backgroundImage: `url(${noticia.image})` }}
            />
            <h2 className="text-xl font-semibold">{noticia.title}</h2>
            <div className="text-sm text-gray-300">
              <span>{noticia.source}</span>
              {noticia.readingTime && <span> - Tempo de leitura: {noticia.readingTime}</span>}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
