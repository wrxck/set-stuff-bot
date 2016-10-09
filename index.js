var express = require('express')
var app = express()
var bodyParser = require('body-parser')

var request = require('request')
var token = process.env.TOKEN

function sendMessage(chatId, message) {
  var reply = {chat_id: chatId, text: message}
  console.log(reply)
  request.post({url: 'https://api.telegram.org/bot' + token + '/sendMessage', form: reply})
}

app.use(bodyParser.json())

app.post('/', function (req, res) {
  try {
    if ('text' in req.body['message']) {
      var message = req.body['message']['text'].split(' ')
    } else if ('chat' in req.body['message']) {
      if ('text' in req.body['message']['chat']) {
        var message = req.body['message']['chat']['text'].split(' ')
      }
    } else {
      var message = [undefined]
    }
  } catch (err) {
    console.log('Invalid data')
    var message = [undefined]
  }

  switch (message[0]) {
    case '/start':
    case '/help':
      sendMessage(req.body['message']['chat']['id'], 'Hi, I\'m Set Stuff Bot.')
      break;
  }

  res.sendStatus(200)
})

app.listen(process.env.PORT || 3000)
