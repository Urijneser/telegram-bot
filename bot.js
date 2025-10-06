const express = require('express');
const axios = require('axios');
const app = express();
const PORT = process.env.PORT || 3000;

const BOT_TOKEN = "8384153568:AAHjkIpIVGRlpo-NmEJblXl7FDWyBkg9cj0";

app.use(express.json());

// Обрабатываем сообщения от Telegram
app.post('/webhook', async (req, res) => {
  try {
    const update = req.body;
    console.log('Получено сообщение:', update);

    if (update.message && update.message.text) {
      const chatId = update.message.chat.id;
      const text = update.message.text;

      // Отправляем ответ
      await sendMessage(chatId, `🎉 Бот работает! Вы написали: ${text}\n\nСсылка: https://example.com`);
    }

    res.status(200).send('OK');
  } catch (error) {
    console.error('Ошибка:', error);
    res.status(200).send('OK');
  }
});

// Функция отправки сообщения
async function sendMessage(chatId, text) {
  try {
    const url = `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`;
    const payload = {
      chat_id: chatId,
      text: text
    };
    
    const response = await axios.post(url, payload);
    console.log('Сообщение отправлено:', response.data);
  } catch (error) {
    console.error('Ошибка отправки:', error.response?.data || error.message);
  }
}

// Тестовый маршрут
app.get('/', (req, res) => {
  res.send('Бот работает! 🚀');
});

// Установка вебхука
app.get('/set-webhook', async (req, res) => {
  try {
    // Получим URL после деплоя на Railway
    const webhookUrl = `${process.env.RAILWAY_STATIC_URL || 'https://your-app-name.railway.app'}/webhook`;
    
    const url = `https://api.telegram.org/bot${BOT_TOKEN}/setWebhook?url=${webhookUrl}`;
    const response = await axios.get(url);
    
    res.json(response.data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`Бот запущен на порту ${PORT}`);
});