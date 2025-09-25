export function parseURL(link) {
  const url = new URL(link)
  const search = new URLSearchParams(window.location.search)
  const host = search.get('host')
  const port = search.get('port')
  const protocol = search.get('protocol')

  if (host === 'localhost') url.protocol = 'ws'

  if (host) url.hostname = host
  if (port) url.port = port
  if (protocol) url.protocol = protocol

  return url
}

export function connectionArguments() {
  const search = new URLSearchParams(window.location.search)
  return {
    realm: search.get('realm'),
    auth: search.get('auth'),
    private: search.get('private'),
    ticket: search.get('ticket'),
    secret: search.get('secret'),
    authid: search.get('authid'),
    schema: search.get('schema'),
    protocol: search.get('protocol'),
    link: search.get('link'),
  }
}

export function authenticationType(connArgs = connectionArguments()) {
  if (connArgs.private) return 'cryptosign'
  if (connArgs.ticket) return 'ticket'
  if (connArgs.secret) return 'cra'
  return 'anonymous'
}

export function authenticationSecret(connArgs = connectionArguments()) {
  if (connArgs.private) return connArgs.private
  if (connArgs.ticket) return connArgs.ticket
  if (connArgs.secret) return connArgs.secret
  return ''
}
