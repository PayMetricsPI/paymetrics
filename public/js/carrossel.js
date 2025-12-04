const carrossel = document.getElementById("carrossel");

let index = 0;

document.getElementById("next").onclick = () => {
    const cards = document.querySelectorAll(".card_ca");
    const cardWidth = cards[0].offsetWidth + 16;
    if (index < cards.length - 2) {
        index++;
    }else{
        index = 0
    }
    carrossel.style.transform = `translateX(${-cardWidth * index}px)`;
};

document.getElementById("prev").onclick = () => {
    const cards = document.querySelectorAll(".card_ca");
    const cardWidth = cards[0].offsetWidth + 16;
    if (index > 0) {
        index--;
    }else{
        index = cards.length - 2
    }
    carrossel.style.transform = `translateX(${-cardWidth * index}px)`;
};
