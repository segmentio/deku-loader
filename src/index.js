
/**
 * Module dependencies.
 */

import element from 'magic-virtual-element'
import px from 'add-px'

/**
 * Exports.
 */

export default { render }

/**
 * Render.
 */

function render({ props }) {
  const { isLoading, children, padding } = props
  const style = {
    height: px(padding || 0)
  }
  if (!isLoading) return <div>{children}</div>
  return (
    <div class="Loader">
      <div style={style} />
      <div class="LoaderSpinner" />
    </div>
  )
}
