let app = new Vue({
  el: '#app',
  data: {
    user: this.user,
    token: localStorage.getItem('id_token'),
    isLoading: false,
    date: moment(Date.now()).format('YYYYMMDD'),
    today: moment(Date.now()).format('YYYYMMDD'),
    yesterday: moment(Date.now()).subtract(1, 'days').format('YYYYMMDD'),
    tomorrow: moment(Date.now()).add(1, 'days').format('YYYYMMDD'),
    tasks: [],
  },
  mounted: function () {
    document.querySelector('#app').classList.remove('loading')
    axios
      .get('https://api.zoreet.com/days/' + this.date, {
        headers: { 'Authorization': 'Bearer ' + this.token },
      })
      .then(response => {
        let rawTasks = response.data.day.tasks;
        try {
          let tasks = JSON.parse(rawTasks)
          this.tasks = tasks
        } catch(e) {
          console.log(e)
        }
      })
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
    }
  },
  methods: {
    jumpToToday() {
      this.date = this.today
    },
    jumpToTomorrow() {
      this.date = this.tomorrow
    },
    jumpToYesterday() {
      this.date = this.yesterday
    },
    getTasks() {
      return []
    },
  }
})