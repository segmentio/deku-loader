
/**
 * Module dependencies.
 */

import element from 'virtual-element'

/**
 * Exports.
 */

export default { render }

/**
 * Render.
 */

function render({ props }) {
  const { isLoading, children} = props
  if (!isLoading) return <div>{children}</div>
  return (
    <div class="Loader">
      <div class="LoaderSpinner" />
    </div>
  )
}
