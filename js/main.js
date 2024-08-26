let createDeckButton = document.getElementById('create-deck');
let drawCardButton = document.getElementById('draw-card');
let replaceCardsButton = document.getElementById('replace-cards');
let checkDeckButton = document.getElementById('check-deck');
let shufflePileButton = document.getElementById('shuffle-pile'); // Nuevo botón
let deckInfo = document.getElementById('deck-info');
let cardContainer = document.getElementById('card-container');
let pileInfo = document.getElementById('pile-info');
let deckStatus = document.getElementById('deck-status');

let deckId = ''; // Almacenaremos el ID del mazo aquí
let pileName = 'myPile'; // Nombre del montón
let currentCardElement = null; // Elemento de la carta actual

// Crear un nuevo mazo
createDeckButton.addEventListener('click', () => {
    // Limpiar el contenedor de cartas antes de crear un nuevo mazo
    cardContainer.innerHTML = '';
    
    fetch('https://deckofcardsapi.com/api/deck/new/')
        .then(response => response.json())
        .then(data => {
            deckId = data.deck_id;
            deckInfo.innerHTML = `Mazo creado. ID: ${deckId}`;
            drawCardButton.disabled = false;
            replaceCardsButton.disabled = false;
            checkDeckButton.disabled = false;
            shufflePileButton.disabled = false; // Habilita el botón de barajar
            pileInfo.innerHTML = `Montón: ${pileName}`;
        })
        .catch(error => console.error('Error creando el mazo:', error));
});

// Dibujar una carta del mazo
drawCardButton.addEventListener('click', () => {
    if (deckId) {
        fetch(`https://deckofcardsapi.com/api/deck/${deckId}/draw/?count=1`)
            .then(response => response.json())
            .then(data => {
                if (data.cards.length > 0) {
                    let card = data.cards[0];
                    let cardElement = document.createElement('div');
                    cardElement.className = 'card';
                    cardElement.style.backgroundImage = `url(${card.image})`;
                    cardContainer.appendChild(cardElement);
                    currentCardElement = cardElement; // Guarda la carta actual para reemplazarla
                } else {
                    console.error('No quedan cartas en el mazo.');
                }
            })
            .catch(error => console.error('Error dibujando la carta:', error));
    } else {
        console.error('No hay mazo disponible para dibujar cartas.');
    }
});

// Reemplazar cartas en el montón
replaceCardsButton.addEventListener('click', () => {
    if (deckId) {
        fetch(`https://deckofcardsapi.com/api/deck/${deckId}/draw/?count=1`)
            .then(response => response.json())
            .then(data => {
                if (data.cards.length > 0) {
                    let card = data.cards[0];
                    fetch(`https://deckofcardsapi.com/api/deck/${deckId}/pile/${pileName}/add/?cards=${card.code}`)
                        .then(response => response.json())
                        .then(() => {
                            fetch(`https://deckofcardsapi.com/api/deck/${deckId}/pile/${pileName}/draw/?count=1`)
                                .then(response => response.json())
                                .then(data => {
                                    if (data.cards.length > 0) {
                                        let card = data.cards[0];
                                        if (currentCardElement) {
                                            // Reemplaza la imagen de la carta en el contenedor
                                            currentCardElement.style.backgroundImage = `url(${card.image})`;
                                            pileInfo.innerHTML = `Carta reemplazada en el montón: ${card.code}`;
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

// Verificar el estado del mazo
checkDeckButton.addEventListener('click', () => {
    if (deckId) {
        fetch(`https://deckofcardsapi.com/api/deck/${deckId}/`)
            .then(response => response.json())
            .then(data => {
                let remaining = data.remaining;
                deckStatus.innerHTML = `Cartas restantes en el mazo: ${remaining}`;
                if (data.piles && data.piles[pileName]) {
                    let pileCards = data.piles[pileName].cards;
                    deckStatus.innerHTML += `<br>Cartas en el montón ${pileName}: ${pileCards.length}`;
                } else {
                    deckStatus.innerHTML += `<br>Montón ${pileName} no encontrado.`;
                }
            })
            .catch(error => console.error('Error verificando el estado del mazo:', error));
    } else {
        console.error('No hay mazo disponible para verificar su estado.');
    }
});

// Barajar el montón
shufflePileButton.addEventListener('click', () => {
    if (deckId) {
        // Primero, listamos las cartas en el montón
        fetch(`https://deckofcardsapi.com/api/deck/${deckId}/pile/${pileName}/list/`)
            .then(response => response.json())
            .then(data => {
                let cards = data.piles[pileName]?.cards || [];
                if (cards.length > 0) {
                    // Añadimos todas las cartas al mazo
                    let cardCodes = cards.map(card => card.code).join(',');
                    fetch(`https://deckofcardsapi.com/api/deck/${deckId}/pile/${pileName}/add/?cards=${cardCodes}`)
                        .then(response => response.json())
                        .then(() => {
                            // Barajamos el mazo
                            fetch(`https://deckofcardsapi.com/api/deck/${deckId}/shuffle/`)
                                .then(response => response.json())
                                .then(() => {
                                    pileInfo.innerHTML = `Montón ${pileName} barajado.`;
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
