/*
the motivations to build this app came out of my frustration with using todo apps. I always add a lot of items in the lists, more then i can handle. so every day when i check them i ALWAYS have unfinished stuff. and it just grows bigger and bigger to the point where i start feeling anxious.

to solve this i set up today, a todo list that resets every day. forget the baggage of yesterday! i'm going to work on whatever is important today. i might not finish everything by the end, but if i don't remember tomorrow about it, it means it wasn't important to begin with. every day is a fresh start!
*/
let app;
let today = {
  user: JSON.parse(localStorage.getItem('user')),
  token: localStorage.getItem('id_token'),

  init: function () {
    let urlParams = new URLSearchParams(window.location.search)

    app = new Vue({
      el: '#app',
      data: {
        user: this.user,
        token: localStorage.getItem('id_token'),
        date: moment(Date.now()).format('YYYYMMDD'),
        today: moment(Date.now()).format('YYYYMMDD'),
        yesterday: moment(Date.now()).subtract(1, 'days').format('YYYYMMDD'),
        tomorrow: moment(Date.now()).add(1, 'days').format('YYYYMMDD')
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
        jumpToToday() {
          this.date = this.today
        },
        jumpToTomorrow() {
          this.date = this.tomorrow
        },
        jumpToYesterday() {
          this.date = this.yesterday
        }
      }
    })
  }
}
