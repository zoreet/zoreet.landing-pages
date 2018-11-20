// app.js

window.addEventListener('load', function () {
  var webAuth = new auth0.WebAuth({
    domain: 'todayapp.eu.auth0.com',
    clientID: 'Zz9d2EICFe1981TC5Ym7dfva9Y1jECmP',
    responseType: 'token id_token',
    scope: 'openid',
    redirectUri: '/app.html'
  })

  var loginStatus = document.getElementById('loginStatus')

  // buttons and event listeners
  var loginBtn = document.getElementById('btn-login')
  var signupBtn = document.getElementById('btn-signup')
  var logoutBtn = document.getElementById('btn-logout')

  loginBtn.addEventListener('click', function (e) {
    e.preventDefault()
    webAuth.authorize()
  })
  if (signupBtn)
    signupBtn.addEventListener('click', function (e) {
      e.preventDefault()
      webAuth.authorize()
    })

  logoutBtn.addEventListener('click', logout)

  function handleAuthentication () {
    webAuth.parseHash(function (err, authResult) {
      if (authResult && authResult.accessToken && authResult.idToken) {
        window.location.hash = ''
        setSession(authResult)
        loginBtn.style.display = 'none'
      } else if (err) {
        alert(
          'Error: ' + err.error + '. Check the console for further details.'
        )
      }
      if (isAuthenticated()) {
        today.init()
      }
      displayButtons()
    })
  }

  function setSession (authResult) {
    // Set the time that the Access Token will expire at
    var expiresAt = JSON.stringify(
      authResult.expiresIn * 1000 + new Date().getTime()
    )
    localStorage.setItem('access_token', authResult.accessToken)
    localStorage.setItem('id_token', authResult.idToken)
    localStorage.setItem('expires_at', expiresAt)
  }

  function logout () {
    // Remove tokens and expiry time from localStorage
    localStorage.removeItem('access_token')
    localStorage.removeItem('id_token')
    localStorage.removeItem('expires_at')
    displayButtons()
  }

  function isAuthenticated () {
    // Check whether the current time is past the
    // Access Token's expiry time
    var expiresAt = JSON.parse(localStorage.getItem('expires_at'))
    return new Date().getTime() < expiresAt
  }

  function displayButtons () {
    if (isAuthenticated()) {
      loginBtn.style.display = 'none'
      logoutBtn.style.display = 'inline-block'
      loginStatus.innerHTML = 'You are logged in!'
    } else {
      loginBtn.style.display = 'inline-block'
      logoutBtn.style.display = 'none'
      loginStatus.innerHTML =
        'You are not logged in! Please sign up or log in to continue.'
    }
  }

  handleAuthentication()
})
