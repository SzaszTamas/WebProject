const currentFilmDetails = {};
const userID = document.getElementById('myuserID').value;
const usersID = {};

let reviewIDs = [];

async function fetchUserReviews() {
  if (parseInt(userID, 10) === 0) {
    return;
  }
  try {
    const response = await fetch('/user-reviews', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (response.ok) {
      const data = await response.json();
      reviewIDs = data.reviewIDs;
    } else {
      console.error('Failed to fetch user reviews');
    }
  } catch (err) {
    console.error('Error fetching user reviews:', err);
  }
}

function deleteItem(event, filmId, itemType, itemIndex = null) {
  event.stopPropagation();
  let url;
  if (itemType === 'review') {
    url = `/delete-review/${filmId}/${itemIndex}`;
  } else {
    url = `/delete-${itemType}/${filmId}`;
  }

  fetch(url, { method: 'DELETE' })
    .then((response) => {
      if (!response.ok) {
        throw new Error(`Failed to delete ${itemType}`);
      }
      return response.text();
    })
    .then(() => {
      if (itemType === 'review') {
        event.target.closest('p').remove();
        currentFilmDetails[filmId].reviews.splice(itemIndex, 1);
      } else {
        document.querySelector(`.film-${itemType}[data-film-id="${filmId}"]`).remove();
        currentFilmDetails[filmId][itemType] = null;
      }
    })
    .catch((err) => {
      console.error(`Failed to delete ${itemType}`, err);
    });
}

function addDeleteEventListeners(detailsDiv, filmId) {
  detailsDiv.querySelectorAll('.delete-review').forEach((button) => {
    button.addEventListener('click', (event) => deleteItem(event, filmId, 'review', button.dataset.reviewId));
  });
  ['genre', 'plot'].forEach((itemType) => {
    const button = detailsDiv.querySelector(`.delete-${itemType}`);
    if (button) {
      button.addEventListener('click', (event) => deleteItem(event, filmId, itemType));
    }
  });
}

function renderFilmDetails(filmId, film) {
  currentFilmDetails[filmId] = film;

  const detailsDiv = document.querySelector(`.film-details[data-film-id="${filmId}"]`);

  while (detailsDiv.firstChild) {
    detailsDiv.removeChild(detailsDiv.firstChild);
  }

  if (film.genre) {
    const genreDiv = document.createElement('div');
    genreDiv.className = 'film-genre';
    genreDiv.dataset.filmId = filmId;
    const genreP = document.createElement('p');
    genreP.textContent = `Genre: ${film.genre}`;
    genreDiv.appendChild(genreP);

    if (parseInt(usersID[filmId], 10) === parseInt(userID, 10)) {
      const deleteGenreBtn = document.createElement('button');
      deleteGenreBtn.className = 'delete-genre';
      deleteGenreBtn.textContent = 'Delete Genre';
      genreDiv.appendChild(deleteGenreBtn);
    }
    detailsDiv.appendChild(genreDiv);
  }

  if (film.description) {
    const plotDiv = document.createElement('div');
    plotDiv.className = 'film-plot';
    plotDiv.dataset.filmId = filmId;
    const plotP = document.createElement('p');
    plotP.textContent = `Plot: ${film.description}`;
    plotDiv.appendChild(plotP);

    if (parseInt(usersID[filmId], 10) === parseInt(userID, 10)) {
      const deletePlotBtn = document.createElement('button');
      deletePlotBtn.className = 'delete-plot';
      deletePlotBtn.textContent = 'Delete Plot';
      plotDiv.appendChild(deletePlotBtn);
    }
    detailsDiv.appendChild(plotDiv);
  }

  let reviews = [];
  if (typeof film.reviews === 'string') {
    reviews = JSON.parse(film.reviews);
  } else if (Array.isArray(film.reviews)) {
    reviews = film.reviews;
  }

  currentFilmDetails[filmId].reviews = reviews;

  if (reviews.length > 0) {
    reviews.forEach((review, index) => {
      const reviewP = document.createElement('p');
      reviewP.textContent = `${review.review} - ${review.rating} stars`;
      const deleteReviewBtn = document.createElement('button');

      if (reviewIDs.includes(review.ratingID)) {
        deleteReviewBtn.className = 'delete-review';
        deleteReviewBtn.dataset.reviewId = index;
        deleteReviewBtn.textContent = 'Delete Review';
        reviewP.appendChild(deleteReviewBtn);
      }
      detailsDiv.appendChild(reviewP);
    });
  }

  addDeleteEventListeners(detailsDiv, filmId);
}

function fetchFilmDetails(filmId, film) {
  renderFilmDetails(filmId, film);
}

async function renderFilms(films) {
  await fetchUserReviews();
  const filmsList = document.querySelector('section');

  while (filmsList.firstChild) {
    filmsList.removeChild(filmsList.firstChild);
  }

  const header = document.createElement('h1');
  header.textContent = 'Search Results';
  filmsList.appendChild(header);

  films.forEach((film) => {
    const filmItem = document.createElement('li');
    filmItem.className = 'film-item';
    filmItem.dataset.filmId = film.filmID;

    const filmTitle = document.createElement('h3');
    filmTitle.textContent = `${film.filmID}. ${film.title} (${film.releaseYear})`;
    filmItem.appendChild(filmTitle);

    const filmImg = document.createElement('img');
    filmImg.src = film.coverImage;
    filmImg.alt = 'Film Cover Image';
    filmImg.height = 320;
    filmImg.width = 240;
    filmImg.addEventListener('click', () => {
      window.location.href = `/film/${film.filmID}`;
    });
    filmItem.appendChild(filmImg);

    const detailsDiv = document.createElement('div');
    detailsDiv.className = 'film-details';
    detailsDiv.dataset.filmId = film.filmID;
    filmItem.appendChild(detailsDiv);

    usersID[film.filmID] = film.userID;
    filmsList.appendChild(filmItem);
    filmItem.addEventListener('click', () => fetchFilmDetails(filmItem.dataset.filmId, film));
  });
}

document.getElementById('search-form').addEventListener('submit', (event) => {
  event.preventDefault();

  const formData = {
    title: document.getElementById('title').value,
    genre: document.getElementById('genre').value,
    minYear: document.getElementById('min-year').value,
    maxYear: document.getElementById('max-year').value,
  };

  fetch('/search-films', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(formData),
  })
    .then((response) => response.json())
    .then((data) => renderFilms(data.films))
    .catch((err) => {
      console.error('Failed to fetch search results', err);
    });
});
