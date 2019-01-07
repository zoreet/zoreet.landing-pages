// app.js
$(function () {
  var webAuth = new auth0.WebAuth({
    domain: 'todayapp.eu.auth0.com',
    clientID: 'Zz9d2EICFe1981TC5Ym7dfva9Y1jECmP',
    responseType: 'token id_token',
    scope: 'openid email profile',
    redirectUri: window.location.origin + '/app.html'
  })

  // buttons and event listeners
  var loginBtn = $('#btn-login')
  var signupBtn = $('#btn-signup')
  var logoutBtn = $('#btn-logout')
  var openBtn = $('.btn-open')

  loginBtn.on('click', function (e) {
    e.preventDefault()
    webAuth.authorize()
  })

  openBtn.on('click', function (e) {
    e.preventDefault()
    window.location.href = '/app.html'
  })

  loginBtn.on('click', function (e) {
    e.preventDefault()
    webAuth.authorize()
  })

  signupBtn.on('click', function (e) {
    e.preventDefault()
    webAuth.authorize()
  })
  
  logoutBtn.on('click', function (e) {
    e.preventDefault()
    clearSession()
    window.location.href = '/'
  })

  function handleAuthentication () {
    webAuth.parseHash(function (err, authResult) {
      if (err) {
        alert('Error: ' + err.error + '. Check the console for further details.')
      } else if (authResult && authResult.accessToken && authResult.idToken) {
        console.log('user just logged in, we need to save the token')
        setSession(authResult)
        history.replaceState(null, null, '/app.html') // remove the tokens from the URL
        $('.btn--for-logged-in').show()
        if (today) {
          today.init()
        }
      } else {
        var session = getSession()

        if (session.access_token) {
          var expiresAt = JSON.parse(session.expires_at)
          var now = new Date().getTime()

          if (now < expiresAt) {
            console.log('user is logged in')
            $('.btn--for-logged-in').show()
            if (today) {
              today.init()
            }
          } else {
            console.log('user is logged in, but token expired')
            webAuth.authorize()
          }
        } else {
          console.log('user is NOT logged in')
          if (window.location.pathname !== '/' && window.location.pathname !== '/index.html') {
            window.location.href = '/'
          } else {
            $('#btn-login, #btn-signup')
              .show()
              .on('click', function (e) {
                e.preventDefault()
                webAuth.authorize()
              })
          }
        }
      }
    })
  }

  function getSession () {
    return {
      access_token: localStorage.getItem('access_token'),
      id_token: localStorage.getItem('id_token'),
      expires_at: localStorage.getItem('expires_at'),
      user: localStorage.getItem('user')
    }
  }
  function setSession (authResult) {
    console.log(authResult)
    // Set the time that the Access Token will expire at
    var expiresAt = JSON.stringify(
      authResult.expiresIn * 1000 + new Date().getTime()
    )
    var user = JSON.stringify({
      email: authResult.idTokenPayload.email,
      nickname: authResult.idTokenPayload.nickname
    })
    localStorage.setItem('access_token', authResult.accessToken)
    localStorage.setItem('id_token', authResult.idToken)
    localStorage.setItem('expires_at', expiresAt)
    localStorage.setItem('user', user)
  }

  function clearSession () {
    // Remove tokens and expiry time from localStorage
    localStorage.removeItem('access_token')
    localStorage.removeItem('id_token')
    localStorage.removeItem('expires_at')
    localStorage.removeItem('user')
  }

  handleAuthentication()
})
