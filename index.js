'use strict';
import TelegramBot from 'node-telegram-bot-api';
import dotenv from 'dotenv';

dotenv.config({path: './.env'})
import {checkHi, notes} from './helpers/index.js';

const bot = new TelegramBot(process.env.TELEGRAM_BOT_TOKEN, {polling: true});

bot.onText(/\/echo (.+)/, (msg, match) => {

  const chatId = msg.chat.id;
  const resp = match[1];

  bot.sendMessage(chatId, resp);
});

bot.onText(/напомни (.+) в (.+)/, function (msg, match) {
  const userId = msg.from.id;
  const text = match[1];
  const time = match[2];

  notes.push({ userId, time, text });

  bot.sendMessage(userId, `Хорошо ${msg.from.first_name}! Я обязательно напомню :)`);
});

setInterval(function () {
  for (let i = 0; i < notes.length; i++) {
    const curDate = new Date().getHours() + ':' + new Date().getMinutes();
    if (notes[i]['time'] === curDate) {
      bot.sendMessage(notes[i]['userId'], `Напоминаю, что вы должны: ${notes[i]['text']} сейчас.`);
      notes.splice(i, 1);
    }
  }
}, 1000);

bot.on('message', (msg) => {
  console.log(msg)
  const chatId = msg.from.id;
  checkHi.includes(msg.text.toLowerCase()) && bot.sendMessage(chatId, `Ну здравствуй ${msg.from.first_name}`);
  msg.text === 'weather' && bot.sendMessage(chatId, 'Погода');

});

