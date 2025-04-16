// components/Filtros.jsx
export default function Filtros({ filter, onChange }) {
    return (
      <div className="flex gap-4 text-sm">
        <label className="flex items-center">
          <input
            type="checkbox"
            checked={filter.good}
            onChange={() => onChange("good")}
            className="mr-2"
          />
          Boas Notícias
        </label>
        <label className="flex items-center">
          <input
            type="checkbox"
            checked={filter.neutral}
            onChange={() => onChange("neutral")}
            className="mr-2"
          />
          Neutras
        </label>
        <label className="flex items-center">
          <input
            type="checkbox"
            checked={filter.bad}
            onChange={() => onChange("bad")}
            className="mr-2"
          />
          Ruins
        </label>
      </div>
    );
  }
  