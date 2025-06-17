<script setup>
import { Collapse } from 'bootstrap'
import { parseURL } from './utils/parseUrl'
import ApiForm from './components/ApiForm.vue'
import { reactive, onMounted, nextTick, ref } from 'vue'
import { useSessionStore } from './stores/session'

const store = useSessionStore()

const response = reactive({ schema: [] })

const routerUrl = ref('ws://localhost:8080/ws')

const handleSubmit = async () => {
  response.schema = []
  await nextTick()

  const url = parseURL(routerUrl.value)
  routerUrl.value = url.toString()

  const session = await store.getSession({ host: url.hostname, port: url.port, realm: 'realm1' })
  const result = await session.call('io.xconn.schema.get')
  response.schema = result.args
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
  <header>
    <nav class="navbar navbar-expand-lg bg-body-tertiarky">
      <div class="container-fluid justify-content-center">
        <form class="d-flex justify-content-center w-25" @submit.prevent="handleSubmit">
          <input type="text" class="form-control me-2" v-model="routerUrl" />
          <button class="btn btn-outline-success" type="submit">Explore</button>
        </form>
      </div>
    </nav>
  </header>
  <main>
    <div class="container">
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
