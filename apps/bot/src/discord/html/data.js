const fs = require('fs');
module.exports = {
  test_index: fs.readFileSync(`discord/html/test/index.html`, 'utf8'),
  test_css: fs.readFileSync(`discord/html/test/style.css`, 'utf8'),
  test_backround: 'data:image/jpeg;base64,' + new Buffer.from(fs.readFileSync('discord/html/test/backround.png')).toString('base64')

}
