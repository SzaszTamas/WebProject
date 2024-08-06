import express from 'express';
import { searchFilms, deleteReviewById, deleteGenreById, deletePlotById, getFilmById } from '../database/searchdb.js';
import { getUserReviewIds } from '../database/reviewdb.js';
import { ensureAuthenticated } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/search-films', (req, res) => {
  res.render('search-films', { title: 'Search Films', films: [] });
});

router.post('/search-films', async (req, res) => {
  const { title, genre, minYear, maxYear } = req.body;
  try {
    const films = await searchFilms(title, genre, minYear, maxYear);
    res.json({ films });
  } catch (err) {
    console.error('Error searching films:', err);
    res.status(500).json({ error: 'Error searching films' });
  }
});

router.get('/film/:filmID', async (req, res) => {
  const { filmID } = req.params;
  try {
    const film = await getFilmById(filmID);
    res.render('film', { film });
  } catch (err) {
    console.error('Error retrieving film:', err);
    res.status(500).json({ error: 'Error retrieving film' });
  }
});

router.delete('/delete-review/:filmId/:reviewIndex', ensureAuthenticated, async (req, res) => {
  try {
    const { filmId, reviewIndex } = req.params;
    await deleteReviewById(filmId, reviewIndex);
    res.status(200).send();
  } catch (err) {
    console.error(err);
    res.status(500).send('Failed to delete review');
  }
});

router.delete('/delete-genre/:filmId', ensureAuthenticated, async (req, res) => {
  try {
    const { filmId } = req.params;
    await deleteGenreById(filmId);
    res.status(200).send();
  } catch (err) {
    console.error(err);
    res.status(500).send('Failed to delete genre');
  }
});

router.delete('/delete-plot/:filmId', ensureAuthenticated, async (req, res) => {
  try {
    const { filmId } = req.params;
    await deletePlotById(filmId);
    res.status(200).send();
  } catch (err) {
    console.error(err);
    res.status(500).send('Failed to delete plot');
  }
});

router.get('/user-reviews', ensureAuthenticated, async (req, res) => {
  try {
    const reviewIDs = await getUserReviewIds(req.user.userID);
    res.json({ reviewIDs });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch review IDs' });
  }
});

export default router;