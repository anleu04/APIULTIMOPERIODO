let crearboton = document.getElementById('crearcarta');
let botonponercarta = document.getElementById('ponercarta');
let botonremplazar = document.getElementById('ramplazar');
let botonverificar = document.getElementById('verificar');
let botonbarajear = document.getElementById('Barajerar'); 
let botoninfo = document.getElementById('infor');
let contenedor = document.getElementById('contenedordecaja');
let infodemazo = document.getElementById('mazo');
let Mazos = document.getElementById('Estado');

let Id = ''; 
let usuario = 'Usuario'; 
let Tarjeta = null; 


crearboton.addEventListener('click', () => {
   
    botoninfo.innerHTML = '';
    
    fetch('https://deckofcardsapi.com/api/deck/new/')
        .then(response => response.json())
        .then(data => {
            Id = data.deck_id;
            botoninfo.innerHTML = `Mazo creado. ID: ${Id}`;
            botonponercarta.disabled = false;
            botonremplazar.disabled = false;
            botonverificar.disabled = false;
            botonbarajear.disabled = false; 
            pileInfo.innerHTML = `Montón: ${usuario}`;
        })
        .catch(error => console.error('Error creando el mazo:', error));
});


botonponercarta.addEventListener('click', () => {
    if (Id) {
        fetch(`https://deckofcardsapi.com/api/deck/${Id}/draw/?count=1`)
            .then(response => response.json())
            .then(data => {
                if (data.cards.length > 0) {
                    let card = data.cards[0];
                    let cardElement = document.createElement('div');
                    cardElement.className = 'card';
                    cardElement.style.backgroundImage = `url(${card.image})`;
                    contenedor.appendChild(cardElement);
                    Tarjeta = cardElement; 
                } else {
                    console.error('No quedan cartas en el mazo.');
                }
            })
            .catch(error => console.error('Error dibujando la carta:', error));
    } else {
        console.error('No hay mazo disponible para dibujar cartas.');
    }
});


botonremplazar.addEventListener('click', () => {
    if (Id) {
        fetch(`https://deckofcardsapi.com/api/deck/${Id}/draw/?count=1`)
            .then(response => response.json())
            .then(data => {
                if (data.cards.length > 0) {
                    let card = data.cards[0];
                    fetch(`https://deckofcardsapi.com/api/deck/${Id}/pile/${usuario}/add/?cards=${card.code}`)
                        .then(response => response.json())
                        .then(() => {
                            fetch(`https://deckofcardsapi.com/api/deck/${Id}/pile/${usuario}/draw/?count=1`)
                                .then(response => response.json())
                                .then(data => {
                                    if (data.cards.length > 0) {
                                        let card = data.cards[0];
                                        if (Tarjeta) {
                                            Tarjeta.style.backgroundImage = `url(${card.image})`;
                                            infodemazo.innerHTML = `Carta reemplazada en el montón: ${card.code}`;
                                        } else {
                                            console.error('No hay carta actual para reemplazar.');
                                        }
                                    } else {
                                        console.error('No hay cartas en el montón.');
                                    }
                                })
                                .catch(error => console.error('Error reemplazando la carta en el montón:', error));
                        })
                        .catch(error => console.error('Error añadiendo la carta al montón:', error));
                } else {
                    console.error('No quedan cartas en el mazo para añadir al montón.');
                }
            })
            .catch(error => console.error('Error dibujando la carta para reemplazar:', error));
    } else {
        console.error('No hay mazo disponible para reemplazar cartas en el montón.');
    }
});


botonverificar.addEventListener('click', () => {
    if (Id) {
        fetch(`https://deckofcardsapi.com/api/deck/${Id}/`)
            .then(response => response.json())
            .then(data => {
                let remaining = data.remaining;
                Mazos.innerHTML = `Cartas restantes en el mazo: ${remaining}`;
                if (data.piles && data.piles[usuario]) {
                    let pileCards = data.piles[usuario].cards;
                    Mazos.innerHTML += `<br>Cartas en el montón ${usuario}: ${pileCards.length}`;
                } else {
                    Mazos.innerHTML += `<br>Montón ${usuario} no encontrado.`;
                }
            })
            .catch(error => console.error('Error verificando el estado del mazo:', error));
    } else {
        console.error('No hay mazo disponible para verificar su estado.');
    }
});


botonbarajear.addEventListener('click', () => {
    if (Id) {
       
        fetch(`https://deckofcardsapi.com/api/deck/${Id}/pile/${usuario}/list/`)
            .then(response => response.json())
            .then(data => {
                let cards = data.piles[usuario]?.cards || [];
                if (cards.length > 0) {
                    


                    let cardCodes = cards.map(card => card.code).join(',');
                    fetch(`https://deckofcardsapi.com/api/deck/${Id}/pile/${usuario}/add/?cards=${cardCodes}`)
                        .then(response => response.json())
                        .then(() => {
                            
                            fetch(`https://deckofcardsapi.com/api/deck/${Id}/shuffle/`)
                                .then(response => response.json())
                                .then(() => {
                                    infodemazo.innerHTML = `Montón ${usuario} barajado.`;
                                })
                                .catch(error => console.error('Error barajando el mazo:', error));
                        })
                        .catch(error => console.error('Error añadiendo cartas al mazo:', error));
                } else {
                    console.error('No hay cartas en el montón para barajar.');
                }
            })
            .catch(error => console.error('Error listando las cartas en el montón:', error));
    } else {
        console.error('No hay mazo disponible para barajar.');
    }
});
