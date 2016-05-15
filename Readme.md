
# deku-loader

[![Circle CI](https://circleci.com/gh/segmentio/deku-loader.svg?style=svg)](https://circleci.com/gh/segmentio/deku-loader)

Show a loading indicator while you're loading things.

## Example

```js

import Loader from '@segment/deku-loader'

const App = {
  initialState() {
    return { data: null }
  },

  render({ state }) {
    return (
      <div class="App">
        <h1>loader</h1>
        <Loader isLoading={state.data}>
          <p>{state.data}</p>
        </Loader>
      </div>
    )
  },

  afterMount(_, __, setState) {
    fetch('/api/data')
      .then(r => r.json())
      .then(data => setState({ data }))
  }
}
```
