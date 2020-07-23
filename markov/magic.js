class Card {
	constructor(name) {
		this.count = 0;
		this.name = name;
		this.counters = {};
		this.probs = {};
	}

	compute_probs() {
		let total = Object.values(this.counters).reduce((s,v) => s + v.count, 0);
		for(let card of Object.values(this.counters)) {
			this.probs[card.card] = card.count / total;
		}
	}

	next() {
		
	}
}

class Counter {
	constructor({ card, count=0 }) {
		this.card = card;
		this.count = count;
	}
}

function* Markov(cards) {
	let currentCard = cards[Math.floor(Math.random() * cards.length)];
	yield currentCard.next()
}

function compute({ decks=[], cards={} }) {
	for(let deck of decks) {
		for(let card of deck) {
			if(card.toLowerCase() === 'plains' || card.toLowerCase() === 'swamp') {
				continue;
			}

			if(cards[card]) {
				cards[card].count++;
			} else {
				cards[card] = new Card(card);
			}
		}

		for(let card of deck) {
			if(card.toLowerCase() === 'plains' || card.toLowerCase() === 'swamp') {
				continue;
			}

			for(let subcard of deck) {
				if(card.toLowerCase() === 'plains' || card.toLowerCase() === 'swamp') {
					continue;
				}

				if(cards[card].counters[subcard]) {
					cards[card].counters[subcard].count++;
				} else {
					cards[card].counters[subcard] = new Counter({ card: subcard });
				}
			}	
		}
	}

	cards.forEach(card => card.compute_probs());
	return cards;
}

function markov(cards) {

}

module.exports = {
	compute,
	markov
}