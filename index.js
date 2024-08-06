import express from 'express';
import session from 'express-session';
import flash from 'connect-flash';
import passport from 'passport';

import filmsRouter from './routes/filmsRouter.js';
import reviewsRouter from './routes/reviewsRouter.js';
import searchRouter from './routes/searchRouter.js';
import authRouter from './routes/authRouter.js';

import { connectToDb } from './database/db.js';

const startServer = async () => {
  try {
    await connectToDb();

    const app = express();

    app.use(express.json());
    app.use(express.urlencoded({ extended: true }));

    app.set('views', './views');
    app.set('view engine', 'ejs');

    app.use(
      session({
        secret: 'your_secret_key',
        resave: false,
        saveUninitialized: true,
      }),
    );

    app.use(flash());

    app.use(passport.initialize());
    app.use(passport.session());

    app.use((req, res, next) => {
      res.locals.messages = req.flash();
      res.locals.user = req.user;
      next();
    });

    app.use(authRouter);
    app.use(searchRouter);
    app.use(filmsRouter);
    app.use(reviewsRouter);

    app.use(express.static('./public'));
    app.use(express.static('./uploads'));

    app.listen(8080, () => {
      console.log('Server listening on http://localhost:8080/ ...');
    });
  } catch (err) {
    console.error('Failed to start server:', err);
  }
};

startServer();
