require('dotenv').config()

const TelegramBot = require('node-telegram-bot-api');
const express = require('express');
const cors = require('cors');

const token = '6130934084:AAFOuyQAM_IyWMOT5qImo_6GLh0V8xIA8G0';
const webAppUrl = 'https://unrivaled-bubblegum-b96f29.netlify.app/';

const bot = new TelegramBot(token, {polling: true});
const app = express();

app.use(express.json());
app.use(cors());

bot.on('message', async (msg) => {
    const chatId = msg.chat.id;
    const text = msg.text;

    if(text === '/start') {
        await bot.sendMessage(chatId, 'Заповнити форму знизу', {
            reply_markup: {
                keyboard: [
                    [{text: 'Заповнити форму', web_app: {url: webAppUrl + '/form'}}]
                ]
            }
        })

        await bot.sendMessage(chatId, 'Зробити замовлення, натиснувши кнопку знизу', {
            reply_markup: {
                inline_keyboard: [
                    [{text: 'Зробити замовлення', web_app: {url: webAppUrl}}]
                ]
            }
        })
    }

    if(msg?.web_app_data?.data) {
        try {
            const data = JSON.parse(msg?.web_app_data?.data)
            console.log(data)
            await bot.sendMessage(chatId, 'Дякую за зворотній звязок')
            await bot.sendMessage(chatId, 'Ваше місто: ' + data?.city);
            await bot.sendMessage(chatId, 'Ваша вулиця: ' + data?.street);

            setTimeout(async () => {
                await bot.sendMessage(chatId, 'Всю інфу отримаєте тут');
            }, 3000)
        } catch (e) {
            console.log(e);
        }
    }
});

app.post('/web-data', async (req, res) => {
    const {queryId, products = [], totalPrice} = req.body;
    try {
        await bot.answerWebAppQuery(queryId, {
            type: 'article',
            id: queryId,
            title: 'Успішне замовлення',
            input_message_content: {
                message_text: ` Ви придбали товар на суму ${totalPrice}, ${products.map(item => item.title).join(', ')} ,
                наразі розрахуватися можна лише готівкою`
            }
        })
        return res.status(200).json({});
    } catch (e) {
        return res.status(500).json({})
    }
})

const PORT = 8000;

app.listen(PORT, () => console.log('server started on PORT ' + PORT))