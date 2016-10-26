var express = require('express')
var app = express()
var bodyParser = require('body-parser')

var redis = require('redis')
var client = redis.createClient(process.env.REDIS_URL)

var request = require('request')
var token = process.env.TOKEN

function sendMessage(chat_id, message, msg_reply) {
  var reply = {
    chat_id: chat_id,
    text: message
  }

  if (msg_reply) {
    reply.reply_to_message_id = msg_reply
  }
  request.post({url: 'https://api.telegram.org/bot' + token + '/sendMessage', form: reply}, function (err, resp, body) {
    console.log(body)
  })
}

app.use(bodyParser.json())

app.post('/', function (req, res) {
  try {
    if ('text' in req.body['message']) {
      var message = {
        id: req.body['message']['message_id'],
        text: req.body['message']['text'].split(' ')
      }
    } else if ('chat' in req.body['message']) {
      if ('text' in req.body['message']['chat']) {
        var message = {
          id: req.body['message']['message_id'],
          text: req.body['message']['chat']['text'].split(' ')
        }
      } else {
        var message = {'text': [undefined]}
      }
    } else {
      var message = {'text': [undefined]}
    }
  } catch (err) {
    console.log('Invalid data')
    var message = {'text': [undefined]}
  }

  switch (message['text'][0]) {
    case '/start':
    case '/help':
      sendMessage(req.body['message']['chat']['id'], 'Hi, I\'m Set Stuff Bot.')
      break;
    case '/set':
      client.hset([req.body['message']['chat']['id'], message['text'][1], message['text'].slice(2).join(' ')], function (err) {
        if (err) {
          sendMessage(req.body['message']['chat']['id'], 'Hmm... something went wrong. Try again.')
        } else {
          sendMessage(req.body['message']['chat']['id'], 'Gotcha.', message['id'])
        }
      })
      break;
    case '/get':
      if (message['text'][1]) {
        client.send_command('hget', [req.body['message']['chat']['id'], message['text'][1]], function (err, resp) {
          if (err) {
            sendMessage(req.body['message']['chat']['id'], 'Hmm... something went wrong. Try again.')
          } else {
            if (resp) {
              sendMessage(req.body['message']['chat']['id'], message['text'][1] + ': ' + resp, message['id'])
            } else {
              sendMessage(req.body['message']['chat']['id'], 'I don\'t think you\'ve saved that before.')
            }
          }
        })
      } else {

      }
      break;
  }

  res.sendStatus(200)
})

app.listen(process.env.PORT || 3000)
