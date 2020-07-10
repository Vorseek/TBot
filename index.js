'use strict';
import TelegramBot from 'node-telegram-bot-api';
import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config({ path: './.env' })
import { checkHi, notes, kelvinToCelsius, checkWeather, weather } from './helpers/index.js';

const bot = new TelegramBot(process.env.TELEGRAM_BOT_TOKEN, { polling: true });
let oneTry = true;

bot.onText(/\/echo (.+)/, (msg, match) => {

  const chatId = msg.chat.id;
  const resp = match[1];

  bot.sendMessage(chatId, resp);
});

bot.onText(/\/напомни (.+) в (.+)/, (msg, match) => {
  const userId = msg.from.id;
  const text = match[1];
  const time = match[2];

  notes.push({ userId, time, text });

  bot.sendMessage(userId, `Хорошо ${msg.from.first_name}! Я обязательно напомню :)`);
});
bot.onText(/\/погода/, (msg) => {
  const userId = msg.from.id;

  weather.push({ userId });

  bot.sendMessage(userId, `Хорошо ${msg.from.first_name}! Я буду присылать тебе погоду в 7:00 :)`);
});

setInterval(() => {
  for (let i = 0; i < notes.length; i++) {
    const curDate = new Date().getHours() + ':' + new Date().getMinutes();
    if (notes[i].time === curDate) {
      bot.sendMessage(notes[i].userId, `Напоминаю, что вы должны: ${notes[i].text} сейчас.`);
      notes.splice(i, 1);
    }
  }

  for (let i = 0; i < weather.length; i++) {
    const curDate = new Date().getHours() + ':' + new Date().getMinutes();
    if (oneTry && curDate === '07:00') {
      wearRequest(weather[i].userId);
      oneTry = false;
    }
    if (curDate === '23:59') oneTry = true;
  }
}, 1000);


bot.on('message', (msg) => {
  const chatId = msg.from.id;
  checkHi.includes(msg.text.toLowerCase()) && bot.sendMessage(chatId, `Ну здравствуй ${msg.from.first_name}`);
  checkWeather.includes(msg.text.toLowerCase()) && wearRequest(chatId);
  msg.text.toLowerCase() === 'west' && westRequest(chatId)

});


const westRequest = async (chatId) => {
  const response = await axios.get('https://api.kanye.rest?format=text')
  bot.sendMessage(chatId, response.data);
}

const wearRequest = async (chatId) => {
  const response = await axios.get('http://api.openweathermap.org/data/2.5/weather?id=520555&lang=ru&appid=73c311ccad15433d53b81a3674478271')
  bot.sendMessage(chatId, `Доброе утро \nВ Нижнем сейчас ${response.data.weather[0].description} \nТемпература воздуха: ${kelvinToCelsius(response.data.main.temp)} \nОщущается как: ${kelvinToCelsius(response.data.main.feels_like)} \nОжидаемая максимальная температура воздуха составит: ${kelvinToCelsius(response.data.main.temp_max)}`);
}
