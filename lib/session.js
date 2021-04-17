const debug = require('debug')('telegraf:session-azure-table-storage')
const azure = require('azure-storage');

class AzureTableStorageSession {
  constructor (options) {
    this.options = Object.assign({
      property: 'session',
      table: 'sessions',
      partitionKey: 'contributor',
      getSessionKey: (ctx) => ctx.from && ctx.chat && `${ctx.from.id}:${ctx.chat.id}`,
      store: {
        accountName: "",
        accountKey: ""
      }
    }, options)


    this.client = azure.createTableService(this.options.store.accountName, this.options.store.accountKey);
  }

  getSession (key) {
    const  { table, partitionKey } = this.options;
    return new Promise((resolve, reject) => {

      this.client.retrieveEntity(table, partitionKey, key, (err, entity) => {

        if(err) {
          if(err.statusCode === 404) {
            return resolve({});
          }
          return reject(err);
        }
        if (entity.session) {
          try {
            const session = JSON.parse(entity.session._)
            debug('session state', key, session)
            resolve(session)
          } catch (error) {
            debug('Parse session state failed', error)
          }
        }
        resolve({});
      });
    })
  }

  clearSession (key) {
    debug('clear session', key)
    const { table, partitionKey } = this.options;
    return new Promise((resolve, reject) => {
      const sessionDescriptor = { PartitionKey: partitionKey, RowKey: key };
      this.client.deleteEntity(table, sessionDescriptor, (err, res) => {
        if (err) {
          if(err.statusCode === 404) {
            return resolve({});
          }
          return reject(err)
        }
        resolve()
      });
    })
  }

  saveSession (key, session) {

    if (!session || Object.keys(session).length === 0) {
      return this.clearSession(key)
    }

    debug('save session', key, session)

    const { table, partitionKey } = this.options;

    return new Promise((resolve, reject) => {
      const entityDescriptor  = {
        PartitionKey: partitionKey,
        RowKey: key,
        session: JSON.stringify(session)
      };
      this.client.insertOrReplaceEntity(table, entityDescriptor, (err, entity) => {
        if (err) {
          return reject(err)
        }
        resolve({})
      })
    })
  }

  middleware () {
    return (ctx, next) => {
      const key = this.options.getSessionKey(ctx)
      if (!key) {
        return next()
      }
      return this.getSession(key).then((session) => {
        debug('session snapshot', key, session)
        if(!ctx[this.options.property])
          ctx[this.options.property] = {};
        Object.defineProperty(ctx, this.options.property, {
          get: function () { return session },
          set: function (newValue) { session = Object.assign({}, newValue) }
        })
        return next().then(() => this.saveSession(key, session))
      })
    }
  }
}

module.exports = AzureTableStorageSession
