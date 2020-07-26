const get_deck = require('./utils/mtg-goldfish');
const { compute, MarkovDeck } = require('./markov/magic');

function get_decks(ids) {
	let deck_promises = ids.map(id => get_deck(id));
	return Promise.all(deck_promises);
}

function create_deck(decks, count=60, starting_card=null) {
	// Choose random card from provided cards
	if(!starting_card) {
		let rdeck = decks[Math.floor(Math.random() * decks.length)];
		starting_card = rdeck[Math.floor(Math.random() * rdeck.length)];
	}

	// Compute probabilities etc
	computed = compute(decks);
	let new_deck = MarkovDeck(count, starting_card, computed);
	let deck = [...new_deck].map(c => c.name);
	deck.cards = computed;
	return deck;
}

const FORMATS = {
	arena: ({ deck='', sideboard='', companion='' }) => {
		return `Companion\n${companion}\n\nDeck\n${deck}\n\nSideboard\n${sideboard}`;
	},
	plain: ({ deck='', sideboard='', companion='' }) => {
		return `${deck}\n\n${sideboard}\n\n${companion}`;
	}
};

function format(deck, format_mode='plain') {
	let my_deck = {};
	for(let card of deck) {
		if(my_deck[card] !== undefined) {
			my_deck[card]++;
		} else {
			my_deck[card] = 1;
		}
	}
	let deck_str = Object.entries(my_deck).map(([k, v]) => `${v} ${k}`).join('\n');
	
	if(!(format_mode in FORMATS)) {
		throw new Error(`Unknown format ${format_mode}`);
	}

	return FORMATS[format_mode]({ deck: deck_str });
}

module.exports = {
	get_decks,
	create_deck,
	format
};
