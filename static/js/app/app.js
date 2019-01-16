let app = new Vue({
  el: '#app',
  data: {
    user: this.user,
    token: localStorage.getItem('id_token'),
    isLoading: false,
    beforeEditCache: '',
    newTask: '',
    date: moment(Date.now()).format('YYYYMMDD'),
    today: moment(Date.now()).format('YYYYMMDD'),
    yesterday: moment(Date.now()).subtract(1, 'days').format('YYYYMMDD'),
    tomorrow: moment(Date.now()).add(1, 'days').format('YYYYMMDD'),
    tasks: [],
    importedData: false
  },
  mounted: function () {
    document.querySelector('#app').classList.remove('loading')
    this.getTasks()
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
    jumpToNextDay() {
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

          try {
            tasks = JSON.parse(rawTasks)
            this.tasks = tasks
            this.importedData = false
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

            this.importedData = true
          }
        })
    },
    saveTasks () {
      axios
        .post('https://api.zoreet.com/days/' + this.date,
          { tasks: JSON.stringify(this.tasks) },
          { headers: { 'Authorization': 'Bearer ' + this.token } }
        )

      this.importedData = false
    },

    addTask () {
      if (this.newTask.trim() == '') {
        return
      }

      this.tasks.push({
        id: Date.now(),
        title: this.newTask,
        completed: false,
        editing: false
      })

      this.newTask = ''
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
    cancelEdit (task) {
      task.title = this.beforeEditCache
      task.editing = false
    },
    removeTask (title, index) {
      if (title.length == 0) {
        this.tasks.splice(index, 1)
        this.saveTasks()
      }
    },
    toggleTaskState (task) {
      task.done = !task.done
      this.saveTasks()
    }
  }
})
