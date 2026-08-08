# Защищенная отправка заявок в Telegram

Этот Cloudflare Worker принимает заявки с сайта и отправляет текст и фотографии в Telegram. Токен бота и идентификатор чата не попадают в репозиторий или браузер.

## Развертывание

1. Скопируйте `wrangler.toml.example` в `wrangler.toml`.
2. Авторизуйтесь в Cloudflare: `npx wrangler login`.
3. Добавьте секреты непосредственно через терминал:

   ```bash
   npx wrangler secret put TELEGRAM_BOT_TOKEN
   npx wrangler secret put TELEGRAM_CHAT_ID
   ```

4. Опубликуйте обработчик: `npx wrangler deploy`.
5. Скопируйте выданный HTTPS-адрес Worker в поле `leadEndpoint` файла `src/data.mjs` и заново соберите сайт.

Никогда не записывайте токен бота в `src/data.mjs`, HTML, JavaScript, `wrangler.toml` или сообщения в чате. Старый токен, ранее попавший в историю GitHub, необходимо отозвать через BotFather.
