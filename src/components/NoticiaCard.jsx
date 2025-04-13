// src/components/NoticiaCard.jsx
const NoticiaCard = ({ noticia }) => {
    return (
      <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-md p-4 mb-4 max-w-xl mx-auto">
        {noticia.image && (
          <img
            src={noticia.image}
            alt={noticia.title}
            className="w-full h-60 object-cover rounded-xl mb-4"
          />
        )}
        <h2 className="text-xl font-bold mb-2 text-zinc-800 dark:text-zinc-100">{noticia.title}</h2>
        <p className="text-sm text-zinc-600 dark:text-zinc-300 mb-2">{noticia.summary}</p>
        <p className="text-xs text-zinc-500 dark:text-zinc-400 italic mb-2">
          {new Date(noticia.pubDate).toLocaleString()}
        </p>
        <a
          href={noticia.link}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-600 dark:text-blue-400 hover:underline"
        >
          Leia mais
        </a>
      </div>
    );
  };
  
  export default NoticiaCard;
  