import { defineStore } from 'pinia'
import { Client, connectAnonymous, connectTicket, connectCRA, connectCryptosign } from 'xconn'

export const useSessionStore = defineStore('session', {
  state: () => ({
    // client: new Client(),
    session: null,
  }),
  actions: {
    async getSession({
      url = new URL('ws://localhost:8080/ws'),
      realm = 'realm1',
      authMethod = 'anonymous',
      authId = '',
      secret = '',
    }) {
      console.log(url.toString(), realm, authMethod, authId, secret)
      const uri = url.toString()

      if (authMethod === 'ticket') {
        this.session = connectTicket(uri, realm, authId, secret)
      } else if (authMethod === 'cra') {
        this.session = connectCRA(uri, realm, authId, secret)
      } else if (authMethod === 'cryptosign') {
        this.session = connectCryptosign(uri, realm, authId, secret)
      } else {
        this.session = connectAnonymous(uri, realm)
        console.log('Anonymous')
      }

      return this.session
    },
  },
})
