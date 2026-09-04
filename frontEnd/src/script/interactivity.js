const INPUT = document.getElementById('CEP'); // Constante da caixa de txt
const BUTTON = document.getElementById('Botao'); // Constante do botao

INPUT.addEventListener('input', (e) => { 
  let value = e.target.value.replace(/\D/g, ''); // Tira o que não for número
  
  if (value.length > 8) { // Limita o CEP em 8 números
    value = value.slice(0, 8);
  }

  if (value.length > 5) { // Se o usuário digitar + de 5 números, add a máscara no cep
    INPUT.value = value.slice(0, 5) + "-" + value.slice(5, 8);
  } else {
    INPUT.value = value; // Se tiver menos de 5 números, deixa apagar de boas
  }
});
