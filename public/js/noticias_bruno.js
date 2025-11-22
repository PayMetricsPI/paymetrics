function validarImagem(url) {
    return new Promise(resolve => {
        const img = new Image();
        img.src = url;

        img.onload = () => resolve(true);
        img.onerror = () => resolve(false);
    });
}

async function obterNoticias() {
    const res = await fetch("/news/obter");
    const data = await res.json();

    const carrossel = document.getElementById("carrossel");

    for (const news of data) {
        let imgUrl = news.Image;

        if (imgUrl && imgUrl.trim() !== "") {
            const valida = await validarImagem(imgUrl);
            if (!valida) {
                imgUrl = "https://static.vecteezy.com/ti/vetor-gratis/p1/25926904-jornal-plano-icone-noticia-simbolo-logotipo-ilustracao-vetor.jpg";
            }
        } else {
            imgUrl = "https://static.vecteezy.com/ti/vetor-gratis/p1/25926904-jornal-plano-icone-noticia-simbolo-logotipo-ilustracao-vetor.jpg";
        }

        console.log(news)

        carrossel.innerHTML += `
            <div class="card_ca">
                <div class="top">
                    <div class="image_text">
                        <img src="${imgUrl}">
                        <h4>${news.Title}</h4>
                    </div>
                </div>
                <div class="ia_explicacao">
                    <img src="assets/imgs/gemini-color.png">
                    <div class="explicacao">
                        ${news.explicacao}
                    </div>
                </div>
                <div class="publicada_em">
                    Publicada em: ${new Date(news.PublishedAT.replaceAll("\"", "")).toLocaleDateString("pt-BR", {
                        timeZone: "UTC",
                        month: "numeric",
                        year: "numeric",
                        day: "2-digit"
                    })}
                </div>
            </div>
        `;
    }
}
