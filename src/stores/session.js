import { defineStore } from 'pinia'
import { Client } from 'xconn'

export const useSessionStore = defineStore('session', {
  state: () => ({
    client: new Client(),
    session: null,
  }),
  actions: {
    async getSession({ host = 'localhost', port = 8080, realm = 'realm1' }) {
      console.log(host, port, realm)
      this.session = this.client.connect(`ws://${host}:${port}/ws`, realm)

      return this.session
    },
  },
})
