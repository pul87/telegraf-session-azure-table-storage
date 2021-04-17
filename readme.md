[![Build Status](https://img.shields.io/travis/telegraf/telegraf-session-redis.svg?branch=master&style=flat-square)](https://travis-ci.org/telegraf/telegraf-session-redis)
[![NPM Version](https://img.shields.io/npm/v/telegraf-session-redis.svg?style=flat-square)](https://www.npmjs.com/package/telegraf-session-redis)
[![js-standard-style](https://img.shields.io/badge/code%20style-standard-brightgreen.svg?style=flat-square)](http://standardjs.com/)

# Azure table storage session middleware for Telegraf

Azure table storage powered session middleware for [Telegraf](https://github.com/telegraf/telegraf).
Forked from telegraf-session-redis

## Installation

```js
$ npm install telegraf-session-azure-table-storage
```

## Example

```js
const Telegraf = require('telegraf')
const AzureTableStorageSession = require('telegraf-session-azure-table-storage')

const bot = new Telegraf(process.env.BOT_TOKEN)

const session = new AzureTableStorageSession({
  store: {
    host: process.env.AZURE_STORAGE_ACCOUNT,
    port: process.env.AZURE_STORAGE_ACCESS_KEY
  }
})

bot.use(session)

bot.on('text', (ctx) => {
  ctx.session.counter = ctx.session.counter || 0
  ctx.session.counter++
  console.log('Session', ctx.session)
})

bot.launch()
```

When you have stored the session key beforehand, you can access a
session without having access to a context object. This is useful when
you perform OAUTH or something similar, when a REDIRECT_URI is called
on your bot server.

```js
const azureSession = new AzureTableStorageSession()

// Retrieve session state by session key
azureSession.getSession(key)
  .then((session) => {
    console.log('Session state', session)
  })

// Save session state
azureSession.saveSession(key, session)
```

## API

### Options

* `store`:
  * `accountName`: Azure storage account
  * `accountKey`: Azure storage account access key
* `property`: context property name (default: `session`)
* `getSessionKey`: session key resolver function `(ctx) => any`)

Default implementation of `getSessionKey`:

```js
function getSessionKey (ctx) {
  if (!ctx.from || !ctx.chat) {
    return
  }
  return `${ctx.from.id}:${ctx.chat.id}`
}
```

### Destroying a session

To destroy a session simply set it to `null`.

```js
bot.on('text', (ctx) => {
  ctx.session = null
})

```
