<script setup>
import ApiForm from './components/ApiForm.vue'
import TopHeader from './components/TopHeader.vue'
import { useSessionStore } from './stores/session'
const store = useSessionStore()
</script>

<template>
  <TopHeader />
  <main>
    <div class="container">
      <div
        class="alert alert-danger alert-dismissible fade"
        :class="{ show: store.connectionError }"
        role="alert"
      >
        {{ store.connectionError }}
      </div>
      <div class="row">
        <div class="col py-3">
          <div class="accordion accordion-flush" id="accordionExample">
            <div
              class="accordion-item border border-light-subtle my-2"
              v-for="record of store.apis"
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
