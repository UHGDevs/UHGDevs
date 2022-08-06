const fs = require('fs');
module.exports = {
  test_index: fs.readFileSync(`src/discord/html/test/index.html`, 'utf8'),
  test_css: fs.readFileSync(`src/discord/html/test/style.css`, 'utf8'),
  test_backround: 'data:image/jpeg;base64,' + new Buffer.from(fs.readFileSync('src/discord/html/test/backround.png')).toString('base64')

}
