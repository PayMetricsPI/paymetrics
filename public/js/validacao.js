// var textoPreenchido = (nomeVar == '' || emailVar == '' || senhaVar == '' || senhaCVar == '');

//         while (textoPreenchido) {
//             div_mensagemTextoVazio.innerHTML = 'Preencha todos os campos';
//             return(0);
//         }

//         const numeros = /\d/;
//         const letra_maiuscula = /[A-Z]/;
//         const caracteres_especias = /[!@#%&*().;,/]/;

//         // Loop para percorrer as verificacoes do email
//         for (i = 1; i < 4; i++) {
//             //Condicao 1
//             if (i == 1) {
//                 if (!emailVar.endsWith(".com")) {
//                     output_email.innerHTML += `O email deve terminar em .com<br>`
//                     output_email.style.color = 'red';
//                     return;
//                 }

//             }
//             //Condicao 2
//             else if (i == 2) {
//                 if (!emailVar.includes("@")) {
//                     output_email.innerHTML += `O email deve conter @<br>`
//                     output_email.style.color = 'red';
//                     return;
//                 }

//             }
//         }

//         //loop para percorrer as verificacoes da senha
//         for (j = 1; j < 6; j++) {
//             if (j == 1) {
//                 if (!caracteres_especias.test(senhaVar)) {
//                     output_senha.innerHTML += `A senha deve conter no mínimo 1 caracter especial<br>`
//                     output_senha.style.color = `red`
//                 }

//             }

//             else if (j == 2) {
//                 if (senhaVar.length < 8) {
//                     output_senha.innerHTML += `A senha deve conter no mínimo 8 caracteres<br>`
//                     output_senha.style.color = `red`
//                 }

//             }
//             else if (j == 3) {
//                 if (!numeros.test(senhaVar)) {
//                     output_senha.innerHTML += `A senha deve conter no mínimo 1 caracter numérico<br>`
//                     output_senha.style.color = `red`
//                 }

//             }
//             else if (j == 4) {
//                 if (!letra_maiuscula.test(senhaVar)) {
//                     output_senha.innerHTML += `A senha deve conter no mínimo 1 letra maiúscula<br>`
//                     output_senha.style.color = `red`
//                     return;
//                 }
//                 else if (i == 3) {
//                     if (senhaVar != confirmação_senha) {
//                         output_confirmacao.innerHTML += `As senhas devem ser iguais`
//                         output_confirmacao.style.color = 'red';
//                         return;
//                         console.log(`sim`)
//                 }
//         }
//     }
// }