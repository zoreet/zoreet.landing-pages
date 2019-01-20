window.onload = function() {

  isFirstLanding = !window.sessionStorage.getItem('activeSession')
  tokenExpirationDate = window.localStorage.getItem('expires_at')
  now = Date.now()

  if(isFirstLanding && now < tokenExpirationDate) {
    window.sessionStorage.setItem('activeSession', true)
    window.location.href = '/app.html'
    return
  }

  var webAuth = new auth0.WebAuth({
    domain: 'todayapp.eu.auth0.com',
    clientID: 'Zz9d2EICFe1981TC5Ym7dfva9Y1jECmP',
    responseType: 'token id_token',
    scope: 'openid email profile',
    redirectUri: window.location.origin + '/auth.html',
    audience: 'todayapp'
  })

  document.querySelectorAll('.js-login').forEach((el) => {
    el.addEventListener('click', (event) => {
      event.preventDefault();
      webAuth.authorize()
    })
  })
}