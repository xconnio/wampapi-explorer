<script setup>
import { Collapse } from 'bootstrap'
import {
  authenticationSecret,
  authenticationType,
  connectionArguments,
  parseURL,
} from './utils/parseUrl'
import ApiForm from './components/ApiForm.vue'
import { reactive, onMounted, nextTick, ref, computed } from 'vue'
import { useSessionStore } from './stores/session'

const store = useSessionStore()
const response = reactive({ schema: [] })

const connArgs = connectionArguments()
console.dir(connArgs)

const routerUrl = ref(connArgs.link || 'ws://localhost:8080/ws')
const realmInput = ref(connArgs.realm || 'realm1')
const schemaInput = ref(connArgs.schema || 'io.xconn.schema.get')

const authTypeInput = ref(authenticationType(connArgs))
const authIdInput = ref(connArgs.authid || '')
const secretInput = ref(authenticationSecret() || '')
const alertRef = ref()

const secretPlaceholder = computed(() => {
  switch (authTypeInput.value) {
    case 'ticket':
      return 'Ticket'
    case 'cryptosign':
      return 'Public Key'
    case 'cra':
      return 'Secret'
    default:
      return ''
  }
})

const handleSubmit = async () => {
  alertRef.value = null
  response.schema = []
  await nextTick()

  const url = parseURL(routerUrl.value)
  routerUrl.value = url.toString()

  const schema_procedure = 'io.xconn.schema.get'
  try {
    const session = await store.getSession({
      url,
      realm: realmInput.value,
      authMethod: authTypeInput.value,
      authId: authIdInput.value,
      secret: secretInput.value,
    })

    const result = await session.call(connArgs.schema || schemaInput.value)

    response.schema = result.args
  } catch (error) {
    if (error.toString() === '[object Event]') alertRef.value = 'Connection error'
    else if (error.toString() === 'wamp.error.no_such_procedure')
      alertRef.value = `${error}: (${schema_procedure})`
    else alertRef.value = error
    console.error('Error: ', error)
  }

  await nextTick(async () => {
    const collapseTriggerList = document.querySelectorAll('.collapse')
    collapseTriggerList.forEach((element) => new Collapse(element))
  })
}

onMounted(async () => {
  await handleSubmit()
})
</script>

<template>
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
                  />
                </div>
                <div class="col">
                  <input
                    type="text"
                    class="form-control me-2"
                    v-model="realmInput"
                    placeholder="Realm"
                  />
                </div>
                <div class="col">
                  <input
                    type="text"
                    class="form-control me-2"
                    v-model="schemaInput"
                    placeholder="Schema URI"
                  />
                </div>
              </div>
              <br />
              <div class="row">
                <div class="col-3">
                  <select class="form-control me-2" v-model="authTypeInput">
                    <option value="anonymous">Anonymous</option>
                    <option value="ticket">Ticket</option>
                    <option value="cra">CRA</option>
                    <option value="cryptosign">CryptoSign</option>
                  </select>
                </div>
                <div class="col-3" v-show="authTypeInput !== 'anonymous'">
                  <input
                    type="text"
                    class="form-control me-2"
                    placeholder="authid"
                    required
                    v-model="authIdInput"
                  />
                </div>
                <div class="col-3" v-show="authTypeInput !== 'anonymous'">
                  <input
                    type="text"
                    class="form-control me-2"
                    :placeholder="secretPlaceholder"
                    required
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
  <main>
    <div class="container">
      <div
        class="alert alert-danger alert-dismissible fade"
        :class="{ show: alertRef }"
        role="alert"
      >
        {{ alertRef }}
      </div>
      <div class="row">
        <div class="col py-3">
          <div class="accordion accordion-flush" id="accordionExample">
            <div
              class="accordion-item border border-light-subtle my-2"
              v-for="record of response.schema"
              :key="record.uri"
            >
              <h2 class="accordion-header d-flex">
                <button
                  type="button"
                  class="btn btn-success rounded-0 text-uppercase text-start mw-25"
                  style="width: 10%; min-width: 120px"
                  data-bs-toggle="collapse"
                  :data-bs-target="`#${record.uri}`"
                  aria-expanded="true"
                  :aria-controls="`${record.uri}`"
                >
                  {{ record.type }}
                </button>
                <button
                  class="accordion-button"
                  type="button"
                  data-bs-toggle="collapse"
                  :data-bs-target="`#${record.uri}`"
                  aria-expanded="true"
                  :aria-controls="`${record.uri}`"
                >
                  {{ record.uri }}
                </button>
              </h2>
              <div :id="record.uri" class="accordion-collapse collapse show">
                <div class="accordion-body">
                  <ApiForm :record="record" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </main>
</template>
