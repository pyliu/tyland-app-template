import isEqual from 'lodash/isEqual'
import random from 'lodash/random'
import trim from 'lodash/trim'
import uniqWith from 'lodash/uniqWith'
import emojiLib from 'node-emoji'

// smileys
const faces = [
  '😀', '😃', '😄', '😁', '😆', '😅', '😂', '🤣', '😊', '😾',
  '😇', '🙂', '🙃', '😉', '😌', '😍', '🥰', '😘', '😗', '😙',
  '😚', '😋', '😛', '😝', '😜', '🤪', '🤨', '🧐', '🤓', '😎',
  '🤩', '🥳', '😏', '😒', '😞', '😔', '😟', '😕', '🙁', '☹️',
  '😣', '😖', '😫', '😩', '🥺', '😢', '😭', '😤', '😠', '😡',
  '🤬', '🤯', '😳', '🥵', '🥶', '😱', '😨', '😰', '😥', '😓',
  '🤗', '🤔', '🤭', '🤫', '🤥', '😶', '😐', '😑', '😬', '🙄',
  '😯', '😦', '😧', '😮', '😲', '🥱', '😴', '🤤', '😪', '😵',
  '🤐', '🥴', '🤢', '🤮', '🤧', '😷', '🤒', '🤕', '🤑', '🤠',
  '😈', '👿', '👹', '👺', '🤡', '💩', '👻', '💀', '☠️', '👽',
  '👾', '🤖', '🎃', '😺', '😸', '😹', '😻', '😼', '😽', '🙀',
  '😿'
]


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
  authority: {
    isAdmin: false,
    isChief: false,
    isDisabled: false,
    isRAE: false,
    isUserMgtStaff: false,
    isNotifyMgtStaff: false
  },
  apiUserinfo: {},
  userMap: {},
  userinfo: {
    address: [],
    ipv4: '',
    ipv6: '',
    userid: '',
    doamin: '',
    hostname: '',
    os: { logofile: 'Windows', kernel: '10.0.16299' },
    user: {},
    dns: []
  },
  ad: '',
  apiHost: '220.1.34.75',
  apiPort: '80',
  fePort: '8080',
  password: '',
  username: '',
  userdept: '',
  effect: '',
  history: 10,
  fetchingHistory: false,
  websocket: undefined,
  timer: null,
  imageMementoCapacity: 30,
  imageMemento: [],
  messageMementoCapacity: 30,
  messageMemento: [],
  currentChannel: 'chat',
  messages: {
    'lds': [],
    'announcement': [],
    'adm': [],
    'inf': [],
    'val': [],
    'reg': [],
    'sur': [],
    'acc': [],
    'hr': [],
    'supervisor': []
  },
  unread: {
    'lds': 0,
    'announcement': 0,
    'adm': 0,
    'inf': 0,
    'val': 0,
    'reg': 0,
    'sur': 0,
    'acc': 0,
    'hr': 0,
    'supervisor': 0
  },
  participatedChannels: [],
  connectedUsers: [],
  statusText: '',
  emojiTxt: faces[random(faces.length - 1)],
  notifySettings: {
    announcement: true,
    personal: true,
    chat: true
  },
  lastModalId: '',
  tySvrIp: new Map([
    ['H0', '220.1.33.'],
    ['HA', '220.1.34.75'],
    ['HB', '220.1.35.84'],
    ['HC', '220.1.36.14'],
    ['HD', '220.1.37.1'],
    ['HE', '220.1.38.44'],
    ['HF', '220.1.39.235'],
    ['HG', '220.1.40.62'],
    ['HH', '220.1.41.83']
  ])
})

