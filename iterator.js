function* flattenSchema(schema, basePath = '') {
  const { properties, $defs: defs } = schema.in_model
  const visited = new Set()

  function* iterateProps(props, path) {
    for (const [key, value] of Object.entries(props)) {
      const currentPath = path ? `${path}:${key}` : key

      if (value.$ref) {
        const refName = value.$ref.split('/').pop() // Extract "Address" from "#/$defs/Address"
        const refObj = defs[refName]

        if (refObj && !visited.has(value.$ref)) {
          visited.add(value.$ref)

          yield* iterateProps(props, currentPath)

          visited.delete(value.$ref)
        }
      } else {
        yield { path: currentPath, key, value, type: 'property' }
      }
    }
  }

  yield* iterateProps(properties, basePath)
}
