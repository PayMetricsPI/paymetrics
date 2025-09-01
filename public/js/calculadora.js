function calculadora(){

    nome = ipt_nome.value;
    valor = ipt_valorInserido.value

    calculo = valor * 0.11;
  // formatar moeda 
    var moeda = calculo.toLocaleString('pt-br',{style: 'currency', currency: 'BRL'});
    
    outputCalculadora.innerHTML = `Olá, ${nome}.<br> Com nosso monitoramento sua empresa evita um prejuízo de ${moeda} anual.  `
}