const getters = {
  windowVisible: state => state.windowVisible,
  authority: state => state.authority,
  apiUserinfo: state => state.apiUserinfo,
  websocket: state => state.websocket,
  connected: state => state.websocket && state.websocket.readyState === 1,
  disconnected: state => empty(state.websocket) || state.websocket.readyState === 3,
  timer: state => state.timer,
  messages: state => state.messages,
  unread: state => state.unread,
  totalUnread: state => {
    try {
      // Object.values(state.unread).reduce((a, b) => a + b)
      return state.unread['lds']  // 全所聊天室
             + state.unread['announcement'] // 公告
             + state.unread[state.userinfo.userid?.toUpperCase()] // 私訊
             + state.unread[state.userdept] // 部門聊天室
    } catch {
      return 0
    }
  },
  userMap: state => state.userMap,
  userinfo: state => state.userinfo,
  username: state => state.username,
  userdept: state => state.userdept,
  domain: state => {
    let arr = state.userinfo.domain?.split('.') || []
    // remove first element that stands for the PC hostname
    arr.splice(0, 1)
    return arr.join('.')
  },
  hostname: state => state.userinfo.hostname,
  pcname: state => state.userinfo.hostname,
  userid: state => state.userinfo.userid?.toUpperCase(),
  ad: state => state.ad,
  apiHost: state => state.apiHost,
  apiPort: state => state.apiPort,
  fePort: state => state.fePort,
  password: state => state.password,  // used for activedirectory query
  os: state => state.userinfo.os,
  user: state => state.userinfo.user,
  ip: state => state.userinfo.ipv4,
  address: state => state.userinfo.address,
  currentChannel: state => String(state.currentChannel),
  currentChannelMessageCount: state => state.messages[state.currentChannel]?.length || 0,
  currentChannelName: state => {
    const channelId = String(state.currentChannel)
    switch (channelId) {
      case 'announcement': return '公告'
      case 'lds': return '全所聊天室'
      case 'inf': return '資訊課聊天室'
      case 'reg': return '登記課聊天室'
      case 'sur': return '測量課聊天室'
      case 'adm': return '行政課聊天室'
      case 'val': return '地價課聊天室'
      case 'hr': return '人事室聊天室'
      case 'acc': return '會計室聊天室'
      case 'supervisor': return '主任祕書室聊天室'
      default:
        if (channelId === state.userinfo.userid.toUpperCase()) {
          return '我的私訊'
        }
        return `無法辨識的頻道 ${channelId}`
    }
  },
  chatRooms: state => [ 'lds', 'adm', 'inf', 'val', 'reg', 'sur', 'acc', 'hr', 'supervisor' ],
  notifySettings: state => state.notifySettings,
  participatedChannels: state => state.participatedChannels,
  platform: state => `${state.userinfo.os.logofile.replace(/(^|\s)\S/g, l => l.toUpperCase())} ${state.userinfo.os.kernel}`,
  effect: state => state.effect,
  history: state => parseInt(state.history),
  fetchingHistory: state => state.fetchingHistory,

  imageMementoCapacity: state => state.imageMementoCapacity,
  imageMemento: state => state.imageMemento,
  latestImageMemento: state => state.imageMemento.length > 0 ? state.imageMemento[state.imageMemento.length - 1] : undefined,
  imageMementoCacheKey: state => 'imageMementoCached',
  
  messageMementoCapacity: state => state.messageMementoCapacity,
  messageMemento: state => state.messageMemento,
  latestMessageMemento: state => state.messageMemento.length > 0 ? state.messageMemento[state.messageMemento.length - 1] : undefined,
  messageMementoCacheKey: state => 'messageMementoCached',

  connectedUsers: state => state.connectedUsers,
  connectedUsersReverse: state => [...state.connectedUsers].reverse(),
  connectedUsersCount: state => state.connectedUsers.length,
  statusText: state => state.statusText,

  emojiTxt: state => state.emojiTxt,
  emojiCode: state => emojiLib.unemojify(state.emojiTxt),
  lastModalId: state => state.lastModalId,

  tySvrIp: state => state.tySvrIp,
  userDataCacheDuration: state => 12 * 60 * 60 * 1000,

  regexpMarkdImage: state => /!\[.+\]\(.+\)/igm,
  regexpReplyHeader: state => /^(<p>)?給.+?(<\/p>)?\n?(<hr.*\/?>|\*{3})/igm
}

