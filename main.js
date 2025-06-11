const RAPIDAPI_KEY = '215b7c1e0cmshec18dda2ac941b3p13d019jsn71520e0821fa';
const RAPIDAPI_HOST = 'imdb236.p.rapidapi.com';

function getQueryParam(name) {
  const url = new URL(window.location.href);
  return url.searchParams.get(name);
}

function storeAndGoToDetails(movie) {
  localStorage.setItem('selectedMovie', JSON.stringify(movie));
  window.location.href = `details.html?id=${movie.id}`;
}

function storeAndGoToDetailsNewTab(movie) {
  localStorage.setItem('selectedMovie', JSON.stringify(movie));
  window.open(`details.html?id=${movie.id}`, '_blank');
}

window.addEventListener('DOMContentLoaded', () => {
  const yearSlider = document.getElementById('year-slider');
  noUiSlider.create(yearSlider, {
    start: [1990, 2025],
    connect: true,
    step: 1,
    range: {
      'min': 1920,
      'max': 2025
    },
    tooltips: false,
    format: {
      to: value => Math.round(value),
      from: value => Number(value)
    }
  });
  const yearValue = document.getElementById('year-slider-value');
  yearSlider.noUiSlider.on('update', (values) => {
    yearValue.textContent = `${values[0]} - ${values[1]}`;
  });

  const ratingSlider = document.getElementById('rating-slider');
  noUiSlider.create(ratingSlider, {
    start: [7, 10],
    connect: true,
    step: 0.1,
    range: {
      'min': 0,
      'max': 10
    },
    tooltips: false,
    format: {
      to: value => Number(value).toFixed(1),
      from: value => Number(value)
    }
  });
  const ratingValue = document.getElementById('rating-slider-value');
  ratingSlider.noUiSlider.on('update', (values) => {
    ratingValue.textContent = `${values[0]} - ${values[1]}`;
  });

  const votesSlider = document.getElementById('votes-slider');
  noUiSlider.create(votesSlider, {
    start: [20000, 1000000],
    connect: true,
    step: 100,
    range: {
      'min': 0,
      'max': 1000000
    },
    tooltips: false,
    format: {
      to: value => Math.round(value),
      from: value => Number(value)
    }
  });
  const votesValue = document.getElementById('votes-slider-value');
  votesSlider.noUiSlider.on('update', (values) => {
    const format = n => n >= 1000 ? n.toLocaleString() : n;
    let maxLabel = values[1] >= 1000000 ? '1,000,000+' : format(values[1]);
    votesValue.textContent = `${format(values[0])} - ${maxLabel}`;
  });

  const resultsSlider = document.getElementById('results-slider');
  noUiSlider.create(resultsSlider, {
    start: 6,
    connect: [true, false],
    step: 1,
    range: {
      'min': 1,
      'max': 20
    },
    tooltips: false,
    format: {
      to: value => Math.round(value),
      from: value => Number(value)
    }
  });
  const resultsValue = document.getElementById('results-slider-value');
  resultsSlider.noUiSlider.on('update', (values) => {
    resultsValue.textContent = `${values[0]} movies`;
  });

  if (document.getElementById('searchForm')) {
    document.getElementById('searchForm').addEventListener('submit', async function(e) {
      e.preventDefault();
      const title = document.getElementById('title').value;
      const partialTitle = document.getElementById('partialTitle') ? document.getElementById('partialTitle').value : '';
      const genre = document.getElementById('genre').value;
      const [startYear, endYear] = yearSlider.noUiSlider.get();
      const [minRating, maxRating] = ratingSlider.noUiSlider.get();
      const [minVotes, maxVotes] = votesSlider.noUiSlider.get();
      const resultsCount = resultsSlider.noUiSlider.get();

      let url = `https://${RAPIDAPI_HOST}/api/imdb/search?type=movie&rows=${resultsCount}`;
      if (title) url += `&primaryTitle=${encodeURIComponent(title)}`;
      if (partialTitle) url += `&primaryTitleAutocomplete=${encodeURIComponent(partialTitle)}`;
      if (genre) url += `&genre=${encodeURIComponent(genre)}`;
      if (minRating) url += `&averageRatingFrom=${minRating}`;
      if (maxRating) url += `&averageRatingTo=${maxRating}`;
      if (minVotes) url += `&numVotesFrom=${minVotes}`;
      if (maxVotes && maxVotes < 1000000) url += `&numVotesTo=${maxVotes}`;
      if (startYear) url += `&startYearFrom=${startYear}`;
      if (endYear) url += `&startYearTo=${endYear}`;
      url += `&sortOrder=ASC&sortField=id`;

      document.getElementById('results').innerHTML = '<div class="col-span-full text-center">Loading...</div>';
      try {
        const res = await fetch(url, {
          headers: {
            'x-rapidapi-key': RAPIDAPI_KEY,
            'x-rapidapi-host': RAPIDAPI_HOST
          }
        });
        const data = await res.json();
        renderResults(data.results || []);
      } catch (err) {
        document.getElementById('results').innerHTML = '<div class="col-span-full text-center text-red-400">Error loading movies.</div>';
      }
    });
    const clearBtn = document.getElementById('clearFilters');
    if (clearBtn) {
      clearBtn.onclick = () => {
        document.getElementById('searchForm').reset();
        yearSlider.noUiSlider.set([1990, 2025]);
        ratingSlider.noUiSlider.set([7, 10]);
        votesSlider.noUiSlider.set([20000, 1000000]);
        resultsSlider.noUiSlider.set(6);
        document.getElementById('results').innerHTML = '';
      };
    }
  }
});

