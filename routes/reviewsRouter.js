import express from 'express';

import { ensureAuthenticated } from '../middleware/authMiddleware.js';
import { addReview } from '../database/reviewdb.js';

const router = express.Router();

router.get('/add-review', ensureAuthenticated, (req, res) => {
  const { reviewId } = req.query;
  res.render('add-review', { reviewId, user: req.user });
});

router.post('/add-review', ensureAuthenticated, async (req, res) => {
  const { filmid, rating, review, userId } = req.body;

  if (!filmid || !rating || !review) {
    return res.status(400).send('Error: Missing field');
  }

  if (Number.isNaN(filmid) || filmid < 0 || Number.isNaN(rating) || rating < 0) {
    return res.status(400).send('Error: Invalid film ID or rating');
  }

  if (typeof review !== 'string') {
    return res.status(400).send('Error: Invalid review');
  }

  try {
    const reviewId = await addReview(filmid, rating, review, userId);
    res.render('add-review', { reviewId });
  } catch (err) {
    console.error('Error inserting review:', err);
    res.status(500).send('Error adding review');
  }

  return null;
});

export default router;
