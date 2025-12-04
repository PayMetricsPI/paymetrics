async function chamarRequisicao() {
    // Parâmetro a ser enviado para o backend
    const parametroNome = "Usuário Exemplo";
    const url = `http://localhost:8080/api/calcular?nome=${encodeURIComponent(parametroNome)}`;

    try {
        const resposta = await fetch(url, {
            method: 'GET', // Ou 'POST', 'PUT', etc.
            headers: {
                'Accept': 'text/plain', // Define o tipo de resposta esperado
            }
        });

        if (!resposta.ok) {
            throw new Error(`Erro na requisição: ${resposta.status}`);
        }

        // Se o Java retornar uma String, use text()
        // Se retornar um objeto JSON, use json()
        const dados = await resposta.text(); 
        console.log("Resposta do Java:", dados);
        alert(dados);

    } catch (erro) {
        console.error("Houve um problema ao chamar o endpoint:", erro);
    }
}

// Exemplo de como chamar a função (talvez em um evento de clique de botão)
// chamarMetodoJava();