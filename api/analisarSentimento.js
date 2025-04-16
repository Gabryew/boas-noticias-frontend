export async function analisarSentimento(texto) {
    try {
      const response = await fetch("https://api-inference.huggingface.co/models/pierreguillou/bert-base-cased-pt-sentiment", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.HUGGINGFACE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ inputs: texto }),
      });
  
      const resultado = await response.json();
  
      if (!Array.isArray(resultado) || resultado.length === 0) {
        console.error("Erro no retorno da API Hugging Face:", resultado);
        return "neutra";
      }
  
      const label = resultado[0].label;
  
      if (label === "POS") return "boa";
      if (label === "NEG") return "ruim";
      return "neutra";
  
    } catch (erro) {
      console.error("Erro ao classificar sentimento:", erro);
      return "neutra";
    }
  }
  