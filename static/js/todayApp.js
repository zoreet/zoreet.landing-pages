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
    let date = null
    if (urlParams.has('date')) {
      date = urlParams.get('date')
    } else {
      date = moment(Date.now()).format('YYYY-MM-DD')
    }

    app = new Vue({
      el: '#app',
      data: {
        user: this.user,
        token: localStorage.getItem('id_token'),
        date: date
      }
    })
  }
}
