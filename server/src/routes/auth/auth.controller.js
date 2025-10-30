// middleware to secure routes
// req.user is the logged user with Google OAuth
export function checkLoggedIn(req, res, next) {
  const isLoggedIn = req.isAuthenticated() && req.user
  if (!isLoggedIn) {
    return res.status(401).json({
      error: 'You must log in'
    })
  }
  next();
}

export function verifyCallback(accessToken, refreshToken, profile, done) {
  console.log('Google profile', profile)
  done(null, profile);
}
