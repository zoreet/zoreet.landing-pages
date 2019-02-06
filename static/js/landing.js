window.onload = function() {
  var webAuth = new auth0.WebAuth({
    domain: 'todayapp.eu.auth0.com',
    clientID: 'Zz9d2EICFe1981TC5Ym7dfva9Y1jECmP',
    responseType: 'token id_token',
    scope: 'openid email profile',
    redirectUri: window.location.origin + '/auth.html',
    audience: 'todayapp'
  })

  isFirstLanding = !window.sessionStorage.getItem('activeSession')
  tokenExpirationDate = window.localStorage.getItem('expires_at')
  accessToken = window.localStorage.getItem('access_token')
  now = Date.now()

  if (isFirstLanding) {
    // I land on the homepage
    if (now < tokenExpirationDate) {
      // I have an active token, so assume I want to jump to the app
      window.sessionStorage.setItem('activeSession', true)
      window.location.href = '/app.html'
    } else if (accessToken) {
      // My token expired, but still I was logged in, so assume I want to log in and jump to the app
      webAuth.authorize()
    }
  }

  document.querySelectorAll('.js-login').forEach(el => {
    el.addEventListener('click', event => {
      event.preventDefault()
      webAuth.authorize()
    })
  })
}