// only sync operation
const mutations = {
  windowVisible (state, flag) { state.windowVisible = flag },
  authority (state, payloadObj) {
    state.authority = { ...state.authority, ...payloadObj }
  },
  apiUserinfo (state, payloadObj) {
    state.apiUserinfo = { ...state.apiUserinfo, ...payloadObj }
  },
  websocket (state, ws) {
    state.websocket && state.websocket.close()
    state.websocket = ws
  },
  timer (state, timer) {
    state.timer = timer
  },
  userMap (state, data) {
    state.userMap = { ...data }
  },
  userinfo (state, userinfo) {
    state.userinfo = { ...userinfo }
  },
  userid (state, id) {
    state.userinfo = { ...state.userinfo, userid: id }
  },
  username (state, username) {
    state.username = username
  },
  userdept (state, userdept) {
    state.userdept = userdept
  },
  ad (state, ip) {
    state.ad = ip
  },
  apiHost (state, host) {
    state.apiHost = host
  },
  apiPort (state, port) {
    state.apiPort = port
  },
  fePort (state, port) {
    state.fePort = port
  },
  password (state, password) {
    state.password = password
  },
  effect (state, effect) {
    state.effect = effect
  },
  history (state, history) {
    state.history = parseInt(history)
  },
  notifySettings (state, opts) {
    state.notifySettings = { ...state.notifySettings, ...opts }
  },
  fetchingHistory (state, flag) {
    state.fetchingHistory = flag
  },
  currentChannel(state, currentChannel) {
    state.currentChannel = currentChannel
  },
  addChannel (state, channel) {
    if (!empty(channel)) {
      state.messages = { ...state.messages, ...{ [channel]: [] } }
      this.$config.isDev && console.log(timestamp(), `新增/重設 ${channel} message 頻道到 store。 [Vuex::addChannel]`, state.messages)
    }
  },
  resetUnreadAll (state) {
    Object.keys(state.unread).map(key => {
      state.unread[key] = 0
    })
  },
  resetUnread (state, channel) {
    if (!empty(channel)) {
      state.unread = { ...state.unread, ...{ [channel]: 0 } }
      this.$config.isDev && console.log(timestamp(), `新增/重設 ${channel} unread 頻道到 store。 [Vuex::resetUnread]`, state.unread)
    }
  },
  plusUnread (state, channel) {
    if (!empty(channel)) {
      if (typeof state.unread[channel] !== 'number') {
        state.unread = { ...state.unread, ...{ [channel]: 0 } }
        this.$config.isDev && console.log(timestamp(), `新增/重設 ${channel} unread 頻道到 store。 [Vuex::plusUnread]`, state.unread)
      }
      state.unread[channel]++
      this.$config.isDev && console.log(timestamp(), `${channel} 頻道未讀計數增為 ${state.unread[channel]}。 [Vuex::plusUnread]`, state.unread)
    }
  },
  setUnread (state, payload) {
    const channel = payload.channel
    const count = payload.count
    if (!empty(channel)) {
      if (typeof state.unread[channel] !== 'number') {
        state.unread = { ...state.unread, ...{ [channel]: 0 } }
        this.$config.isDev && console.log(timestamp(), `新增/重設 ${channel} unread 頻道到 store。 [Vuex::plusUnread]`, state.unread)
      }
      state.unread[channel] = count
      this.$config.isDev && console.log(timestamp(), `${channel} 頻道未讀計數增為 ${state.unread[channel]}。 [Vuex::plusUnread]`, state.unread)
    }
  },
  resetParticipatedChannel (state) {
    state.participatedChannels.length = 0
  },
  addParticipatedChannel (state, channelPayload) {
    if (channelPayload.id && channelPayload.name) {
      const found = state.participatedChannels.find(ch => ch.id === channelPayload.id)
      if (!found) {
        state.participatedChannels = [ ... state.participatedChannels, channelPayload ]
      }
      // add/reset to messages list as well
      state.messages = { ...state.messages, ...{ [channelPayload.id]: [] } }
    } else {
      this.$config.isDev && console.log(timestamp(), `[addParticipatedChannel] channelPayload is not correct`, channelPayload)
    }
  },
  removeParticipatedChannel (state, channelPayload) {
    if (channelPayload.id) {
      state.participatedChannels = [ ...state.participatedChannels.filter(item => item.id !== channelPayload.id)]
      // remove the channel
      !delete state.messages[[channelPayload.id]] && this.$config.isDev && console.log(timestamp(), `[removeParticipatedChannel] delete ${channelPayload.id} failed`, channelPayload)
    } else {
      this.$config.isDev && console.log(timestamp(), `[removeParticipatedChannel] channelPayload is not correct`, channelPayload)
    }
  },
  imageMementoCapacity (state, capacity) { state.imageMementoCapacity = parseInt(capacity) || 30 },
  imageMemento (state, arr) {
    if (Array.isArray(arr)) {
      state.imageMemento = [...arr]
    }
  },
  addImageMemento (state, base64data) {
    this.$config.isDev && console.log(timestamp(), `新增 image data 到 store。 [Vuex::addImageMemento]`)
    if (state.imageMemento.length >= state.imageMementoCapacity) {
      const removed = state.imageMemento.shift()
      this.$config.isDev && console.log(timestamp(), `移除最早的 image data。 [Vuex::addImageMemento]`)
      state.imageMemento.length = state.imageMementoCapacity
    }
    state.imageMemento.push(base64data)
    // remove duplication
    state.imageMemento = [...uniqWith(state.imageMemento, isEqual)]
    this.$config.isDev && console.log(timestamp(), `現在暫存 image data 數量為 ${state.imageMemento.length}。 [Vuex::addImageMemento]`)
  },
  messageMementoCapacity (state, capacity) { state.messageMementoCapacity = parseInt(capacity) || 30 },
  messageMemento (state, arr) {
    if (Array.isArray(arr)) {
      state.messageMemento = [...arr]
    }
  },
  addMessageMemento (state, data) {
    this.$config.isDev && console.log(timestamp(), `新增 message data 到 store。 [Vuex::addMessageMemento]`, data)
    if (state.messageMemento.length >= state.messageMementoCapacity) {
      const removed = state.messageMemento.shift()
      this.$config.isDev && console.log(timestamp(), `移除最早的 message data。 [Vuex::addMessageMemento]`, removed)
      state.messageMemento.length = state.messageMementoCapacity
    }
    state.messageMemento.push(data)
    // remove duplication
    state.messageMemento = [...state.messageMemento.filter(function(item, pos) {
        return state.messageMemento.indexOf(item) == pos;
    })]
    this.$config.isDev && console.log(timestamp(), `現在暫存 message data 數量為 ${state.messageMemento.length}。 [Vuex::addMessageMemento]`)
  },
  connectedUsers (state, array) {
    state.connectedUsers = [...array]
  },
  statusText (state, string) {
    state.statusText = string
  },
  lastModalId (state, id) {
    state.lastModalId = id
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
  },
  async resetUnread ({ commit, getters }, channel) {
    commit('resetUnread', channel)
  },
  async plusUnread ({ commit, getters }, channel) {
    commit('plusUnread', channel)
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
