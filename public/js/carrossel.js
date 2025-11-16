const carrossel = document.getElementById("carrossel");
const cards = document.querySelectorAll(".card_ca");

let index = 0;
const cardWidth = cards[0].offsetWidth + 16;

document.getElementById("next").onclick = () => {
    if (index < cards.length - 3) {
        index++;
    }else{
        index = 0
    }
    carrossel.style.transform = `translateX(${-cardWidth * index}px)`;
};

document.getElementById("prev").onclick = () => {
    if (index > 0) {
        index--;
    }else{
        index = cards.length - 3
    }
    carrossel.style.transform = `translateX(${-cardWidth * index}px)`;
};
