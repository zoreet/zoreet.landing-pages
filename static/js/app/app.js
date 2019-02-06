Vue.component('task', {
  props: {
    task: Object,
    last: Boolean,
    autofocus: Boolean
  },
  template: `
  <div class="task" :class="{active: task.done}">
    <div class="task-checkbox" @click="toggleTask"></div>
    <textarea
      class="task-input"
      type="text"
      v-model="task.title"
      @change="updateHeight"
      @keydown="updateHeight"
      @blur="doneEdit"
      @focus="editTask"
      @keydown.backspace="removeTask"
      @keydown.enter.prevent="doneEditWithEnter"
      @keyup.escape="cancelEdit"
      @paste="paste"
    ></textarea>
    <div class="task-label">
      {{ task.title }}
    </div>
  </div>
  `,
  mounted() {
    this.input = this.$el.querySelector('.task-input')
    this.label = this.$el.querySelector('.task-label')

    if (this.last) {
      document.getElementById('add-task').focus()
    } else if (this.autofocus) {
      this.input.focus()
    }

    this.updateHeight()
  },
  data() {
    return {
      beforeEditCache: '',
      input: null,
      label: null
    }
  },
  methods: {
    editTask() {
      this.beforeEditCache = this.task.title
    },
    doneEdit() {
      this.task.title = this.task.title.trim()

      if (this.task.title !== this.beforeEditCache) {
        this.$emit('done-edit')
      }
      this.beforeEditCache = ''
    },
    doneEditWithEnter() {
      this.$emit('done-edit-with-enter')
    },
    cancelEdit() {
      this.task.title = this.beforeEditCache
      this.input.blur()
    },
    removeTask() {
      if (this.task.title.length == 0) {
        this.$emit('remove-task')
      }
      // this.updateHeight()
    },
    toggleTask() {
      this.task.done = !this.task.done
      this.$emit('toggle-task')
    },
    updateHeight() {
      this.$nextTick(() => {
        // this get's fired too soon, but having it prevents some flickering
        setTimeout(() => {
          // it's stupid, I know, but this is the only way I could get the textarea and div in sync
          this.input.style.height = this.label.offsetHeight + 'px'
        }, 10)
      })
    },
    paste() {
      setTimeout(() => {
        this.updateHeight()
      }, 50)
    }
  },
  watch: {
    autofocus() {
      this.input.focus()
    }
  }
})

/* ------------------------------------------------------------------------- */
/* ------------------------------------------------------------------------- */
/* ------------------------------------------------------------------------- */
/* ------------------------------------------------------------------------- */
/* ------------------------------------------------------------------------- */
/* ------------------------------------------------------------------------- */
/* ------------------------------------------------------------------------- */
/* ------------------------------------------------------------------------- */
/* ------------------------------------------------------------------------- */
/* ------------------------------------------------------------------------- */

Vue.component('newtask', {
  props: {
    fromtoday: Number
  },
  template: `
  <div class="task add-task">
    <div class="task-checkbox --add"></div>
    <textarea
      class="task-input"
      type="text"
      id="add-task"
      :placeholder="addTaskPlaceholder"
      v-model="newTaskTitle"
      @change="updateHeight"
      @keydown="updateHeight"
      @keydown.enter.prevent="doneEdit"
      @keyup.escape="cancelEdit"
      @paste="paste"
      v-focus.lazy="true"
    ></textarea>
    <div class="task-label">
      {{ newTaskTitle }}
    </div>
  </div>
  `,
  computed: {
    addTaskPlaceholder() {
      if (this.fromtoday < 0) {
        return 'Stuff I did'
      }
      if (this.fromtoday <= 1) {
        return ' I will...'
      }

      return 'On this day I will...'
    }
  },
  data() {
    return {
      newTaskTitle: ''
    }
  },
  mounted() {
    this.input = this.$el.querySelector('.task-input')
    this.label = this.$el.querySelector('.task-label')

    this.updateHeight()
  },
  directives: {
    focus: {
      inserted: function(el) {
        el.focus()
      }
    }
  },
  methods: {
    doneEdit() {
      this.newTaskTitle = this.newTaskTitle.trim()

      if (this.newTaskTitle.length) {
        this.$emit('add-task', this.newTaskTitle)
        this.newTaskTitle = ''
      }
    },
    cancelEdit() {
      this.newTaskTitle = ''
      this.input.blur()
    },
    updateHeight() {
      this.$nextTick(() => {
        // this get's fired too soon, but having it prevents some flickering
        setTimeout(() => {
          // it's stupid, I know, but this is the only way I could get the textarea and div in sync
          this.input.style.height = this.label.offsetHeight + 'px'
        }, 10)
      })
    },
    paste() {
      setTimeout(() => {
        this.updateHeight()
      }, 50)
    }
  }
})

