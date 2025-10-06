const express = require('express');
const axios = require('axios');
const app = express();
const PORT = process.env.PORT || 3000;

const BOT_TOKEN = "8384153568:AAHjkIpIVGRlpo-NmEJblXl7FDWyBkg9cj0";

app.use(express.json());

// ГЛАВНАЯ СТРАНИЦА - покажет ваш URL
app.get('/', (req, res) => {
  const protocol = req.headers['x-forwarded-proto'] || 'http';
  const host = req.headers['x-forwarded-host'] || req.headers.host;
  const fullUrl = `${protocol}://${host}`;
  
  res.send(`
    <h1>🤖 Telegram Bot is Running!</h1>
    <p><strong>Your URL:</strong> ${fullUrl}</p>
    <p><strong>Set webhook:</strong> <a href="${fullUrl}/set-webhook">${fullUrl}/set-webhook</a></p>
    <p>После открытия ссылки выше - напишите боту в Telegram!</p>
  `);
});

// Установка вебхука
app.get('/set-webhook', async (req, res) => {
  try {
    const protocol = req.headers['x-forwarded-proto'] || 'http';
    const host = req.headers['x-forwarded-host'] || req.headers.host;
    const webhookUrl = `${protocol}://${host}/webhook`;
    
    const url = `https://api.telegram.org/bot${BOT_TOKEN}/setWebhook?url=${webhookUrl}`;
    const response = await axios.get(url);
    
    res.json({
      success: true,
      message: "Webhook установлен!",
      webhookUrl: webhookUrl,
      telegramResponse: response.data
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      error: error.message 
    });
  }
});

// Обработчик сообщений от Telegram
app.post('/webhook', async (req, res) => {
  try {
    const update = req.body;
    console.log('📨 Received message:', update);

    if (update.message && update.message.text) {
      const chatId = update.message.chat.id;
      const text = update.message.text;

      await sendMessage(chatId, 
        `🎉 Бот работает! Спасибо за сообщение!\n\n` +
        `Вы написали: "${text}"\n\n` +
        `Ссылка: https://example.com`
      );
    }

    res.status(200).send('OK');
  } catch (error) {
    console.error('❌ Error:', error);
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
    console.log('✅ Message sent to:', chatId);
  } catch (error) {
    console.error('❌ Send error:', error.response?.data || error.message);
  }
}

// Запуск сервера
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Bot server running on port ${PORT}`);
  console.log(`🌐 Server is ready for connections`);
});
