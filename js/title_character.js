const characters = document.querySelectorAll('.character-content');
let count = 0;

setInterval(() => {
    if(characters[count].classList.contains('active')) {
        characters[count].classList.remove('active');
        if(characters[count] == characters[characters.length - 1]) {
            count = 0;
            characters[count].classList.add('active');
        } else {
            count += 1;
            characters[count].classList.add('active');
        }
    }
}, 3000);