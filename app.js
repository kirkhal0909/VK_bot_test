const VkBot = require('node-vk-bot-api');
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

const bot = new VkBot(API_TOKEN);

bot.on('Начать', (ctx) => {
    console.log('||НАЧАТЬ')
    ctx.reply('Начать');
})


app.use(bodyParser.json());

app.post('/', bot.webhookCallback);

app.listen(PORT);

bot.startPolling();
console.log("||LOGS STARTPOLLING")