let app = new Vue({
  el: '#app',
  data: {
    user: {},
    token: '',
    isLoading: false,
    showMenu: false,
    focusedIndex: 0,
    activeTab: 'day',
    fromDate: '20190101',
    tillDate: '20190331',
    tasks: [],
    days: [],
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
  methods: {
    // ////////////////////////////////////////////////////////////
    //
    // NAVIGATION
    //
    // ////////////////////////////////////////////////////////////
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
        .get(
          'https://api.zoreet.com/reports/' +
            this.fromDate +
            '/' +
            this.tillDate,
          {
            headers: { Authorization: 'Bearer ' + this.token }
          }
        )
        .then(response => {
          this.days = response.data.days
          this.days.sort((a, b) => {
            let aDate = parseInt(a.date)
            let bDate = parseInt(b.date)

            if (aDate < bDate) return -1
            return 0
          })

          this.days.forEach(element => {
            let rawTasks = element.tasks
            try {
              let tasks = JSON.parse(rawTasks)
              element.tasks = tasks
            } catch (e) {
              element.tasks = rawTasks
                .replace(/<br>/g, '')
                .replace(/\<div class\=\"\s*[a-z]*\s*\"\>\s*\<\/div\>/g, '') // empty divs
                .split('</div>')
                .filter(task => task.length)
                .map((task, index) => {
                  let done = task.indexOf('<div class="active">') !== -1
                  let title = task.trim().replace(/(<([^>]+)>)/gi, '') // all tags
                  let id = parseInt(element.date) + index

                  return {
                    id: id,
                    title: title,
                    done: done
                  }
                })
                .filter(task => task.title.length)
            }

            element.tasks = element.tasks.filter(task => task.done)
          })

          this.showMenu = false
          this.isLoading = false
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
  }
})
