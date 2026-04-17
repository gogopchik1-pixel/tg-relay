# Telegram MTProto WebSocket Relay

Размещается на сервере вне России (Render.com и т.д.) для обхода блокировки Telegram.

## Как работает

1. Российский сервер подключается по WebSocket к этому реле
2. Реле пересылает данные по raw TCP к серверам Telegram
3. Данные возвращаются тем же путём

## Деплой на Render.com

1. Создай аккаунт на [render.com](https://render.com)
2. Нажми "New" → "Web Service"
3. Подключи GitHub и выбери этот репозиторий (или форкни)
4. Или выбери "Deploy from URL" и вставь URL репозитория
5. Render автоматически обнаружит `render.yaml`
6. Нажми "Apply" — сервис запустится

Получишь URL вида `https://tg-relay-xxxx.onrender.com`

## Настройка на российском сервере

Добавь в `.env` бэкенда:
```
TG_RELAY_URL=wss://tg-relay-xxxx.onrender.com
TG_RELAY_TOKEN=tg-relay-2024-secure
```

И перезапусти бэкенд. Парсер Telegram начнёт использовать WebSocket реле вместо SOCKS5 прокси.

## Безопасность

- Все подключения авторизуются по токену (AUTH_TOKEN)
- Без правильного токена подключение отклоняется
