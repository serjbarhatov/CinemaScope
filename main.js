// Replace with your actual RapidAPI key
const RAPIDAPI_KEY = 'dec7766617msh618ec3ee6b5fcb5p194818jsndf7de196ccb1';
const RAPIDAPI_HOST = 'imdb236.p.rapidapi.com';

// Helper to get query param
function getQueryParam(name) {
  const url = new URL(window.location.href);
  return url.searchParams.get(name);
}

// Store movie in localStorage and go to details page
function storeAndGoToDetails(movie) {
  localStorage.setItem('selectedMovie', JSON.stringify(movie));
  window.location.href = `details.html?id=${movie.id}`;
}

// --- INDEX PAGE LOGIC ---
if (document.getElementById('searchForm')) {
  document.getElementById('searchForm').addEventListener('submit', async function(e) {
    e.preventDefault();
    const title = document.getElementById('title').value;
    const partialTitle = document.getElementById('partialTitle') ? document.getElementById('partialTitle').value : '';
    const genre = document.getElementById('genre').value;
    const rating = document.getElementById('rating').value;
    const year = document.getElementById('year').value;
    const resultsCount = document.getElementById('resultsCount').value;
    
    let url = `https://${RAPIDAPI_HOST}/api/imdb/search?type=movie&rows=${resultsCount}`;
    if (title) url += `&primaryTitle=${encodeURIComponent(title)}`;
    if (partialTitle) url += `&primaryTitleAutocomplete=${encodeURIComponent(partialTitle)}`;
    if (genre) url += `&genre=${encodeURIComponent(genre)}`;
    if (rating) url += `&averageRatingFrom=${rating}`;
    if (year) url += `&startYearFrom=${year}`;
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
  // Clear filters button
  const clearBtn = document.getElementById('clearFilters');
  if (clearBtn) {
    clearBtn.onclick = () => {
      document.getElementById('searchForm').reset();
      document.getElementById('results').innerHTML = '';
    };
  }
}

function renderResults(movies) {
  const results = document.getElementById('results');
  if (!movies.length) {
    results.innerHTML = '<div class="col-span-full text-center">No movies found.</div>';
    return;
  }
  results.innerHTML = movies.map(movie => `
    <div class="bg-white bg-opacity-20 backdrop-blur-md rounded-2xl shadow-lg p-4 flex flex-col items-center cursor-pointer hover:bg-opacity-30 hover:scale-105 transition-all duration-200 border border-white/10" onclick='storeAndGoToDetails(${JSON.stringify(movie).replace(/'/g, "&#39;")})'>
      <div class="w-full aspect-[2/3] rounded-xl overflow-hidden mb-3 bg-gray-900 flex items-center justify-center">
        <img src="${movie.primaryImage || 'https://via.placeholder.com/300x450?text=No+Image'}" alt="${movie.primaryTitle}" class="object-cover w-full h-full"/>
      </div>
      <div class="font-extrabold text-lg text-center mb-1">${movie.primaryTitle}</div>
      <div class="text-xs text-gray-300 mb-2">${movie.startYear || ''}</div>
      <div class="flex flex-wrap gap-1 justify-center mb-2">${(movie.genres||[]).map(g=>`<span class='bg-gradient-to-r from-pink-500 to-purple-500 text-xs px-2 py-0.5 rounded-full font-semibold'>${g}</span>`).join('')}</div>
      <div class="flex items-center gap-2 text-xs text-gray-200">
        ${movie.averageRating ? `<span class='bg-yellow-400 text-black px-2 py-0.5 rounded-full font-bold'>⭐ ${movie.averageRating}</span>` : ''}
        ${movie.numVotes ? `<span class='bg-blue-500 text-white px-2 py-0.5 rounded-full'>${movie.numVotes.toLocaleString()} votes</span>` : ''}
      </div>
    </div>
  `).join('');
}

// --- DETAILS PAGE LOGIC ---
if (document.getElementById('movieDetails')) {
  (function() {
    const movieStr = localStorage.getItem('selectedMovie');
    if (!movieStr) {
      document.getElementById('movieDetails').innerHTML = '<div class="text-red-400">Movie not found.</div>';
      return;
    }
    const movie = JSON.parse(movieStr);
    renderDetails(movie);
  })();
}

function renderDetails(movie) {
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

  document.getElementById('movieDetails').innerHTML = `
    <div class="w-full md:w-1/3 flex-shrink-0 flex flex-col items-center">
      <div class="w-full aspect-[2/3] rounded-xl overflow-hidden shadow-lg mb-4 bg-gray-900 flex items-center justify-center">
        <img src="${image}" alt="${title}" class="object-cover w-full h-full"/>
      </div>
      <a href="${movie.url || '#'}" target="_blank" class="w-full mt-2">
        <button class="w-full bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 rounded-xl p-3 font-bold text-lg shadow-lg flex items-center justify-center gap-2 transition mb-2">
          <span>▶️</span> Watch Now
        </button>
      </a>
    </div>
    <div class="flex-1 flex flex-col gap-2 justify-center">
      <div class="flex flex-wrap items-center gap-2 mb-2">
        <span class="text-3xl font-extrabold">${title}</span>
        ${genres.map(g=>`<span class='bg-gradient-to-r from-pink-500 to-purple-500 text-xs px-2 py-0.5 rounded-full font-semibold'>${g}</span>`).join('')}
      </div>
      <div class="flex flex-wrap gap-4 text-base text-gray-200 mb-2">
        <span class="bg-yellow-400 text-black px-2 py-0.5 rounded-full font-bold">⭐ ${rating}</span>
        <span class="bg-blue-500 text-white px-2 py-0.5 rounded-full">${votes} votes</span>
        <span class="bg-green-500 text-white px-2 py-0.5 rounded-full">${year}</span>
        <span class="bg-purple-500 text-white px-2 py-0.5 rounded-full">${runtime} min</span>
      </div>
      <div class="text-base mb-2">${description}</div>
      <div class="flex flex-wrap gap-2 mt-4">
        ${countries.map(c=>`<span class='bg-white bg-opacity-20 px-2 py-0.5 rounded text-xs'>${c}</span>`).join('')}
        ${languages.map(l=>`<span class='bg-white bg-opacity-20 px-2 py-0.5 rounded text-xs'>${l}</span>`).join('')}
      </div>
    </div>
  `;
} 