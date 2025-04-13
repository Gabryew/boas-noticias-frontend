import React from "react";

const NewsCard = ({ news }) => {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4 w-3/4 mx-auto my-8">
      <img src={news.image} alt="Imagem da notícia" className="rounded-lg h-48 w-full object-cover mb-4" />
      <h2 className="text-xl font-semibold text-gray-900 dark:text-white">{news.title}</h2>
      <p className="text-gray-600 dark:text-gray-300">{news.classification}</p>
      <p className="text-gray-500 dark:text-gray-400">{new Date(news.pubDate).toLocaleDateString()}</p>
      <p className="text-gray-500 dark:text-gray-400">{news.author} ({news.source})</p>
    </div>
  );
};

export default NewsCard;
