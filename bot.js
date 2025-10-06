const express = require('express');
const axios = require('axios');
const app = express();

// Railway сам назначает порт через переменную окружения
const PORT = process.env.PORT || 3000;

const BOT_TOKEN = "8384153568:AAHjkIpIVGRlpo-NmEJblXl7FDWyBkg9cj0";

app.use(express.json());

// ГЛАВНАЯ СТРАНИЦА - для проверки здоровья
app.get('/', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'Telegram Bot is running!',
    timestamp: new Date().toISOString()
  });
});

// Проверка здоровья
app.get('/health', (req, res) => {
  res.status(200).send('OK');
});

// Установка вебхука
app.get('/set-webhook', async (req, res) => {
  try {
    // Получаем автоматический URL от Railway
    const host = req.get('host');
    const protocol = req.protocol;
    const webhookUrl = `${protocol}://${host}/webhook`;
    
    const url = `https://api.telegram.org/bot${BOT_TOKEN}/setWebhook?url=${webhookUrl}`;
    const response = await axios.get(url);
    
    console.log('Webhook set to:', webhookUrl);
    
    res.json({
      success: true,
      message: "Webhook установлен!",
      webhookUrl: webhookUrl,
      telegramResponse: response.data
    });
  } catch (error) {
    console.error('Webhook error:', error);
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

    if (update.message && update.message.text) {
      const chatId = update.message.chat.id;
      const text = update.message.text;

      console.log('Received message from:', chatId, 'text:', text);

      await sendMessage(chatId, 
        `🎉 Бот работает! Спасибо за сообщение!\n\n` +
        `Вы написали: "${text}"\n\n` +
        `Ссылка: https://example.com`
      );
    }

    res.status(200).send('OK');
  } catch (error) {
    console.error('Webhook processing error:', error);
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
    
    await axios.post(url, payload);
    console.log('Message sent to:', chatId);
  } catch (error) {
    console.error('Send message error:', error.response?.data || error.message);
  }
}

// Запуск сервера на 0.0.0.0 чтобы принимать внешние подключения
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Bot server running on port ${PORT}`);
  console.log(`✅ Health check: http://0.0.0.0:${PORT}/health`);
  console.log(`📝 Set webhook: http://0.0.0.0:${PORT}/set-webhook`);
});

// Обработка graceful shutdown
process.on('SIGTERM', () => {
  console.log('Received SIGTERM, shutting down gracefully');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('Received SIGINT, shutting down gracefully');
  process.exit(0);
});
