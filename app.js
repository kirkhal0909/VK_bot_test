const VkBot = require('node-vk-bot-api');
const Scene = require('node-vk-bot-api/lib/scene');
const Session = require('node-vk-bot-api/lib/session');
const Stage = require('node-vk-bot-api/lib/stage');
const api = require('node-vk-bot-api/lib/api');
//const Markup = require('node-vk-bot-api/lib/markup');
const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');

const app = express();

function readFromFile(path){
    try {
        if (fs.existsSync(path)) {
            const data = fs.readFileSync(path, 'utf8');
            return data;
        } else{
            return false;
        }
    } catch(err) {
        console.error(err);
        return false;
    }
}

function readAPIToken(APIpathFile="API_TOKEN") {
    return readFromFile(APIpathFile);
}

function readConfirmationCode(confirmationPathFile="CONFIRMATION_CODE") {
    return readFromFile(confirmationPathFile);
}

function isDataReaded(API_TOKEN){
    return API_TOKEN !== false;
}

//
//###############
//  CONFIG_PARAMS

const API_TOKEN = readAPIToken();
const CONFIRMATION_CODE = readConfirmationCode();
const PORT = process.env.PORT || 80;

if (!isDataReaded(API_TOKEN)) {
    console.log("Create file\n API_TOKEN\n and put there your VK group API token");
    return 1;
}

if (!isDataReaded(CONFIRMATION_CODE)) {
    console.log("Create file\n CONFIRMATION\n and put there your VK confirmation server code");
    return 1;
}











const bot = new VkBot({
    token: API_TOKEN,
    confirmation: CONFIRMATION_CODE
});

const scene = new Scene('meet',
  (ctx) => {
    ctx.scene.next();
    console.log(Object.getOwnPropertyNames(ctx))
    console.log("----------------------")
    console.log(Object.getOwnPropertyNames(ctx.message))
    console.log("----------------------")
    console.log(Object.getOwnPropertyNames(ctx.client_info))
    const userId = ctx.message.from_id || ctx.message.user_id;
    const response = await bot.execute('users.get', {
        user_id: userId,
      });
    console.log("----------------------")
    console.log(Object.getOwnPropertyNames(response))
    ctx.reply('Привет, {имя}!');
  },
  (ctx) => {
    ctx.session.age = +ctx.message.text;

    ctx.scene.next();
    ctx.reply('What is your name?');
  },
  (ctx) => {
    ctx.session.name = ctx.message.text;

    ctx.scene.leave();
    ctx.reply(`Nice to meet you, ${ctx.session.name} (${ctx.session.age} years old)`);
  },
);

const session = new Session();
const stage = new Stage(scene);

bot.use(session.middleware());
bot.use(stage.middleware());

const start_messages = ["Начать", "Привет бот"]
start_messages.forEach(msg => {
    bot.command(msg, (ctx) => {
        ctx.scene.enter('meet');
    });
});


app.use(bodyParser.json());

app.post('/', bot.webhookCallback);

app.listen(PORT);

//bot.startPolling();
console.log("||LOGS STARTPOLLING")