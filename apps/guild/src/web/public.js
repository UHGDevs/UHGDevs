const os = require('os');
const express = require('express');
const app = express();

app.get('/', function(req, res) {
       //res.send(os.hostname() +': Ahoj');
       const ipAddress = req.socket.remoteAddress;
       res.send(ipAddress);
});

app.listen(7854, function() {
    console.log('Web application is listening on port 7854');
});

module.exports = async () => {

}


