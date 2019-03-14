Vue.component('task', {
  props: {
    task: Object,
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

    this.label.style.width = this.input.offsetWidth + 'px'

    this.updateHeight()

    if (this.autofocus) {
      this.input.focus()
      this.input.setSelectionRange(
        this.input.value.length,
        this.input.value.length
      )
    }
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
    removeTask(e) {
      if (this.task.title.length == 0) {
        e.preventDefault()
        // preventDefault alone didn't work on iOS safari
        // this does :)
        setTimeout(() => {
          this.$emit('remove-task')
        }, 10)
      }
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
      this.input.setSelectionRange(
        this.input.value.length,
        this.input.value.length
      )
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

Vue.component('month', {
  props: {
    date: String,
    today: String
  },
  template: `
    <div class="month">
      <div class="month--header">
        <div class="month--pagination" @click="prevMonth"></div>
        <div class="month--title">
          {{title}}
        </div>
        <div class="month--pagination" @click="nextMonth"></div>
      </div>
      <div class="month--days weekdays">
        <div class="month--day">M</div>
        <div class="month--day">T</div>
        <div class="month--day">W</div>
        <div class="month--day">T</div>
        <div class="month--day">F</div>
        <div class="month--day">S</div>
        <div class="month--day">S</div>
      </div>
      <div class="month--days">
        <div v-for="day in days"
          class="month--day"
          :class="{
            active: ( day.date == date ),
            today: ( day.date == today )
          }"
        >
          <span class="month--day--label" @click="changeDate(day.date)" v-if="day.id">
            {{day.id}}
          </span>
        </div>
      </div>
    </div>
  `,
  created() {
    this.generateData()
  },
  data() {
    return {
      visibleDateInCalendar: moment(this.date).format('YYYYMMDD'),
      days: []
    }
  },
  computed: {
    title() {
      return moment(this.visibleDateInCalendar).format('MMMM YYYY')
    },
    lastDay() {
      let day = moment(this.visibleDateInCalendar)
        .endOf('month')
        .format('DD')

      day = parseInt(day)

      if (day) return day
      return null
    }
  },
  methods: {
    generateData() {
      let days = [...Array(this.lastDay).keys()]
      this.days = days.map(day => {
        return {
          id: day + 1,
          date: moment(this.visibleDateInCalendar)
            .set('date', day + 1)
            .format('YYYYMMDD')
        }
      })
      // hack so that I can align the first day so it coresponds to the right day of the week
      let i =
        moment(this.days[0].date)
          .startOf('month')
          .isoWeekday() - 1
      for (; i > 0; i--) {
        this.days.unshift({
          id: 0,
          date: null
        })
      }
    },
    changeDate(day) {
      this.$emit('jump-to-day', day)
    },
    prevMonth() {
      this.visibleDateInCalendar = moment(this.visibleDateInCalendar)
        .subtract(1, 'months')
        .format('YYYYMMDD')
      this.generateData()
    },
    nextMonth() {
      this.visibleDateInCalendar = moment(this.visibleDateInCalendar)
        .add(1, 'months')
        .format('YYYYMMDD')
      this.generateData()
    }
  },
  watch: {
    date(newDate, oldDate) {
      if (moment(newDate).get('month') !== moment(oldDate).get('month'))
        this.visibleDateInCalendar = newDate
      this.generateData()
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
    focusedTask: null,
    activeTab: '',
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
    // alert(document.querySelector('#app').offsetHeight)
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

    document.addEventListener(
      'touchmove',
      function(e) {
        if (e.target == document.body) e.preventDefault()
      },
      { passive: false }
    )
  },
  computed: {
    dateTitle() {
      return moment(this.date).format('DD MMM Y')
    },
    dateSubtitle() {
      return moment(this.date).format('dddd')
    },
    unfinishedTasksTitle() {
      if (this.date === this.today) {
        return 'Today I will...'
      } else if (this.date === this.tomorrow) {
        return 'Tomorrow I will...'
      } else if (this.inThePast) {
        return 'The rest'
      } else {
        return 'I will...'
      }
    },
    doneTasksTitle() {
      if (this.date === this.yesterday) {
        return 'Yesterday I did'
      } else if (this.inThePast) {
        return 'I did'
      } else {
        return 'Completed'
      }
    },
    fromtoday() {
      let date = moment(this.date)
      let now = moment(this.today)

      return date.diff(now, 'days')
    },
    inThePast() {
      return this.fromtoday < 0
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
    },
    prevDay() {
      let prev = moment(this.date).subtract(1, 'days')
      if (this.date == this.today) return 'Yesterday'
      if (this.date == this.tomorrow) return 'Today'
      return prev.format('DD MMMM')
    },
    nextDay() {
      let prev = moment(this.date).add(1, 'days')
      if (this.date == this.today) return 'Tomorrow'
      if (this.date == this.yesterday) return 'Today'
      return prev.format('DD MMMM')
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
      this.activeTab = ''
      this.getTasks()
    },
    jumpToToday() {
      this.date = this.today
      sessionStorage.removeItem('activeSession')
      this.activeTab = ''
      this.getTasks()
    },
    jumpToTomorrow() {
      this.date = this.tomorrow
      this.activeTab = ''
      this.getTasks()
    },
    jumpToYesterday() {
      this.date = this.yesterday
      this.activeTab = ''
      this.getTasks()
    },
    jumpToDay(newDate) {
      if (newDate == -1) {
        this.date = moment(this.date)
          .subtract(1, 'days')
          .format('YYYYMMDD')
      } else if (newDate == 1) {
        this.date = moment(this.date)
          .add(1, 'days')
          .format('YYYYMMDD')
      } else {
        this.date = newDate
      }
      this.activeTab = ''
      this.getTasks()
    },
    toggleMenu(menuid) {
      if (this.activeTab == menuid) {
        this.activeTab = ''
      } else {
        this.activeTab = menuid
      }
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
            this.sortTasks()

            if (this.tasks.length == 0) {
              this.addEmptyTask()
            }
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
            this.sortTasks()
          }
        })
        .catch(error => {
          let code = error.response.status
          let message = error.response.data.error.message

          if (message.indexOf('expired') >= 0) {
            this.silentLogin()
          }

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

          if (message.indexOf('expired') >= 0) {
            this.silentLogin()
          }

          this.error = message
        })
    },

    // ////////////////////////////////////////////////////////////
    //
    // TASKS
    //
    // ////////////////////////////////////////////////////////////
    addTask(title, done) {
      if (title.trim() == '') {
        return
      }
      if (!done) {
        done == false
      }
      let id = new Date().getTime()
      this.tasks.push({
        id: id,
        title: title,
        done: done
      })

      this.saveTasks()
    },
    addEmptyTask() {
      let newId = new Date().getTime()
      this.tasks.push({
        id: newId,
        title: '',
        done: this.inThePast
      })
      this.focusedTask = newId
    },
    addTaskAfterID(id) {
      // i first save the existing tasks
      this.saveTasks()

      // and then I add the new one
      // so I don't end up with an empty task if the user doesn't input anything
      let index = this.findTaskById(id)
      let newId = new Date().getTime()

      this.tasks.splice(index + 1, 0, {
        id: newId,
        title: '',
        done: this.tasks[index].done
      })
      this.$nextTick(function() {
        this.focusedTask = newId
      })
    },
    findTaskById(id) {
      for (var i = 0; i < this.tasks.length; i++) {
        if (this.tasks[i].id === id) {
          return i
        }
      }
    },
    removeTask(id) {
      let index = this.findTaskById(id)
      this.tasks.splice(index, 1)
      this.saveTasks()
      if (index) {
        this.focusedTask = this.tasks[index - 1].id
      }

      if (this.tasks.length == 0) {
        this.addEmptyTask()
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
      let expiresIn = expiresAt - now
      this.token = localStorage.getItem('access_token')

      if (this.token && expiresAt && now < expiresAt) {
        this.user = JSON.parse(localStorage.getItem('user'))
        this.getTasks()
        sessionStorage.setItem('activeSession', true)

        this.scheduleRenewal(expiresIn)

        let that = this
        window.onfocus = function() {
          let now = new Date().getTime()
          if (expiresAt < now) {
            that.silentLogin()
          }
        }
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
