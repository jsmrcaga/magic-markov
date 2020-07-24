class Card {
	constructor(name) {
		this.count = 0;
		this.name = name;
		this.counters = {};
		this.probs = [];
	}

	compute_probs() {
		let total = Object.values(this.counters).reduce((s,v) => s + v.count, 0);
		for(let card of Object.values(this.counters)) {
			this.probs.push({
				card: card.card,
				prob: card.count / total
			});
		}

		this.probs = this.probs.sort((a, b) => a.prob - b.prob);
	}

	next() {
		let rand = Math.random();
		let probsum = 0;
		for(let p of this.probs) {
			if(p.prob + probsum > rand) {
				return p.card;
			}
			probsum += p.prob;
		}
		return null;
	}
}

class Counter {
	constructor({ card, count=0 }) {
		this.card = card;
		this.count = count;
	}
}

function* MarkovDeck(count, card, cards) {
	// First card is requested card
	currentCard = cards[card];
	for(let i = 0; i < count; i++) {
		yield currentCard;
		// Currentcaard.next() chooses the next card based on markov chain
		let next_card = currentCard.next(); 
		currentCard = cards[next_card];
	}
}

function compute(decks=[]) {
	let cards = {};
	for(let deck of decks) {
		// Create cards
		for(let card of deck) {
			if(!cards[card]) {
				cards[card] = new Card(card);
			}
		}

		for(let card of deck) {
			for(let subcard of deck) {
				// Should count itself (allows for having multiple of the same card)
				if(cards[card].counters[subcard]) {
					cards[card].counters[subcard].count++;
				} else {
					cards[card].counters[subcard] = new Counter({ card: subcard });
				}
			}
		}
	}

	Object.values(cards).forEach(card => card.compute_probs());
	return cards;
}


module.exports = {
	compute,
	MarkovDeck
};
