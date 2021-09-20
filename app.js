const VkBot = require('node-vk-bot-api');
const Scene = require('node-vk-bot-api/lib/scene');
const Session = require('node-vk-bot-api/lib/session');
const Stage = require('node-vk-bot-api/lib/stage');
const Markup = require('node-vk-bot-api/lib/markup');

const axios = require('axios')
const express = require('express');
const bodyParser = require('body-parser');
const url = require("url");
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

function bufferImage(pathToImage){
    return Buffer.from(readFromFile(pathToImage)).toString('base64')
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

async function getUser(userId, fields=''){
    let response = await bot.execute('users.get', {
        user_id: userId,
        fields: fields,
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
    const userId = ctx.message.from_id || ctx.message.user_id;
    
    getUser(userId).then(response => {
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

        //const params = url.parse(response["upload_url"], true);
        const upload_link = response["upload_url"]
        axios({
            method: 'post',
            url: upload_link,
            data:{ photo: fs.createReadStream("test_img.png") },
            headers:{ "Content-Type": "multipart/form-data"} 
        }).then( response => {
            console.log("BUFFER IMAGE")
            console.log(response)
            console.log("-----------------------")
            console.log(Object.getOwnPropertyNames(response))
        });
    });
  },
  (ctx) => {
    if (MSG_SEND_IMG)
    {
        ctx.scene.leave();
        const userId = ctx.message.from_id || ctx.message.user_id;
        const photo_field = "photo_id"
        getUser(userId, photo_field).then(response => {
            if ( response[0][photo_field] !== undefined) {
                photo_id = "photo"+response[0][photo_field]
                ctx.reply('Твоя аватарка', photo_id);
            } else {
                ctx.reply('В твоём профиле нету главной фотографии или я не могу её загрузить');
            }
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