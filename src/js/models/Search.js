import axios from 'axios';

export default class Search {
	constructor(query) {
		this.query = query;
	}

	async getResults() {
		const key =	'504383b9ca23d70cfe8ae7593c5d3897';
		const proxy = 'https://cors-anywhere.herokuapp.com/';
		try {
			const res = await axios(`${proxy}http://food2fork.com/api/search?key=${key}&q=${this.query}`);
			this.result = res.data.recipes;
		} catch (error) {
			alert(error);
		}
	}
}