/* ------------------------------------------------------------------------- */
/* ------------------------------------------------------------------------- */
/* ------------------------------------------------------------------------- */
/* ------------------------------------------------------------------------- */
/* ------------------------------------------------------------------------- */
/* ------------------------------------------------------------------------- */
/* ------------------------------------------------------------------------- */
/* ------------------------------------------------------------------------- */
/* ------------------------------------------------------------------------- */
/* ------------------------------------------------------------------------- */

let app = new Vue({
  el: '#app',
  data: {
    user: {},
    token: '',
    isLoading: false,
    showMenu: false,
    focusedIndex: 0,
    date:
      localStorage.getItem('current-date') ||
      moment(Date.now()).format('YYYYMMDD'),
    today: moment(Date.now()).format('YYYYMMDD'),
    yesterday: moment(Date.now())
      .subtract(1, 'days')
      .format('YYYYMMDD'),
    tomorrow: moment(Date.now())
      .add(1, 'days')
      .format('YYYYMMDD'),
    tasks: [],
    online: true,
    error: '',
    webAuth: null
  },
  mounted: function() {
    this.online = navigator.onLine
    window.addEventListener('offline', () => {
      this.online = false
    })
    window.addEventListener('online', () => {
      this.online = true
    })

    this.webAuth = new auth0.WebAuth({
      domain: 'todayapp.eu.auth0.com',
      clientID: 'Zz9d2EICFe1981TC5Ym7dfva9Y1jECmP',
      responseType: 'token id_token',
      scope: 'openid email profile',
      redirectUri: window.location.origin + '/auth.html',
      audience: 'todayapp'
    })

    this.checkLogin()
    document.querySelector('body').classList.remove('loading')
  },
  computed: {
    dateForPicker: {
      get: function() {
        return moment(this.date).format('YYYY-MM-DD')
      },
      set: function(newDate) {
        this.date = moment(newDate).format('YYYYMMDD')
      }
    },
    dateTitle() {
      if (this.date === this.today) {
        return 'Today'
      } else if (this.date === this.tomorrow) {
        return 'Tomorrow'
      } else if (this.date === this.yesterday) {
        return 'Yesterday'
      } else {
        return moment(this.date).format('DD MMM Y')
      }
    },
    dateSubtitle() {
      currentDate = moment(this.date)
      if (this.date === this.today) {
        return currentDate.format('dddd, DD MMM Y')
      } else if (this.date === this.tomorrow) {
        return currentDate.format('dddd, DD MMM Y')
      } else if (this.date === this.yesterday) {
        return currentDate.format('dddd, DD MMM Y')
      } else {
        return currentDate.format('dddd')
      }
    },
    fromtoday() {
      let date = moment(this.date)
      let now = moment(this.today)

      return date.diff(now, 'days')
    },
    doneTasks() {
      return this.tasks.filter(task => {
        return task.done
      })
    },
    unfinishedTasks() {
      return this.tasks.filter(task => {
        return !task.done
      })
    }
  },
  methods: {
    // ////////////////////////////////////////////////////////////
    //
    // NAVIGATION
    //
    // ////////////////////////////////////////////////////////////
    jumpToToday() {
      this.date = this.today
      sessionStorage.removeItem('activeSession')
      this.getTasks()
    },
    jumpToTomorrow() {
      this.date = this.tomorrow
      this.getTasks()
    },
    jumpToYesterday() {
      this.date = this.yesterday
      this.getTasks()
    },
    jumpToDay() {
      this.date = this.dateForPicker.replace(/\-/g, '')
      this.getTasks()
    },
    jumpToPrevDay() {
      this.date = moment(this.date)
        .subtract(1, 'days')
        .format('YYYYMMDD')
      this.getTasks()
    },
    jumpToNextDay() {
      this.date = moment(this.date)
        .add(1, 'days')
        .format('YYYYMMDD')
      this.getTasks()
    },
    toggleMenu() {
      this.showMenu = !this.showMenu
    },

    // ////////////////////////////////////////////////////////////
    //
    // NETWORK
    //
    // ////////////////////////////////////////////////////////////
    getTasks() {
      this.isLoading = true
      if (!navigator.onLine) {
        return
      }
      axios
        .get('https://api.zoreet.com/days/' + this.date, {
          headers: { Authorization: 'Bearer ' + this.token }
        })
        .then(response => {
          let rawTasks = response.data.day.tasks
          let tasks

          this.showMenu = false
          this.isLoading = false
          this.error = ''

          try {
            tasks = JSON.parse(rawTasks)
            this.tasks = tasks
          } catch (e) {
            this.tasks = rawTasks
              .replace(/<br>/g, '')
              .replace(/\<div class\=\"\s*[a-z]*\s*\"\>\s*\<\/div\>/g, '') // empty divs
              .split('</div>')
              .filter(task => task.length)
              .map((task, index) => {
                let done = task.indexOf('<div class="active">') !== -1
                let title = task.trim().replace(/(<([^>]+)>)/gi, '') // all tags
                let id = parseInt(this.date) + index

                return {
                  id: id,
                  title: title,
                  done: done
                }
              })
              .filter(task => task.title.length)
          }
        })
        .catch(error => {
          let code = error.response.status
          let message = error.response.data.error.message

          this.error = message
        })
    },
    saveTasks() {
      if (!navigator.onLine) {
        return
      }

      axios
        .post(
          'https://api.zoreet.com/days/' + this.date,
          { tasks: JSON.stringify(this.tasks) },
          { headers: { Authorization: 'Bearer ' + this.token } }
        )
        .then(response => {
          this.error = ''
        })
        .catch(error => {
          let code = error.response.status
          let message = error.response.data.error.message

          this.error = message
        })
    },

    // ////////////////////////////////////////////////////////////
    //
    // TASKS
    //
    // ////////////////////////////////////////////////////////////
    addTask(title) {
      if (title.trim() == '') {
        return
      }
      let id = new Date().getTime()
      this.tasks.push({
        id: id,
        title: title,
        done: false
      })

      document.getElementById('add-task').focus()
      this.saveTasks()
    },
    addTaskAtIndex(index) {
      if (index < this.tasks.length - 1) {
        let id = new Date().getTime()
        this.tasks.splice(index + 1, 0, {
          id: new Date().getTime(),
          title: '',
          done: false
        })
        this.saveTasks()
      } else {
        document.getElementById('add-task').focus()
      }
    },
    removeTask(index) {
      this.tasks.splice(index, 1)
      this.saveTasks()
      if (index) {
        this.focusedIndex = index - 1
      } else if (this.tasks.length == 0) {
        document.getElementById('add-task').focus()
      }
    },
    sortTasks() {
      this.tasks = this.tasks.sort(function(b, a) {
        if (a.done && !b.done) {
          return -1
        }

        return 0
      })

      this.saveTasks()
    },

    // ////////////////////////////////////////////////////////////
    //
    // USER
    //
    // ////////////////////////////////////////////////////////////
    checkLogin() {
      let expiresAt = parseInt(localStorage.getItem('expires_at'))
      let now = new Date().getTime()
      this.token = localStorage.getItem('access_token')

      if (this.token && expiresAt && now < expiresAt) {
        this.user = JSON.parse(localStorage.getItem('user'))
        this.getTasks()
        sessionStorage.setItem('activeSession', true)

        let expiresIn = expiresAt - now
        this.scheduleRenewal(expiresIn)
      } else {
        this.login()
      }
    },
    login() {
      this.webAuth.authorize()
    },
    silentLogin() {
      let that = this
      this.webAuth.checkSession({}, function(err, result) {
        if (err) {
          that.error = err
        } else {
          that.error = ''
          that.token = result.accessToken
          that.saveLoginData(result)
          that.scheduleRenewal(result.expiresIn * 1000)
        }
      })
    },
    scheduleRenewal(expiresIn) {
      if (!expiresIn) return

      window.setTimeout(() => {
        this.silentLogin()
      }, expiresIn)
    },
    saveLoginData(result) {
      var expiresAt = new Date().getTime() + result.expiresIn * 1000
      var user = JSON.stringify({
        email: result.idTokenPayload.email,
        nickname: result.idTokenPayload.nickname
      })

      localStorage.setItem('access_token', result.accessToken)
      localStorage.setItem('id_token', result.idToken)
      localStorage.setItem('expires_at', expiresAt)
      localStorage.setItem('user', user)
    },
    logout() {
      document.querySelector('body').classList.add('loading')

      localStorage.removeItem('access_token')
      localStorage.removeItem('id_token')
      localStorage.removeItem('expires_at')
      localStorage.removeItem('user')
      localStorage.removeItem('user')
      sessionStorage.removeItem('activeSession')

      // log out to Auth0 ( and if needed google, facebook or whatever id provider they used )
      let iframe = document.createElement('iframe')
      iframe.src = 'https://todayapp.eu.auth0.com/v2/logout'
      iframe.style.display = 'none'
      document.body.appendChild(iframe)

      window.setTimeout(() => {
        window.top.location.href = '/'
      }, 2000)
    }
  },
  watch: {
    date: function() {
      localStorage.setItem('current-date', this.date)
    }
  }
})
