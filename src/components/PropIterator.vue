<script setup>
import PropIterator from './PropIterator.vue'

const state = defineProps({
  requiredFields: Array,
  properties: Object,
  definations: Object,
  uri: String,
  path: String,
  updateField: Function,
  getFieldValue: Function,
})

function extractReference(ref, field) {
  const refName = ref.split('/').pop()
  const refObject = state.definations[refName]

  const currentPath = state.path ? `${state.path}.${field}` : field

  return {
    requiredFields: refObject.required,
    properties: refObject.properties,
    definations: state.definations,
    uri: state.uri,
    updateField: state.updateField,
    getFieldValue: state.getFieldValue,
    path: currentPath,
  }
}

function convertDotToBracketNotation(field) {
  const dotString = state.path ? `${state.path}.${field}` : field
  const parts = dotString.split('.')
  const base = parts.shift()
  const brackets = parts.map((part) => `[${part}]`).join('')
  return `${base}${brackets}`
}

function fieldPath(field) {
  return state.path ? `${state.path}.${field}` : field
}
</script>

<template>
  <template v-for="(value, field) in state.properties" :key="field">
    <template v-if="value.$ref">
      <h2>{{ field }}</h2>
      <PropIterator v-bind="extractReference(value.$ref, field)" />
    </template>
    <tr v-if="!value.$ref">
      <th v-if="state.requiredFields.includes(field)" class="pt-3">
        {{ convertDotToBracketNotation(field) }}
      </th>
      <td v-if="!state.requiredFields.includes(field)" class="pt-3">
        {{ convertDotToBracketNotation(field) }}
      </td>

      <td>
        <input
          type="text"
          @input="state.updateField(fieldPath(field), $event.target.value)"
          :value="state.getFieldValue(fieldPath(field))"
          :name="fieldPath(field)"
          :placeholder="state.requiredFields.includes(field) ? 'required' : ''"
          class="form-control"
          :required="state.requiredFields.includes(field)"
        />
      </td>
      <td>{{ state.uri }}</td>
      <td class="pt-3">{{ value.type }}</td>
    </tr>
  </template>
</template>
