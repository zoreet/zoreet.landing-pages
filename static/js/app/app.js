let app = new Vue({
  el: '#app',
  data: {
    user: {},
    token: '',
    isLoading: false,
    showMenu: false,
    beforeEditCache: '',
    newTask: '',
    date: localStorage.getItem('current-date') || moment(Date.now()).format('YYYYMMDD'),
    today: moment(Date.now()).format('YYYYMMDD'),
    yesterday: moment(Date.now()).subtract(1, 'days').format('YYYYMMDD'),
    tomorrow: moment(Date.now()).add(1, 'days').format('YYYYMMDD'),
    tasks: [],
    online: true,
    error: '',
  },
  mounted: function () {
    this.online = navigator.onLine
    window.addEventListener('offline', () => { this.online = false })
    window.addEventListener('online', () => { this.online = true })

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
  directives: {
    focus: {
      inserted: function (el) {
        el.focus()
      }
    }
  },
  computed: {
    dateForPicker: {
      get: function () {
        return moment(this.date).format('YYYY-MM-DD')
      },
      set: function (newDate) {
        this.date = moment(newDate).format('YYYYMMDD')
      }
    },
    dateTitle () {
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
    dateSubtitle () {
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
    inThePast () {
      let date = moment(this.date)
      let now = moment(this.today)

      if (date.diff(now, 'days') < 0) {
        return true
      }
      return false
    },
    addTaskPlaceholder () {
      if(this.inThePast) {
        return "Stuff I did"
      }
      if(this.today == this.date || this.tomorrow == this.date) {
        return this.dateTitle + " I will..."
      }

      return "On this day I will..."

    },
    doneTasks () {
      return this.tasks.filter( (task) => {
        return task.done
      } )
    },
    unfinishedTasks () {
      return this.tasks.filter((task) => {
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
    jumpToToday () {
      this.date = this.today
      this.getTasks()
    },
    jumpToTomorrow () {
      this.date = this.tomorrow
      this.getTasks()
    },
    jumpToYesterday () {
      this.date = this.yesterday
      this.getTasks()
    },
    jumpToDay () {
      this.date = this.dateForPicker.replace(/\-/g, '')
      this.getTasks()
    },
    jumpToPrevDay () {
      this.date = moment(this.date).subtract(1, 'days').format('YYYYMMDD')
      this.getTasks()
    },
    jumpToNextDay () {
      this.date = moment(this.date).add(1, 'days').format('YYYYMMDD')
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
    getTasks () {
      this.isLoading = true
      if (!navigator.onLine) {
        return 
      }
      axios
        .get('https://api.zoreet.com/days/' + this.date, {
          headers: { 'Authorization': 'Bearer ' + this.token }
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
              .replace(/\<div class\=\"\s*[a-z]*\s*\"\>\s*\<\/div\>/g, '')// empty divs
              .split('</div>')
              .filter(task => task.length)
              .map((task, index) => {
                let done = task.indexOf('<div class="active">') !== -1
                let title = task.trim().replace(/(<([^>]+)>)/ig, '') // all tags
                let id = parseInt(this.date) + index

                return {
                  id: id,
                  title: title,
                  done: done,
                  editing: false
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
    saveTasks () {
      if (!navigator.onLine) {
        return
      }
      axios
        .post('https://api.zoreet.com/days/' + this.date,
          { tasks: JSON.stringify(this.tasks) },
          { headers: { 'Authorization': 'Bearer ' + this.token } }
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
    addTask () {
      if (this.newTask.trim() == '') {
        return
      }

      let id = new Date().getTime()

      this.tasks.push({
        id: id,
        title: this.newTask,
        done: false,
        editing: false
      })

      this.newTask = ''
      Vue.nextTick(function () {
        document.getElementById('add-task').focus()
      })
      this.saveTasks()
    },
    editTask (task) {
      this.beforeEditCache = task.title
      task.editing = true
    },
    doneEdit (task) {
      if (task.title.trim() == '') {
        task.title = this.beforeEditCache
      }
      task.editing = false
      this.saveTasks()
    },
    doneEditJumpNext(index) {
      let task = this.tasks[index]

      if (task.title.trim() == '') {
        task.title = this.beforeEditCache
      }
      task.editing = false
      document.querySelectorAll('.task-input')[index + 1].focus()
      this.saveTasks()
    },
    cancelEdit (task) {
      task.title = this.beforeEditCache
      task.editing = false
    },
    removeTask (task, event) {

      let title = task.title;
      let id = task.id;
      if (title.length == 0) {
        event.preventDefault()

        let index = 0;
        for(;index<this.tasks.length; index++) {
          if (this.tasks[index].id == id) {
            break
          }
        }

        let taskElement = event.target.closest('.task')
        let prevTask = taskElement.previousSibling
        let nextTask = taskElement.nextSibling

        if (prevTask) { // if there is a task before, jump to it
          prevTask.querySelector('.task-input').focus()
        } else { // jump to the next
          nextTask.querySelector('.task-input').focus()
        }

        this. tasks.splice(index, 1)
        this.saveTasks()
      }
    },
    toggleTaskState (task) {
      task.done = !task.done
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
      let that = this;
      this.webAuth.checkSession({},
        function (err, result) {
          if (err) {
            that.error = err
          } else {
            that.error = ''
            that.token = result.accessToken
            that.saveLoginData(result)
            that.scheduleRenewal(result.expiresIn * 1000)
          }
        }
      );
    },
    scheduleRenewal(expiresIn) {
      if (!expiresIn)
        return

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
      let iframe = document.createElement('iframe');
      iframe.src = 'https://todayapp.eu.auth0.com/v2/logout';
      iframe.style.display = 'none';
      document.body.appendChild(iframe);

      window.setTimeout(() => {
        window.top.location.href = "/"
      }, 2000)
    }
  },
  watch: {
    'date': function () {
      localStorage.setItem('current-date', this.date)
    }
  }
})
