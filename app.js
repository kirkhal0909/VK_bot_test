const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');

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

const app = express();
const VkBot = require('node-vk-bot-api');
const bot = new VkBot({
    token: API_TOKEN,
    confirmation: CONFIRMATION_CODE,
});

bot.use(async (ctx, next) => {
    try {
      await next();
    } catch (e) {
      console.error(e);
    }
});

const welcome_message_to_user = 'Привет, {имя}!'
const welcome_message_to_bot = ['Начать', 'Привет бот']

bot.command('/start', async (ctx) => {
    welcome_message_to_bot.forEach(message_to_bot => {
        ctx.reply(welcome_message_to_user, null, Markup
            .keyboard([
                Markup.button(message_to_bot, 'primary'),
            ])
        );
    });
});


app.use(bodyParser.json());

app.post('/', bot.webhookCallback);

app.listen(PORT);

bot.startPolling();