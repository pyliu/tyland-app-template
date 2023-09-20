import trim from 'lodash/trim'

const empty = function(value) {
  return value === undefined || value === null || value === NaN || value === 0 ||
         (typeof value === 'object' && Object.keys(value).length === 0) ||
         (typeof value === 'string' && trim(value).length === 0)
}

const timestamp = (full = false) => {
  // e.g. 2020-12-03 10:23:00
  const now = new Date()
  const time = ('0' + now.getHours()).slice(-2) + ':' +
               ('0' + now.getMinutes()).slice(-2) + ':' +
               ('0' + now.getSeconds()).slice(-2)
  if (full) {
    return now.getFullYear() + '-' +
      ('0' + (now.getMonth() + 1)).slice(-2) + '-' +
      ('0' + now.getDate()).slice(-2) + ' ' +
      time
  }
  return time
}

const state = () => ({
  windowVisible: false,
  history: 10,
  fetchingHistory: false,
  websocket: undefined,
  timer: null
})

const getters = {
  windowVisible: state => state.windowVisible,
  websocket: state => state.websocket,
  timer: state => state.timer,
  history: state => parseInt(state.history),
  fetchingHistory: state => state.fetchingHistory
}

// only sync operation
const mutations = {
  windowVisible (state, flag) { state.windowVisible = flag },
  websocket (state, ws) {
    state.websocket && state.websocket.close()
    state.websocket = ws
  },
  timer (state, timer) {
    state.timer = timer
  },
  history (state, history) {
    state.history = parseInt(history)
  },
  fetchingHistory (state, flag) {
    state.fetchingHistory = flag
  }
}

// support async operation
const actions = {
  // Nuxt provided hook feature for Vuex, calling at server side when store initializing
  async nuxtServerInit ({ commit, dispatch }, nuxt) {
    try {
      // init once here
    } catch (e) {
      console.error(e)
    }
  }
}

export default {
  state,
  actions,
  mutations,
  getters,
  namespaced: true,
  strict: false
}
