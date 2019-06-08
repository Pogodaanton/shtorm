import Loadable from 'react-loadable'
import FullscreenSpinner from '../Spinners/FullscreenLoadable'

const DefaultLoader = (importCode, customProgress = false) => {
  return Loadable({
    loader: () => importCode,
    loading: customProgress || FullscreenSpinner
  })
}

export { DefaultLoader as default }
