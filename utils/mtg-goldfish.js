const fishingrod = require('fishingrod');

function get_deck(id) {
	return fishingrod.fish({
		host: 'www.mtggoldfish.com',
		path: `/deck/arena_download/${id}`
	}).then(({ response:text }) => {
		const cards_regex = /<textarea class\=["']copy-paste-box["'][^>]{0,}>(?<deck>[^>]+)<\/textarea>/gi;
		let exec = cards_regex.exec(text);
		if(!exec) {
			throw new Error(`Could not find deck for ${id} (regex does not match)`);
		}

		const { groups } = exec;
		if(!groups || !groups.deck) {
			throw new Error(`Could not find deck for ${id} (no matching group)`);
		}

		let { deck } = groups;
		deck = deck.replace(/^Deck/im, '').replace(/^Companion/im, '').replace(/^Sideboard/im, '');
		return deck.split('\n').filter(e => e).map(card => {
			let count_reg = /^(?<count>\d+)/g;
			let { count } = count_reg.exec(card).groups;
			card = decodeURIComponent(card.replace(count, '').trim()).replace('&#39;', '\'');
			return new Array(+count).fill(card);
		}).flat(2);
	});
}

module.exports = get_deck;
