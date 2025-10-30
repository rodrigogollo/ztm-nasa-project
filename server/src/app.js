import express from 'express';
import cors from 'cors';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import morgan from 'morgan';
import helmet from 'helmet';
import api from './routes/api.js';
import authRouter from './routes/auth/auth.routes.js';
import passport from 'passport'
import { Strategy } from 'passport-google-oauth2';
import dotenv from 'dotenv';
import cookieSession from 'cookie-session';
import { checkLoggedIn, verifyCallback } from './routes/auth/auth.controller.js';

const __filepath = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filepath);

dotenv.config({ path: path.join(__dirname, '../.env') })

const {
  GOOGLE_CLIENT_ID,
  GOOGLE_CLIENT_SECRET,
  COOKIE_KEY_1,
  COOKIE_KEY_2,
} = process.env;

const AUTH_OPTIONS = {
  callbackURL: '/auth/google/callback',
  clientID: GOOGLE_CLIENT_ID,
  clientSecret: GOOGLE_CLIENT_SECRET,
}

// save the session to the cookie
passport.serializeUser((user, done) => {
  done(null, user.id)
})

// read the session from the cookie
passport.deserializeUser((id, done) => {
  // use the user id from serialize cookie and check user permissions in DB
  // User.findById(id).then(user => {
  done(null, id)
})

passport.use(new Strategy(AUTH_OPTIONS, verifyCallback))

const app = express();

app.use(helmet());

app.use(cookieSession({
  name: 'session',
  maxAge: 24 * 60 * 60 * 1000,
  keys: [COOKIE_KEY_1, COOKIE_KEY_2]
}));

app.use(passport.initialize());
app.use(passport.session()); // authenticate the session

app.use(cors({
  origin: 'https://localhost:3000'
}));

app.use(morgan('combined'))

app.use(express.json());
app.use(express.static(path.join(__dirname, '..', 'public')))

app.use('/auth', authRouter)
app.use('/v1', checkLoggedIn, api);

app.use('/', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'public', 'index.html'))
});

app.get('/failure', (req, res) => {
  res.send('Failed to log in!').status(401);
})

export default app;
