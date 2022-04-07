require("dotenv").config();
const axios = require("axios");
const TelegramBot = require('node-telegram-bot-api');

const token = process.env.BOT_TOKEN;

// Create a bot that uses 'polling' to fetch new updates
const bot = new TelegramBot(token, {polling: true});

// bot.on('message', (msg) => {
//   const chatId = msg.chat.id;
//   bot.sendMessage(chatId, 'Received your message');
// });

bot.setMyCommands([
  {command: '/start', description: "Starts the bot"},
  {command: '/generate', description: "Generate fake user details"}
])

const opt = {
  reply_markup: JSON.stringify({
    inline_keyboard: [
      [{text:"Male", callback_data: "male"}],
      [{text:"Female", callback_data: "female"}],
      [{text:"Random", callback_data: "random"}]
    ]
  })
}

bot.onText(/\/start/, (msg) => {
  const chatId = msg.chat.id;
  const resp =
  `Welcome to fake user generator.
This bot creates fake user details as per the request of the user.
  \n/generate - To generate fake user details`;
  bot.sendMessage(chatId, resp);
});

bot.onText(/\/generate/, (msg) => {
  const chatId = msg.chat.id;
  const resp = "Select from the following options to generate a fake user:";
  bot.sendMessage(chatId, resp, opt);
});

bot.on('callback_query', async (msg)=>{
  const url = 'https://randomuser.me/api/';
  const data = msg.data;
  const chatId = msg.message.chat.id;

  var reqUrl = url;
  if(data!=="random"){
    reqUrl=reqUrl+"?gender="+data;
  }
  // bot.sendMessage(chatId, data);
  await axios.get(reqUrl)
  .then(async response => {
    // console.log(response.data.results[0]);
    const resp = response.data.results[0];
    const obj =
      "Name: "+resp.name.title+" "+resp.name.first+" "+resp.name.last+
      "\nGender: "+resp.gender+
      "\nAge: "+resp.dob.age+
      "\nD.O.B: "+resp.dob.date.slice(0,10)+
      "\nAddress: Street "+resp.location.street.name+", "+resp.location.city+", "+resp.location.state+", "+resp.location.country+
      "\nPincode: "+resp.location.postcode+
      "\nEmail: "+resp.email+
      "\nPassword: "+resp.login.password+
      "\nPh: "+resp.phone
    ;
    // console.log(typeof(resp.dob.date));
      await bot.sendPhoto(chatId, resp.picture.large);
      await bot.sendMessage(chatId,obj);

  })
  .catch(error => {
    console.log(error);
  });
});
