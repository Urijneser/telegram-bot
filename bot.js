const express = require('express');
const axios = require('axios');
const app = express();

// Railway сам назначает порт через переменную окружения
const PORT = process.env.PORT || 3000;

const BOT_TOKEN = "8384153568:AAHjkIpIVGRlpo-NmEJblXl7FDWyBkg9cj0";

app.use(express.json());

// ГЛАВНАЯ СТРАНИЦА - для проверки
app.get('/', (req, res) => {
  const host = req.get('host');
  const protocol = req.protocol;
  const fullUrl = `${protocol}://${host}`;
  
  res.json({ 
    status: 'OK', 
    message: '🤖 Telegram Bot is running!',
    webhookUrl: `${fullUrl}/webhook`,
    setWebhook: `${fullUrl}/set-webhook`,
    healthCheck: `${fullUrl}/health`,
    timestamp: new Date().toISOString()
  });
});

// Health check для Railway
app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'healthy',
    service: 'telegram-bot',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// Установка вебхука
app.get('/set-webhook', async (req, res) => {
  try {
    const host = req.get('host');
    const protocol = req.protocol;
    const webhookUrl = `${protocol}://${host}/webhook`;
    
    console.log('Setting webhook to:', webhookUrl);
    
    const url = `https://api.telegram.org/bot${BOT_TOKEN}/setWebhook?url=${webhookUrl}`;
    const response = await axios.get(url);
    
    console.log('Telegram response:', response.data);
    
    res.json({
      success: true,
      message: "✅ Webhook установлен!",
      webhookUrl: webhookUrl,
      telegramResponse: response.data,
      nextStep: "Теперь напишите боту в Telegram любое сообщение!"
    });
  } catch (error) {
    console.error('Webhook error:', error);
    res.status(500).json({ 
      success: false,
      error: error.message 
    });
  }
});

// Удаление вебхука (если нужно сбросить)
app.get('/delete-webhook', async (req, res) => {
  try {
    const url = `https://api.telegram.org/bot${BOT_TOKEN}/deleteWebhook`;
    const response = await axios.get(url);
    
    res.json({
      success: true,
      message: "Webhook удален",
      response: response.data
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      error: error.message 
    });
  }
});

// Информация о вебхуке
app.get('/webhook-info', async (req, res) => {
  try {
    const url = `https://api.telegram.org/bot${BOT_TOKEN}/getWebhookInfo`;
    const response = await axios.get(url);
    
    res.json({
      success: true,
      webhookInfo: response.data
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
    console.log('📨 Received Telegram update:', JSON.stringify(update));

    if (update.message && update.message.text) {
      const chatId = update.message.chat.id;
      const text = update.message.text;
      const userName = update.message.from.first_name || 'Пользователь';

      console.log(`Processing message from ${userName} (${chatId}): ${text}`);

      // Ответ на сообщение
      await sendMessage(chatId, 
        `Привет, ${userName}! 👋\n\n` +
        `Вы написали: *"${text}"*\n\n` +
        `🎉 Бот успешно работает на Railway!\n\n` +
        `🔗 Пример ссылки: https://example.com\n\n` +
        `_Это автоматический ответ_`
      );
    }

    res.status(200).send('OK');
  } catch (error) {
    console.error('❌ Webhook processing error:', error);
    res.status(200).send('OK'); // Всегда возвращаем OK Telegram
  }
});

// Функция отправки сообщения
async function sendMessage(chatId, text) {
  try {
    const url = `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`;
    const payload = {
      chat_id: chatId,
      text: text,
      parse_mode: 'Markdown'
    };
    
    const response = await axios.post(url, payload);
    console.log('✅ Message sent to chatId:', chatId);
    return response.data;
  } catch (error) {
    console.error('❌ Send message error:', error.response?.data || error.message);
    throw error;
  }
}

// Тестовая функция для отправки сообщения
app.get('/test-message/:chatId', async (req, res) => {
  try {
    const chatId = req.params.chatId;
    const result = await sendMessage(chatId, 
      '🔧 Тестовое сообщение от бота!\n\n' +
      'Если вы это видите - бот работает корректно! 🎉'
    );
    
    res.json({
      success: true,
      message: "Тестовое сообщение отправлено",
      result: result
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      error: error.message 
    });
  }
});

// Запуск сервера
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Bot server running on port ${PORT}`);
  console.log(`✅ Health check available at /health`);
  console.log(`📝 Set webhook: /set-webhook`);
  console.log(`🕒 Server started at: ${new Date().toISOString()}`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('🛑 Received SIGTERM, shutting down gracefully...');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('🛑 Received SIGINT, shutting down gracefully...');
  process.exit(0);
});
