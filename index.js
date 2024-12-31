const { TelegramClient } = require("telegram");
const { StringSession } = require("telegram/sessions");
const input = require("input"); // Для ввода данных в консоли
const { NewMessage } = require("telegram/events");
const fs = require("fs"); // Для работы с файлами

// Ваши данные
const apiId = 24327124;
const apiHash = "03930a6ab2cd5b3a244b898083b74284";
let stringSession = new StringSession("");

if (fs.existsSync("session.txt")) {
  const savedSession = fs.readFileSync("session.txt", "utf8");
  stringSession = new StringSession(savedSession);
}

(async () => {
  console.log("Запуск клиента...");
  const client = new TelegramClient(stringSession, apiId, apiHash, {
    connectionRetries: 5,
  });

  await client.start({
    phoneNumber: async () => await input.text("Введите ваш номер телефона: "),
    password: async () =>
      await input.text("Введите ваш пароль (если установлен): "),
    phoneCode: async () => await input.text("Введите код из Telegram: "),
    onError: (err) => console.log(err),
  });

  console.log("Вы успешно вошли!");

  const sessionString = client.session.save();
  fs.writeFileSync("session.txt", sessionString);
  console.log("Сессия сохранена в файл session.txt");

  client.addEventHandler(async (event) => {
    const message = event.message;
    const sender = await client.getEntity(message.fromId.userId);
    if (message.isPrivate) {
      const sender = await client.getEntity(message.fromId.userId);
      console.log(JSON.parse(JSON.stringify(sender)));
      if (sender.username === 'O101O1O1O') {
        console.log("Сообщение отправлено вами, ответ не требуется.");
        return;
      }

      console.log(
        `Новое сообщение от ${sender.firstName || "пользователя"} (${
          message.peerId.userId
        }): ${message.message}`
      );

      await client.sendMessage(message.peerId, {
        message: `Здравствуйте, ${sender.firstName}!\n\nСпасибо за ваше сообщение. 🌟 Мы ценим вашу связь с нами и обязательно ответим вам в ближайшее время.`,
      });
      console.log(`Ответ отправлен пользователю: ${message.peerId.userId}`);
    }
  }, new NewMessage());

  console.log("Ожидание новых сообщений...");
})();
