<script setup>
import { reactive } from 'vue'
import { defaultTo, pathOr, isEmpty, omit, reject, pipe } from 'ramda'
import { set, get } from 'lodash'
import { useSessionStore } from '@/stores/session'
import hljs from 'highlight.js/lib/core'
import json from 'highlight.js/lib/languages/javascript'
import PropIterator from './PropIterator.vue'
hljs.registerLanguage('json', json)

const store = useSessionStore()

const props = defineProps({
  record: {},
})

const state = reactive({
  inModel: defaultTo({ properties: {} }, props.record.in_model),
  outModel: defaultTo({ properties: {} }, props.record.out_model),
  requiredFields: pathOr([], ['in_model', 'required'], props.record),
  formParams: {},
  callResponse: [],
})

const createArgsKwargs = () => {
  const formParams = state.formParams
  const args = state.requiredFields.map((field) => formParams[field])
  const kwargs = omit(state.requiredFields, formParams)
  const result = {}
  if (!isEmpty(args)) result['args'] = args
  if (!isEmpty(kwargs)) result['kwargs'] = kwargs

  return result
}

function updateField(path, value) {
  set(state.formParams, path, value)
}

function getFieldValue(path) {
  return get(state.formParams, path)
}

const filterResponse = pipe(defaultTo({}), reject(isEmpty))

function stringifyWithBigInt(obj) {
  return JSON.stringify(
    obj,
    (_, value) => (typeof value === 'bigint' ? value.toString() + 'n' : value),
    2,
  )
}

const handleSubmit = async (event) => {
  const form = event.target
  event.preventDefault()
  event.stopPropagation()

  if (!form.checkValidity()) {
    form.classList.add('was-validated')
  } else {
    form.classList.remove('was-validated')
    const { uri, type } = props.record
    const session = await store.session
    state.callResponse = []

    if (type === 'procedure') {
      const response = await session.call(uri, createArgsKwargs())
      state.callResponse = hljs.highlight(stringifyWithBigInt(filterResponse(response), null, 2), {
        language: 'json',
      }).value
    } else if (type === 'topic') {
      const response = await session.publish(uri, createArgsKwargs())
      state.callResponse = hljs.highlight(stringifyWithBigInt(filterResponse(response), null, 2), {
        language: 'json',
      }).value
    }
  }
}
</script>

<template>
  <form action="" class="needs-validation" novalidate @submit.prevent="handleSubmit">
    <table class="table table-borderless" v-if="!isEmpty(state.inModel.properties)">
      <thead>
        <tr>
          <th scope="col">Parameter</th>
          <th scope="col">Value</th>
          <th scope="col">Description</th>
          <th scope="col">Data Type</th>
        </tr>
      </thead>

      <tbody class="table-group-divider-forced">
        <tr>
          <td></td>
          <td></td>
          <td></td>
          <td></td>
        </tr>
        <PropIterator
          :requiredFields="state.requiredFields"
          :properties="state.inModel.properties"
          :definations="state.inModel.$defs"
          :uri="props.record.uri"
          :updateField="updateField"
          :getFieldValue="getFieldValue"
          path=""
        />
      </tbody>
    </table>

    <div class="container">
      <div class="row">
        <div class="col">
          <div class="fs-4 mb-4" v-if="!isEmpty(state.callResponse)">Response</div>
          <pre><code class="language-html" v-html="state.callResponse"></code></pre>
        </div>
      </div>
    </div>

    <button type="submit" class="btn btn-primary">
      {{ props.record.type == 'procedure' ? 'Call' : 'Publish' }}
    </button>
  </form>
</template>
