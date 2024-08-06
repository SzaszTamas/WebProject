import express from 'express';
import { ensureAuthenticated } from '../middleware/authMiddleware.js';
import { addReview, getFilmIdByName } from '../database/reviewdb.js';

const router = express.Router();

router.get('/add-review', ensureAuthenticated, (req, res) => {
  const { reviewId } = req.query;
  res.render('add-review', { reviewId, user: req.user });
});

router.post('/add-review', ensureAuthenticated, async (req, res) => {
  const { filmname, rating, review } = req.body;
  const userId = req.user.userID;

  try {
    const filmId = await getFilmIdByName(filmname);
    if (!filmId) {
      req.flash('error', 'Film not found');
      res.redirect('/add-review');
      return;
    }

    const reviewId = await addReview(filmId, rating, review, userId);
    req.flash('success', `Review added successfully, id: ${reviewId}`);
    res.redirect(`/add-review?reviewId=${reviewId}`);
  } catch (err) {
    req.flash('error', 'Error adding review');
    res.redirect('/add-review');
  }
});

export default router;
