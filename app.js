const VkBot = require('node-vk-bot-api');
const Scene = require('node-vk-bot-api/lib/scene');
const Session = require('node-vk-bot-api/lib/session');
const Stage = require('node-vk-bot-api/lib/stage');
const Markup = require('node-vk-bot-api/lib/markup');
//const Markup = require('node-vk-bot-api/lib/markup');
const express = require('express');
const bodyParser = require('body-parser');
var url = require("url");
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

async function getUser(userId){
    let response = await bot.execute('users.get', {
        user_id: userId,
    });
    return response;
}

async function getMessagesUploadServer(peerId){
    let response = await bot.execute('photos.getMessagesUploadServer',{
        peer_id: peerId,
    });
    return response;
}

async function saveMessagesPhoto(photo, server, hash){
    let response = await bot.execute('photos.saveMessagesPhoto',{
        photo: photo,
        server: server,
        hash: hash
    });
    return response;
}

const MSG_SEND_IMG = 'Пришли картинку';

const scene = new Scene('meet',
  (ctx) => {
    ctx.scene.next();
    console.log(Object.getOwnPropertyNames(ctx))
    console.log("----------------------")
    console.log(Object.getOwnPropertyNames(ctx.message))
    console.log("----------------------")
    console.log(Object.getOwnPropertyNames(ctx.client_info))
    const userId = ctx.message.from_id || ctx.message.user_id;
    
    console.log("----------------------")
    getUser(userId).then(response => {
        console.log(response)
        console.log(Object.getOwnPropertyNames(response))
        const name = response[0]["first_name"]
        ctx.reply('Привет, ' + name + "!", null, Markup
            .keyboard([
            [
              Markup.button(MSG_SEND_IMG, 'primary'),
            ]
          ]),
        );
    });

    getMessagesUploadServer().then(response => {
        const params = url.parse(response["upload_url"], true);
        console.log('________________')
        console.log('getMessageUploadServer')
        console.log(response)
        console.log(Object.getOwnPropertyNames(response))
        console.log(Object.getOwnPropertyNames(params))
    });
  },
  (ctx) => {
    if (MSG_SEND_IMG)
    {
        ctx.scene.leave();
        const userId = ctx.message.from_id || ctx.message.user_id;
    
        getUser(userId).then(response => {
            photo_id = response.fields.photo_id
            ctx.reply('What is your name?', photo_id);
        });
    }
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