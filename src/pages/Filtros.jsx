import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Filtros({ onFilterChange }) {
  const [selectedSources, setSelectedSources] = useState([]);
  const [selectedClassification, setSelectedClassification] = useState("all");
  const navigate = useNavigate();

  const sources = [
    "G1",
    "BBC",
    "Catraca Livre",
    "Agência Brasil",
    "CNN Brasil",
  ];

  const handleSourceChange = (source) => {
    setSelectedSources((prev) =>
      prev.includes(source) ? prev.filter((s) => s !== source) : [...prev, source]
    );
  };

  const handleClassificationChange = (event) => {
    setSelectedClassification(event.target.value);
  };

  const applyFilters = () => {
    onFilterChange(selectedSources, selectedClassification);
    navigate("/");
  };

  return (
    <div className="p-4 bg-black text-white min-h-screen">
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
        <label className="inline-flex items-center mr-2">
          <input
            type="radio"
            name="classification"
            value="all"
            checked={selectedClassification === "all"}
            onChange={handleClassificationChange}
            className="mr-1"
          />
          Todas
        </label>
        <label className="inline-flex items-center mr-2">
          <input
            type="radio"
            name="classification"
            value="good"
            checked={selectedClassification === "good"}
            onChange={handleClassificationChange}
            className="mr-1"
          />
          Boas
        </label>
        <label className="inline-flex items-center mr-2">
          <input
            type="radio"
            name="classification"
            value="neutral"
            checked={selectedClassification === "neutral"}
            onChange={handleClassificationChange}
            className="mr-1"
          />
          Neutras
        </label>
        <label className="inline-flex items-center mr-2">
          <input
            type="radio"
            name="classification"
            value="bad"
            checked={selectedClassification === "bad"}
            onChange={handleClassificationChange}
            className="mr-1"
          />
          Ruins
        </label>
      </div>
      <button
        onClick={applyFilters}
        className="bg-blue-500 text-white px-4 py-2 rounded"
      >
        Aplicar Filtros
      </button>
    </div>
  );
}
