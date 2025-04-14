import { useEffect, useState } from "react";
import axios from "axios";

export default function Home() {
  const [noticias, setNoticias] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchNoticias() {
      try {
        const response = await axios.get(
          "https://boas-noticias-frontend.vercel.app/api/boas-noticias"
        );
        setNoticias(response.data);
      } catch (error) {
        console.error("Erro ao buscar notícias:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchNoticias();
  }, []);

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-black text-white text-xl">
        Carregando notícias...
      </div>
    );
  }

  return (
    <div className="w-screen h-screen overflow-y-scroll snap-y snap-mandatory">
      {noticias.map((noticia, index) => (
        <div
          key={index}
          className="w-screen h-screen snap-start flex flex-col justify-end relative text-white"
          style={{
            backgroundImage: `url(${noticia.imagem || ""})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            backgroundRepeat: "no-repeat",
          }}
        >
          <div className="bg-black/60 p-6 backdrop-blur-sm w-full">
            <h1 className="text-2xl font-bold mb-2">{noticia.titulo}</h1>
            <p className="text-sm">
              {noticia.autor} ({noticia.veiculo}) •{" "}
              {new Date(noticia.data).toLocaleDateString()}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}
