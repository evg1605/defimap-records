Сейчас в api.js есть константа apiUrl, в зависимости от ее значения нужно сделать авторизацию.
Если apiUrl содержит "localhost" - то авторизация не нужна и запросы к graphql можно делать без токена.
В противном случае нужно сделать авторизацию по токену.
Не нужно реализовыват сохранение токена в localStorage и его обновление по refreshToken.
Просто при открытии страницы - посмотреть, если apiUrl не содержит "localhost", то сделать запрос на авторизацию и
сохранить токен в переменную, токен подставлять в каждый запрос к graphql.
header Authorization: `Bearer ${token}`
авторизуемся в google, вот некоторые данные для авторизации:
access_token_url - https://oauth2.googleapis.com/token
client_id - 821420392447-77ak5cfprj41f7v901ih84292h7dsng8.apps.googleusercontent.com
scope - https://www.googleapis.com/auth/userinfo.email https://www.googleapis.com/auth/userinfo.profile openid

если чего то не хватает - спрашивай-уточняй.