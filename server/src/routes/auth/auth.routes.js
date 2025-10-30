import passport from 'passport';
import { Router } from 'express';

const router = Router();

router.get('/google', passport.authenticate('google', {
  scope: ['email']
}));

router.get('/google/callback', passport.authenticate('google', {
  failureRedirect: '/failure',
  successRedirect: '/launch',
  session: true
}), (req, res) => {
  console.log('Google called us back!')
})

router.get('/logout', (req, res) => {
  req.logout(); // remove req.user and clear session
  res.redirect('/')
})

export default router;
