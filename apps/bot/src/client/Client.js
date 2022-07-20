
const { Collection } = require('discord.js');
const fs = require('fs');
const { MongoClient } = require("mongodb");

const Functions = require('../utils/Functions.js')

class Client extends Functions {
    constructor(options) {
        super()


        this.discord = {}

        this.minecraft = {}

        this.time = {}

        this.cache = {}

        

    }
}

module.exports = Client