export function parseURL(link) {
  const url = new URL(link)
  const search = new URLSearchParams(window.location.search)
  const host = search.get('host')
  const port = search.get('port')

  if (host) url.hostname = host
  if (port) url.port = port

  return url
}
