import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

function Noticia({ modoNoturno }) {
  const [noticia, setNoticia] = useState(null);
  const { id } = useParams();

  useEffect(() => {
    fetch(`http://localhost:5000/noticia/${id}`)
      .then((res) => res.json())
      .then((data) => setNoticia(data));
  }, [id]);

  return (
    <div
      style={{
        backgroundColor: modoNoturno ? "#333" : "#f8f9fa",
        color: modoNoturno ? "#f8f9fa" : "#333",
        minHeight: "100vh",
        transition: "background-color 0.3s",
        padding: "1rem",
      }}
    >
      {noticia ? (
        <>
          <h1>{noticia.title}</h1>
          <div>{noticia.content}</div>
        </>
      ) : (
        <p>Carregando...</p>
      )}
    </div>
  );
}

export default Noticia;
