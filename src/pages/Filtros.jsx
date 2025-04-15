import { useState } from "react";
import { useNavigate, Link, useLocation } from "react-router-dom";

export default function Filtros({ onFilterChange }) {
  const [selectedSources, setSelectedSources] = useState([]);
  const [selectedClassifications, setSelectedClassifications] = useState([]);
  const navigate = useNavigate();
  const location = useLocation();

  const sources = [
    "G1",
    "BBC",
    "Catraca Livre",
    "Agência Brasil",
    "CNN Brasil",
  ];

  const classifications = ["good", "neutral", "bad"];

  const handleSourceChange = (source) => {
    setSelectedSources((prev) =>
      prev.includes(source) ? prev.filter((s) => s !== source) : [...prev, source]
    );
  };

  const handleClassificationChange = (classification) => {
    setSelectedClassifications((prev) =>
      prev.includes(classification) ? prev.filter((c) => c !== classification) : [...prev, classification]
    );
  };

  const applyFilters = () => {
    onFilterChange(selectedSources, selectedClassifications);
    navigate("/");
  };

  return (
    <div className="bg-black text-white min-h-screen">
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
          <Link
            to="/filtros"
            className="hover:underline text-gray-400"
          >
            Filtros
          </Link>
        </div>
      </div>

      <div className="p-4">
        <h1 className="text-2xl font-bold mb-4">Filtros</h1>
        <div className="mb-4">
          <h2 className="text-xl font-semibold mb-2">Fontes</h2>
          {sources.map((source) => (
            <label key={source} className="inline-flex items-center mr-2">
              <input
                type="checkbox"
                checked={selectedSources.includes(source)}
                onChange={() => handleSourceChange(source)}
                className="mr-1"
              />
              {source}
            </label>
          ))}
        </div>
        <div className="mb-4">
          <h2 className="text-xl font-semibold mb-2">Classificação</h2>
          {classifications.map((classification) => (
            <label key={classification} className="inline-flex items-center mr-2">
              <input
                type="checkbox"
                checked={selectedClassifications.includes(classification)}
                onChange={() => handleClassificationChange(classification)}
                className="mr-1"
              />
              {classification === "good" ? "Boas" : classification === "neutral" ? "Neutras" : "Ruins"}
            </label>
          ))}
        </div>
        <button
          onClick={applyFilters}
          className="bg-blue-500 text-white px-4 py-2 rounded"
        >
          Aplicar Filtros
        </button>
      </div>
    </div>
  );
}
