import express from 'express';
import multer from 'multer';
import { ensureAuthenticated } from '../middleware/authMiddleware.js';
import { addFilm } from '../database/filmdb.js';

const router = express.Router();
const upload = multer({ dest: 'uploads/' });

router.get('/add-film', ensureAuthenticated, (req, res) => {
  res.render('add-film', { user: req.user });
});


router.post('/add-film', upload.single('coverimage'), ensureAuthenticated, async (req, res) => {
  const { title, releaseyear, description, genre } = req.body;
  const coverimage = req.file ? req.file.filename : null;
  const userId = req.user.userID;

  if (!title || !releaseyear || !description || !genre) {
    req.flash('error', 'Error: Missing field');
    res.redirect('/add-film');
    return;
  }

  if (Number.isNaN(releaseyear) || releaseyear < 0) {
    req.flash('error', 'Error: Invalid release year');
    res.redirect('/add-film');
    return;
  }

  if (typeof title !== 'string' || typeof description !== 'string' || typeof genre !== 'string') {
    req.flash('error', 'Error: Invalid field type');
    res.redirect('/add-film');
    return;
  }

  try {
    await addFilm(title, releaseyear, description, genre, coverimage, userId);
    req.flash('success', 'Film added successfully!');
    res.redirect('/add-film');
  } catch (err) {
    req.flash('error', 'Error adding film');
    res.redirect('/add-film');
  }
});

export default router;
