let app = new Vue({
  el: '#app',
  data: {
    user: {},
    token: localStorage.getItem('id_token'),
    isLoading: false,
    showMenu: false,
    beforeEditCache: '',
    newTask: '',
    date: moment(Date.now()).format('YYYYMMDD'),
    today: moment(Date.now()).format('YYYYMMDD'),
    yesterday: moment(Date.now()).subtract(1, 'days').format('YYYYMMDD'),
    tomorrow: moment(Date.now()).add(1, 'days').format('YYYYMMDD'),
    tasks: []
  },
  mounted: function () {
    document.querySelector('#app').classList.remove('loading')
    this.token = localStorage.getItem('id_token')
    let expiresAt = localStorage.getItem('expires_at')
    let now = Date.now()

    if (this.token && expiresAt && now < expiresAt) {
      this.user = JSON.parse(localStorage.getItem('user'))
      this.getTasks()

      let expiresIn = expiresAt - now
      window.setTimeout(() => {
        window.location.href = '/'
      }, expiresIn)
    } else {
      window.location.replace('/')
    }
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
    sortedTasks () {
      if (!this.inThePast) {
        return this.tasks.sort((a, b) => {
          if (b.done && !a.done) {
            return -1
          }
          return 0
        })
      } else {
        return this.tasks.sort((a, b) => {
          if (a.done && !b.done) {
            return -1
          }
          return 0
        })
      }
    }
  },
  methods: {
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

    getTasks () {
      axios
        .get('https://api.zoreet.com/days/' + this.date, {
          headers: { 'Authorization': 'Bearer ' + this.token }
        })
        .then(response => {
          let rawTasks = response.data.day.tasks
          let tasks

          this.showMenu = false

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
    },
    saveTasks () {
      axios
        .post('https://api.zoreet.com/days/' + this.date,
          { tasks: JSON.stringify(this.tasks) },
          { headers: { 'Authorization': 'Bearer ' + this.token } }
        )
    },

    addTask () {
      if (this.newTask.trim() == '') {
        return
      }

      this.tasks.push({
        id: Date.now(),
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
    removeTask (index, event) {
      let task = this.tasks[index]
      if (task.title.length == 0) {
        event.preventDefault()

        if (index) { // if there is a task before, jump to it
          document.querySelectorAll('.task-input')[index - 1].focus()
          this.editTask(this.tasks[index - 1])
        } else { // jump to the next
          document.querySelectorAll('.task-input')[index + 1].focus()
        }

        this.tasks.splice(index, 1)
        this.saveTasks()
      }
    },
    toggleTaskState (task) {
      task.done = !task.done
      this.saveTasks()
    },

    toggleMenu () {
      this.showMenu = !this.showMenu
    },

    logout () {
      localStorage.removeItem('access_token')
      localStorage.removeItem('id_token')
      localStorage.removeItem('expires_at')
      localStorage.removeItem('user')

      window.location.href = '/'
    }
  }
})
