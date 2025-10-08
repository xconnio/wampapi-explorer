import { defineStore } from 'pinia'
import { connectAnonymous, connectTicket, connectCRA, connectCryptosign } from 'xconn'

export const useSessionStore = defineStore('session', {
  state: () => ({
    // client: new Client(),
    session: null,
    apis: [],
    connectionError: null,
  }),
  actions: {
    async getSession({
      url = new URL('ws://localhost:8080/ws'),
      realm = 'realm1',
      authMethod = 'anonymous',
      authId = '',
      secret = '',
    }) {
      const uri = url.toString()

      if (authMethod === 'ticket') {
        this.session = connectTicket(uri, realm, authId, secret)
      } else if (authMethod === 'cra') {
        this.session = connectCRA(uri, realm, authId, secret)
      } else if (authMethod === 'cryptosign') {
        this.session = connectCryptosign(uri, realm, authId, secret)
      } else {
        this.session = connectAnonymous(uri, realm)
      }

      return this.session
    },

    async callSchema(session, schema) {
      const result = await session.call(schema)
      this.apis = result.args
    },
  },
})
