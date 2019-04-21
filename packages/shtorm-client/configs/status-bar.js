window.__webpackStatusElem__ = document.getElementById('my-webpack-status-bar')

window.__webpackStatusColors__ = {
  ok: '#10ff00',
  errors: '#ff2020'
}

/**
 * @typedef {object} WebpackStatus
 * @prop {string} event - name of event e.g 'ok', 'invalid' 'warnings' e.t.c
 * @prop {string} color - css color from webpackStatusColors
 * @prop {number} progress - progress percentage if event is 'progress' else 100
 * @prop {string} message - a progress message e.g 'compiling', 'emitting' e.t.c
 *
 * @param {WebpackStatus} status
 * @returns {{[prop: string]: any}} - a styles property bag
 */
window.__webpackStatusStyleFunction__ = status => ({
  border: `${status.event === 'close' ? '5px' : '2px'} solid ${status.color}`,
  position: 'fixed',
  top: '0px',
  zIndex: 10000,
  width: `${status.progress}vw`,
  content: status.event,
  pointerEvents: 'none',
  transition: 'transform',
  transitionDuration: status.event === 'ok' ? '1s' : '0.1s',
  transitionDelay: status.event === 'ok' ? '2s' : '0s',
  transform: status.event === 'ok' ? 'translateY(-110%)' : 'translateY(0%)'
})

require('webpack-dev-server-status-bar')
