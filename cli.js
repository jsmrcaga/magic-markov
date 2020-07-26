#!/usr/bin/env node
const Process = require('child_process')
const argumentate = require('argumentate');
const fs = require('fs');
const { get_decks, create_deck, format } = require('./lib');

// Declare CLI options
const { options, variables } = argumentate(process.argv.slice(2), {
	f: 'file',
	d: 'deck',
	s: 'card',
	c: 'count',
	o: 'output',
	n: 'iterations',
	i: 'ignore',
	g: 'ignore-file',
	p: 'preview',
	m: 'format',
	r: 'rounds'
});

// Get deck ids
let deck_ids = [];
if(options.file) {
	// read file for decks
	let file = fs.readFileSync(options.file).toString('utf8').split('\n').filter(e => e && !/^#/.test(e.trim())).map(e => e.trim());
	deck_ids = file;
}

// Check that we did not already find a file
if(options.deck && !deck_ids.length) {
	if(Array.isArray(options.deck)) {
		deck_ids = options.deck;
	} else {
		deck_ids = [options.deck];
	}
}

// Default count // iterations
options.count = +options.count || 60;
options.iterations = +options.iterations || 1;
options.ignore = options.ignore || [];
options.ignore = options.ignore.map(i => i.toLowerCase());

// Get ignore file if needed
if(options['ignore-file']) {
	let file = fs.readFileSync(options['ignore-file']).toString('utf8').split('\n').filter(e => e && !/^#/.test(e.trim())).map(e => e.trim());
	options.ignore = file;
}

// Track time
let now = null;

// Dichotomic deck creation/learning curve
const dichotomic = (iterations=1, decks) => {
	console.log('\tCreating decks for', iterations, 'iterations');
	if(iterations === 1) {
		let deck = create_deck(decks, options.count, options.card);
		if(options.rounds) {
			return deck;
		}

		let formatted = format(deck, options.format || 'plain');
		
		let delta = (Date.now() - now) / 1000;
		console.log('Finished in', delta, 'seconds');
	
		// Open preview
		if(options.preview) {
			console.log('------------------\n\n');
			console.log(formatted);
			console.log('\n\n------------------');
			// Mac os
			Process.exec('open https://www.mtggoldfish.com/decks/new#paper');
		}

		// Save output
		if(options.output) {
			fs.writeFileSync(options.output, formatted);
			return console.log(`Deck saved to ${options.output}`);
		}

		if(!options.preview){
			// If options preview was enabled we already logged to conosle
			return console.log(formatted);
		}
	}

	if(options.plot) {
		iterations = +options.plot;
	}

	let new_decks = [];
	for(let i = 0; i < iterations; i++) {
		// No starting card to not bias the probs
		let new_deck = create_deck(decks, options.count);
		new_decks.push(new_deck);
	}

	if(options.plot) {
		let cards = {};
		for(let deck of new_decks) {
			Object.values(deck.cards).forEach(card => {
				if(!cards[card.name]) {
					cards[card.name] = card.count;
				} else {
					cards[card.name] += card.count;
				}
			});
		}
		console.log('---------- FREQUENCIES --------\n\n');
		console.log(Object.entries(cards).map(([k, v]) => `${v}\t${k}`).join('\n'));
		console.log('\n\n------------------');
		return;
	}

	return dichotomic(Math.floor(iterations/2) || 1, new_decks);
};

// Launch
console.log('Ignoring', options.ignore);
console.log('Getting decks from mtg goldfish...');
get_decks(deck_ids).then(decks => {
	console.log('MTGGoldifsh parsed', decks.length, 'decks');
	decks = decks.map(deck => deck.filter(card => !options.ignore.includes(card.toLowerCase())));
	now = Date.now();

	if(options.rounds) {
		let new_decks = [];
		let cards = {};
		for(let i = 0; i < +options.rounds; i++) {
			console.log('ROUND', i);
			new_decks.push(dichotomic(options.iterations, decks));
		}

		new_decks.forEach(deck => {
			deck.forEach(card => {
				if(!cards[card]) {
					cards[card] = 1;
				} else {
					cards[card]++;
				}
			});
		});

		return console.log(Object.entries(cards).map(([k, v]) => `${v}\t${k}`).join('\n'));
	}
	return dichotomic(options.iterations, decks);
});

