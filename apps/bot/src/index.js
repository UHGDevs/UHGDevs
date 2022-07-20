
const dotenv = require('dotenv');
dotenv.config();

const client = require('./client/Client');

const uhg = new client({})
console.log(uhg)
