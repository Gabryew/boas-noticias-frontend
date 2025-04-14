function App() {
  const [modoNoturno, setModoNoturno] = useState(false);

  const alternarModoNoturno = () => {
    setModoNoturno(!modoNoturno);
  };

  return (
    <Router>
      <div
        className={`${modoNoturno ? 'bg-gray-800 text-white' : 'bg-white text-black'} min-h-screen transition-all`}
      >
        <button
          onClick={alternarModoNoturno}
          className="absolute top-4 right-4 text-2xl p-2 bg-transparent border-none"
        >
          {modoNoturno ? "🌞" : "🌙"}
        </button>
        <Routes>
          <Route path="/" element={<Home modoNoturno={modoNoturno} />} />
          <Route path="/noticia/:id" element={<Noticia modoNoturno={modoNoturno} />} />
        </Routes>
      </div>
    </Router>
  );
}
