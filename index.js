const { TelegramClient } = require("telegram");
const { StringSession } = require("telegram/sessions");
const input = require("input"); // Для ввода данных в консоли
const { NewMessage } = require("telegram/events");
const { user_ignore } = require("./ignoreUser");
const fs = require("fs"); // Для работы с файлами
const { say } = require("./gpt");
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
    await client.markAsRead(message.peerId);
    if (message.isPrivate) {
      const sender = await client.getEntity(message.fromId.userId);
      console.log(JSON.parse(JSON.stringify(sender)));

      let userInBlock = user_ignore.some((user) => user === sender.username);

      if (userInBlock) {
        console.log("Сообщение, ответ не требуется.", sender.username);
        return;
      }

      console.log(
        `Новое сообщение от ${sender.firstName || "пользователя"} (${
          message.peerId.userId
        }): ${message.message}`
      );
      let gemini = await say(message.message, sender.firstName);
      await client.sendMessage(message.peerId, {
        message: gemini,
      });
      console.log(`Ответ отправлен пользователю: ${sender.firstName}`);
    }
  }, new NewMessage());

  console.log("Ожидание новых сообщений...");
})();
