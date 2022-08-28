
const MongoDB = require('./MongoDB');

const itemGenerator = require('../util/generators/itemGenerator');
const networthGenerator = require('../util/generators/networthGenerator');

const axios = require('axios');
const helper = require('../data/helper.js')

const fs = require('fs');
const path = require('path');

class Nw extends MongoDB {
  constructor(options = {}) {
    super(options);
    this.prices = JSON.parse(fs.readFileSync(path.resolve(__dirname, '../data/prices.json'), 'utf8'))

    setInterval(this.reload.bind(this), 1800000);
  }

  async reload() {
    await this.updateBazaar()
    await this.updateAuctions()
    await this.generatePrices()
  }

  async generatePrices() {
    let prices = {};
    for (const item of await this.mGet('maro', 'auctions', {})) {
      prices[item.id.toLowerCase()] = parseInt(item.auction.price);
    }
    for (const product of await this.mGet('maro', 'bazaar', {})) {
      prices[product.id.toLowerCase()] = parseInt(product.buyPrice);
    }
    this.prices = prices
    fs.writeFile(path.resolve(__dirname, '../data/prices.json'), JSON.stringify(prices, null, 4), 'utf8', data =>{})
  }


  async getNetworth(profile) {
    if (!this.prices) return 'Bot není načtený'
    try {
      const items = await itemGenerator.getItems(profile, this.prices);
    
      if (items.no_inventory) return 'This player has their inventory API disabled.'
    
      const data = await networthGenerator.getNetworth(items, profile);
      return data
    } catch (e) {
      return 'An internal server error occurred.'
    }
  }

  async updateAuctions () {
    let auctions = {}
    let pages = 2
    for (let i = 0; i <= pages; i++) {
      const auctionPage = await axios(`https://api.hypixel.net/skyblock/auctions?page=${i}`).then( n=> n.data)
      if (!auctionPage.success) continue;
  
      pages = auctionPage.totalPages - 1;
      auctionPage.auctions.filter(a => a.bin).forEach(async auction => {
        const item = await helper.decodeNBT(auction.item_bytes);
  
        const ExtraAttributes = item.tag.value.ExtraAttributes.value;
        const { id, name } = helper.getAttributes(ExtraAttributes, auction.item_name);
        const format = {
          id: id.toUpperCase(),
          name: helper.capitalize(name),
          price: auction.starting_bid,
          seller: auction.auctioneer,
          ending: auction.end,
          count: item.Count.value
        };
  
        Object.keys(auctions).includes(id) ? auctions[id].push(format) : (auctions[id] = [format]);
      });
    }
  
    Object.keys(auctions).forEach(async item => {
      const sales = auctions[item].map(i => ({ price: i.price, count: i.count }));
  
      const lowest = Math.min(...sales.map(i => i.price));
      const auction = auctions[item].filter(i => i.price === lowest)[0];
      await this.mUpdate('maro', 'auctions', { id: item.toUpperCase() }, { sales: sales, auction: auction })
    });
  
  }

  async updateBazaar() {
    let bazaarProducts = {};
  
    const response = await axios('https://api.hypixel.net/skyblock/bazaar');
    const products = response.data.products
  
    for (const item of Object.keys(products)) {
      const product = products[item].quick_status;
      bazaarProducts[item] = {
        id: item.toUpperCase(),
        name: helper.capitalize(item),
        buyPrice: product.buyPrice,
        buyVolume: product.buyVolume,
        buyOrders: product.buyOrders,
        sellPrice: product.sellPrice,
        sellVolume: product.sellVolume,
        sellOrders: product.sellOrders
      };
    }
  
    Object.keys(bazaarProducts).forEach(async item => {
      const product = bazaarProducts[item];
      await this.mUpdate('maro', 'bazaar', {id:item}, product)
    });
  }




}

module.exports = Nw;
