
import element from 'virtual-element'
import { tree, render } from 'deku'
import Loader from '../src'

const root = document.querySelector('#root')

const App = {
  initialState() {
    return { loading: true }
  },

  render({ state }) {
    return (
      <div class="App">
        <h1>loader</h1>
        <Loader isLoading={state.loading} padding="100px">
          <h2>hi! im some content that takes awhile to load.</h2>
        </Loader>
      </div>
    )
  },

  afterMount(_, __, setState) {
    setTimeout(function() {
      setState({ loading: false })
    }, 1500)
  }
}

render(tree(element(App)), root)
