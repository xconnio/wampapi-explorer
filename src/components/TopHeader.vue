<script setup>
import { Collapse } from 'bootstrap'
import {
  authenticationSecret,
  authenticationType,
  connectionArguments,
  parseURL,
} from '../utils/parseUrl'
import { reactive, onMounted, nextTick, ref, computed } from 'vue'
import { useSessionStore } from '../stores/session'

const store = useSessionStore()

const connArgs = connectionArguments()

const routerUrl = ref(connArgs.url)
const realmInput = ref(connArgs.realm)
const schemaInput = ref(connArgs.schema)

const authTypeInput = ref(authenticationType(connArgs))
const authIdInput = ref(connArgs.authid)
const secretInput = ref(authenticationSecret())

const secretPlaceholder = computed(() => {
  switch (authTypeInput.value) {
    case 'ticket':
      return 'Ticket'
    case 'cryptosign':
      return 'Private Key'
    case 'cra':
      return 'Secret'
    default:
      return ''
  }
})

const isAnonymous = computed(() => {
  return authTypeInput.value === 'anonymous'
})

const handleSubmit = async () => {
  store.connectionError = null
  store.apis = []
  await nextTick()

  const url = parseURL(routerUrl.value)
  routerUrl.value = url.toString()

  try {
    const session = await store.getSession({
      url,
      realm: realmInput.value,
      authMethod: authTypeInput.value,
      authId: authIdInput.value,
      secret: secretInput.value,
    })

    await store.callSchema(session, connArgs.schema || schemaInput.value)
  } catch (error) {
    if (error.toString() === '[object Event]') store.connectionError = 'Connection error'
    else if (error.toString() === 'wamp.error.no_such_procedure')
      store.connectionError = `${error}: (${schemaInput.value})`
    else store.connectionError = error
  }

  await nextTick(async () => {
    const collapseTriggerList = document.querySelectorAll('.collapse')
    collapseTriggerList.forEach((element) => new Collapse(element))
  })
}

onMounted(async () => {
  // await handleSubmit()
})
</script>

<template>
  <header class="text-white py-3 sticky-top mb-3" style="background-color: rgb(64, 81, 181)">
    <!-- Inner container gives left/right padding like the rest of the site -->
    <div class="container">
      <h1 class="h5 m-0">WAMP API Explorer</h1>
    </div>
  </header>
  <div class="container">
    <header>
      <nav class="navbar navbar-expand-lg bg-body-tertiarky">
        <div class="container-fluid justify-content-center">
          <form class="row g-2 justify-content-center" @submit.prevent="handleSubmit">
            <div class="col">
              <div class="row">
                <div class="col">
                  <input
                    type="text"
                    class="form-control me-2"
                    v-model="routerUrl"
                    placeholder="URL"
                    required
                  />
                </div>
                <div class="col">
                  <input
                    type="text"
                    class="form-control me-2"
                    v-model="realmInput"
                    placeholder="Realm"
                    required
                  />
                </div>
                <div class="col">
                  <input
                    type="text"
                    class="form-control me-2"
                    v-model="schemaInput"
                    placeholder="Schema URI"
                    required
                  />
                </div>
              </div>
              <br />
              <div class="row">
                <div class="col-3">
                  <select class="form-select me-2" v-model="authTypeInput">
                    <option value="anonymous">Anonymous</option>
                    <option value="ticket">Ticket</option>
                    <option value="cra">CRA</option>
                    <option value="cryptosign">CryptoSign</option>
                  </select>
                </div>
                <div class="col-3" v-if="!isAnonymous">
                  <input
                    type="text"
                    class="form-control me-2"
                    placeholder="authid"
                    required
                    v-model="authIdInput"
                  />
                </div>
                <div class="col-3" v-if="!isAnonymous">
                  <input
                    type="text"
                    class="form-control me-2"
                    :placeholder="secretPlaceholder"
                    :required
                    v-model="secretInput"
                  />
                </div>
                <div class="col-3 ms-auto d-flex justify-content-end">
                  <button class="col-12 btn btn-outline-success" type="submit">Explore</button>
                </div>
              </div>
            </div>
          </form>
        </div>
      </nav>
    </header>
  </div>
</template>
