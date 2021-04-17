const Telegraf = require('telegraf')
const test = require('ava')
const AzureTableStorageSession = require('../lib/session')

const storeOptions = {
  accountName: process.env.AZURE_STORAGE_ACCOUNT || '',
  accountKey: process.env.AZURE_STORAGE_ACCESS_KEY || ''
}

test.serial('should be defined', (t) => {
  const app = new Telegraf()

  const session = new AzureTableStorageSession({
    store: storeOptions
  })
  app.on('text', session, (ctx) => {
    return t.true('session' in ctx)
  })
  return app.handleUpdate({ message: { chat: { id: 1 }, from: { id: 1 }, text: 'hey' } })
})

test.serial('should retrieve and save session', (t) => {
  const redisSession = new AzureTableStorageSession({
    store: storeOptions
  })
  const key = '1:1'
  return redisSession.getSession(key)
    .then((session) => {
      t.truthy(session)
      session.foo = 42
      return redisSession.saveSession(key, session)
    })
    .then(() => {
      return redisSession.getSession(key)
    })
    .then((session) => {
      t.truthy(session)
      t.deepEqual({ foo: 42 }, session)
    })
})

test.serial('should handle existing session', (t) => {
  const app = new Telegraf()
  const session = new AzureTableStorageSession({
    store: storeOptions
  })
  app.on('text',
    session.middleware(),
    (ctx) => {
      t.true('session' in ctx)
      t.true('foo' in ctx.session)
      t.is(ctx.session.foo, 42)
    })
  return app.handleUpdate({ message: { chat: { id: 1 }, from: { id: 1 }, text: 'hey' } })
})

test.serial('should handle not existing session', (t) => {
  const app = new Telegraf()
  const session = new AzureTableStorageSession({
    store: storeOptions
  })
  app.on('text',
    session.middleware(),
    (ctx) => {
      t.true('session' in ctx)
      t.false('foo' in ctx.session)
    })
  return app.handleUpdate({ message: { chat: { id: 1 }, from: { id: 999 }, text: 'hey' } })
})

test.serial('should handle session reset', (t) => {
  const app = new Telegraf()
  const session = new AzureTableStorageSession({
    store: storeOptions
  })
  app.on('text',
    session.middleware(),
    (ctx) => {
      ctx.session = null
      t.truthy(ctx.session)
      t.false('foo' in ctx.session)
    })
  return app.handleUpdate({ message: { chat: { id: 1 }, from: { id: 1 }, text: 'hey' } })
})

