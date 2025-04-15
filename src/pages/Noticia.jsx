import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

const Noticia = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [noticia, setNoticia] = useState(null);
  const [outrasNoticias, setOutrasNoticias] = useState([]);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [audioProgress, setAudioProgress] = useState(0);
  const [isSaved, setIsSaved] = useState(false);
  const utteranceRef = useRef(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  useEffect(() => {
    fetch(`/api/boas-noticias`)
      .then((res) => res.json())
      .then((data) => {
        const selected = data.find((item) => item.id === id);
        setNoticia(selected);
        setOutrasNoticias(data.filter((item) => item.id !== id).slice(0, 3));
      });
  }, [id]);

  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY;
      const docHeight = document.body.scrollHeight - window.innerHeight;
      const scrolled = (scrollTop / docHeight) * 100;
      document.getElementById('progress-bar').style.width = `${scrolled}%`;
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const toggleSpeech = () => {
    if (!noticia) return;

    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }

    const utterance = new SpeechSynthesisUtterance(noticia.content);
    utterance.onend = () => setIsSpeaking(false);
    utteranceRef.current = utterance;
    setDuration(Math.ceil(noticia.content.split(' ').length / 2.5));
    window.speechSynthesis.speak(utterance);
    setIsSpeaking(true);
  };

  const toggleSave = () => {
    setIsSaved((prev) => !prev);
  };

  const estimatedReadingTime = (text) => {
    const wordsPerMinute = 200;
    const words = text.trim().split(/\s+/).length;
    const time = Math.ceil(words / wordsPerMinute);
    return time;
  };

  if (!noticia) return <div className="text-center mt-10">Carregando...</div>;

  const readingTime = estimatedReadingTime(noticia.content);

  return (
    <div className="p-4 max-w-3xl mx-auto">
      <div id="progress-bar" className="h-1 bg-purple-500 fixed top-0 left-0 z-50" style={{ width: '0%' }}></div>

      <h1 className="text-3xl font-bold mb-2">{noticia.title}</h1>
      <p className="text-sm text-gray-500 mb-1">{noticia.date} - {noticia.author} ({noticia.source})</p>

      <p className="text-sm text-gray-600 flex items-center gap-1 mb-2">
        <i className="bi bi-stopwatch"></i> Tempo de leitura: {readingTime} min
      </p>

      <div className="flex gap-4 mb-6">
        <button
          onClick={() => {
            navigator.clipboard.writeText(window.location.href);
          }}
          className="flex items-center gap-2 px-4 py-2 border rounded-full hover:bg-gray-100 transition"
        >
          <i className="bi bi-share"></i> Compartilhar
        </button>

        <button
          onClick={toggleSave}
          className="flex items-center gap-2 px-4 py-2 border rounded-full hover:bg-gray-100 transition"
        >
          <i className={isSaved ? 'bi bi-bookmark-heart-fill' : 'bi bi-bookmark-heart'}></i>
          {isSaved ? 'Salvo' : 'Salvar'}
        </button>
      </div>

      {noticia.image && (
        <img
          src={noticia.image}
          alt="Imagem da notícia"
          className="w-full h-auto rounded-xl mb-4"
        />
      )}

      <div className="prose max-w-none mb-8" dangerouslySetInnerHTML={{ __html: noticia.content }}></div>

      <div className="flex gap-4 mb-10">
        <button
          onClick={() => navigate('/')}
          className="flex items-center gap-2 px-4 py-2 border rounded-full hover:bg-gray-100 transition"
        >
          <i className="bi bi-arrow-left"></i> Voltar
        </button>

        <a
          href={noticia.link}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 px-4 py-2 border rounded-full hover:bg-gray-100 transition"
        >
          <i className="bi bi-book"></i> Ler no site original
        </a>
      </div>

      <h2 className="text-xl font-semibold mb-4">Outras Notícias</h2>
      <div className="grid gap-4">
        {outrasNoticias.map((item) => (
          <div
            key={item.id}
            className="cursor-pointer hover:opacity-80 transition"
            onClick={() => navigate(`/noticia/${item.id}`)}
          >
            {item.image && (
              <img
                src={item.image}
                alt="Imagem relacionada"
                className="w-full h-48 object-cover rounded"
              />
            )}
            <p className="mt-2 font-medium">{item.title}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Noticia;
