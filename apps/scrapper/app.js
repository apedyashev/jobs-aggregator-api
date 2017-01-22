const Scrapper = require('./lib');
const mongoose = require('mongoose');
const config = require('./config');

const {mongo} = config;
mongoose.Promise = global.Promise;
mongoose.connect(`mongodb://${mongo.server}:${mongo.port}/${mongo.dbName}`);
console.log('the scrapper');

const scrapper = new Scrapper();
setInterval(() => {
	scrapper.run().then(function() {
		console.log('Scrapping done');
	}).catch(function(err) {
		console.error('Error while scrapping', err);
	});
}, config.importInterval);
