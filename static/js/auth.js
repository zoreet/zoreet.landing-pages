window.onload = function () {
  var webAuth = new auth0.WebAuth({
    domain: 'todayapp.eu.auth0.com',
    clientID: 'Zz9d2EICFe1981TC5Ym7dfva9Y1jECmP',
    responseType: 'token id_token',
    scope: 'openid email profile',
    redirectUri: window.location.origin + '/auth.html'
  })

  function handleAuthentication() {
    webAuth.parseHash(function (err, authResult) {
      if (err) {
        alert('Error: ' + err.error + '. Check the console for further details.')
        console.log('This is the error you got: ', err)
      } else if (authResult && authResult.accessToken && authResult.idToken) {
        setSession(authResult)
        window.location.replace('/app.html')
      } else {
        alert('Oups!/n/nTry again')
        window.location.replace('/')
      }
    })
  }

  function setSession(authResult) {
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

  function clearSession() {
    // Remove tokens and expiry time from localStorage
    localStorage.removeItem('access_token')
    localStorage.removeItem('id_token')
    localStorage.removeItem('expires_at')
    localStorage.removeItem('user')
  }

  handleAuthentication()
}