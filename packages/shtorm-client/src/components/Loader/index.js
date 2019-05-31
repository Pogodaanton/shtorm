import Loadable from 'react-loadable'
import FullscreenSpinner from '../Spinners/FullscreenLoadable'

const DefaultLoader = (path, customProgress = false) => {
  return Loadable({
    loader: () => import('../' + path),
    loading: customProgress || FullscreenSpinner
  })
}

const ContextLoader = (path, customProgress = false) => {
  return Loadable({
    loader: () => import('../../contexts/' + path),
    loading: customProgress || FullscreenSpinner
  })
}

export { DefaultLoader as default, ContextLoader }