function renderResults(movies) {
  const results = document.getElementById('results');
  if (!movies.length) {
    results.innerHTML = '<div class="col-span-full text-center">No movies found.</div>';
    return;
  }
  results.innerHTML = movies.map(movie => `
    <article class="bg-white bg-opacity-20 backdrop-blur-md rounded-2xl shadow-lg p-4 flex flex-col items-center cursor-pointer hover:bg-opacity-30 hover:scale-105 transition-all duration-200 border border-white/10" onclick='storeAndGoToDetailsNewTab(${JSON.stringify(movie).replace(/'/g, "&#39;")})'>
      <span class="w-full aspect-[2/3] rounded-xl overflow-hidden mb-3 bg-gray-900 flex items-center justify-center">
        <img src="${movie.primaryImage || 'https://via.placeholder.com/300x450?text=No+Image'}" alt="${movie.primaryTitle}" class="object-cover w-full h-full"/>
      </span>
      <span class="font-extrabold text-lg text-center mb-1">${movie.primaryTitle}</span>
      <span class="text-xs text-gray-300 mb-2">${movie.startYear || ''}</span>
      <span class="flex flex-wrap gap-1 justify-center mb-2">${(movie.genres||[]).map(g=>`<span class='bg-gradient-to-r from-pink-500 to-purple-500 text-xs px-2 py-0.5 rounded-full font-semibold'>${g}</span>`).join('')}</span>
      <span class="flex items-center gap-2 text-xs text-gray-200">
        ${movie.averageRating ? `<span class='bg-yellow-400 text-black px-2 py-0.5 rounded-full font-bold'>⭐ ${movie.averageRating}</span>` : ''}
        ${movie.numVotes ? `<span class='bg-blue-500 text-white px-2 py-0.5 rounded-full'>${movie.numVotes.toLocaleString()} votes</span>` : ''}
      </span>
    </article>
  `).join('');
  results.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

if (document.getElementById('movieDetails')) {
  (async function() {
    const movieStr = localStorage.getItem('selectedMovie');
    if (!movieStr) {
      document.getElementById('movieDetails').innerHTML = '<div class="text-red-400">Movie not found.</div>';
      return;
    }
    const movie = JSON.parse(movieStr);
    const movieId = movie.id;
    
    document.getElementById('movieDetails').innerHTML = '<div class="w-full text-center">Loading...</div>';
    
    try {
      const [movieData, directorsData] = await Promise.all([
        Promise.resolve(movie),
        fetch(`https://${RAPIDAPI_HOST}/api/imdb/${movieId}/directors`, {
          headers: {
            'x-rapidapi-key': RAPIDAPI_KEY,
            'x-rapidapi-host': RAPIDAPI_HOST
          }
        }).then(res => res.json())
      ]);
      
      renderDetails(movieData, directorsData);
    } catch (err) {
      console.error('Error loading movie details:', err);
      document.getElementById('movieDetails').innerHTML = '<div class="text-red-400">Error loading movie details.</div>';
    }
  })();
}

function renderDetails(movie, directors = []) {
  const image = movie.primaryImage || 'https://via.placeholder.com/300x450?text=No+Image';
  const title = movie.primaryTitle || 'No Title';
  const genres = movie.genres || [];
  const rating = movie.averageRating || '-';
  const votes = movie.numVotes ? movie.numVotes.toLocaleString() : '-';
  const year = movie.startYear || '-';
  const runtime = movie.runtimeMinutes || '-';
  const description = movie.description || '';
  const countries = movie.countriesOfOrigin || [];
  const languages = movie.spokenLanguages || [];
  const trailer = movie.trailer || '';
  const imdbUrl = movie.url || '#';
  
  let directorLine = '';
  if (directors && Array.isArray(directors) && directors.length > 0) {
    const directorNames = directors.map(d => d.fullName).join(', ');
    directorLine = `<div class='mt-2 text-base'><span class="font-semibold text-pink-300">Directed by:</span> ${directorNames}</div>`;
  }

  document.getElementById('movieDetails').innerHTML = `
    <div class="flex flex-col md:flex-row gap-8 w-full items-center justify-center">
      <div class="w-full md:w-1/3 flex-shrink-0 flex flex-col items-center">
        <div class="w-full aspect-[2/3] rounded-xl overflow-hidden shadow-lg mb-4 bg-gray-900 flex items-center justify-center">
          <img src="${image}" alt="${title}" class="object-cover w-full h-full"/>
        </div>
        ${trailer ? `
        <a href="${trailer}" target="_blank" class="w-full mt-2">
          <button class="w-full bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 rounded-xl p-3 font-bold text-lg shadow-lg flex items-center justify-center gap-2 transition mb-2">
            <span>▶️</span> Watch Trailer
          </button>
        </a>
        ` : ''}
        <a href="${imdbUrl}" target="_blank" class="w-full">
          <button class="w-full bg-gradient-to-r from-gray-700 to-gray-900 hover:from-gray-800 hover:to-black rounded-xl p-3 font-bold text-lg shadow-lg flex items-center justify-center gap-2 transition mb-2">
            <span>ℹ️</span> More Info
          </button>
        </a>
      </div>
      <div class="flex-1 flex flex-col gap-4 justify-center">
        <div>
          <span class="text-3xl font-extrabold">${title}</span>
        </div>
        <div>
          <span class="font-semibold text-pink-300">Genres:</span> ${genres.map(g=>`<span class='bg-gradient-to-r from-pink-500 to-purple-500 text-xs px-2 py-0.5 rounded-full font-semibold ml-1'>${g}</span>`).join('')}
        </div>
        <div class="flex flex-wrap gap-2 items-center">
          <span class="font-semibold text-pink-300">Info:</span>
          <span class="bg-yellow-400 text-black px-2 py-0.5 rounded-full font-bold">⭐ ${rating}</span>
          <span class="bg-blue-500 text-white px-2 py-0.5 rounded-full">${votes} votes</span>
          <span class="bg-green-500 text-white px-2 py-0.5 rounded-full">${year}</span>
          <span class="bg-purple-500 text-white px-2 py-0.5 rounded-full">${runtime} min</span>
        </div>
        <div>
          <span class="font-semibold text-pink-300">Description:</span>
          <div class="text-base mt-1">${description}</div>
        </div>
        ${directorLine}
        <div class="flex flex-wrap gap-2 items-center">
          <span class="font-semibold text-pink-300">Country:</span>
          ${countries.map(c=>`<span class='bg-white bg-opacity-20 px-2 py-0.5 rounded text-xs ml-1'>${c}</span>`).join('')}
        </div>
        <div class="flex flex-wrap gap-2 items-center">
          <span class="font-semibold text-pink-300">Language:</span>
          ${languages.map(l=>`<span class='bg-white bg-opacity-20 px-2 py-0.5 rounded text-xs ml-1'>${l}</span>`).join('')}
        </div>
      </div>
    </div>
  `;
} 