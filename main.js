// Replace with your actual RapidAPI key
const RAPIDAPI_KEY = 'dec7766617msh618ec3ee6b5fcb5p194818jsndf7de196ccb1';
const RAPIDAPI_HOST = 'imdb236.p.rapidapi.com';

// Helper to get query param
function getQueryParam(name) {
  const url = new URL(window.location.href);
  return url.searchParams.get(name);
}

// --- INDEX PAGE LOGIC ---
if (document.getElementById('searchForm')) {
  document.getElementById('searchForm').addEventListener('submit', async function(e) {
    e.preventDefault();
    const title = document.getElementById('title').value;
    const genre = document.getElementById('genre').value;
    const rating = document.getElementById('rating').value;
    const year = document.getElementById('year').value;
    const resultsCount = document.getElementById('resultsCount').value;
    
    let url = `https://${RAPIDAPI_HOST}/api/imdb/search?type=movie&rows=${resultsCount}`;
    if (title) url += `&primaryTitleAutocomplete=${encodeURIComponent(title)}`;
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
}

function renderResults(movies) {
  const results = document.getElementById('results');
  if (!movies.length) {
    results.innerHTML = '<div class="col-span-full text-center">No movies found.</div>';
    return;
  }
  results.innerHTML = movies.map(movie => `
    <div class="bg-white bg-opacity-10 rounded-lg p-3 flex flex-col items-center cursor-pointer hover:bg-opacity-20 transition" onclick="window.location.href='details.html?id=${movie.id}'">
      <img src="${movie.primaryImage || 'https://via.placeholder.com/200x300?text=No+Image'}" alt="${movie.primaryTitle}" class="w-full h-48 object-cover rounded mb-2"/>
      <div class="font-bold text-lg text-center">${movie.primaryTitle}</div>
      <div class="text-sm text-gray-300 mb-1">${movie.startYear || ''}</div>
      <div class="flex flex-wrap gap-1 justify-center">${(movie.genres||[]).map(g=>`<span class='bg-pink-500 text-xs px-2 py-0.5 rounded'>${g}</span>`).join('')}</div>
      <div class="text-xs text-gray-400 mt-1">${movie.averageRating ? `⭐ ${movie.averageRating}` : ''} ${movie.numVotes ? `(${movie.numVotes} votes)` : ''}</div>
    </div>
  `).join('');
}

// --- DETAILS PAGE LOGIC ---
if (document.getElementById('movieDetails')) {
  (async function() {
    const id = getQueryParam('id');
    if (!id) {
      document.getElementById('movieDetails').innerHTML = '<div>No movie selected.</div>';
      return;
    }
    document.getElementById('movieDetails').innerHTML = '<div class="w-full text-center">Loading...</div>';
    try {
      const url = `https://${RAPIDAPI_HOST}/api/imdb/title?id=${id}`;
      const res = await fetch(url, {
        headers: {
          'x-rapidapi-key': RAPIDAPI_KEY,
          'x-rapidapi-host': RAPIDAPI_HOST
        }
      });
      const movie = await res.json();
      renderDetails(movie);
    } catch (err) {
      document.getElementById('movieDetails').innerHTML = '<div class="text-red-400">Error loading movie details.</div>';
    }
  })();
}

function renderDetails(movie) {
  document.getElementById('movieDetails').innerHTML = `
    <img src="${movie.primaryImage || 'https://via.placeholder.com/200x300?text=No+Image'}" alt="${movie.primaryTitle}" class="w-full md:w-1/3 h-64 object-cover rounded mb-4 md:mb-0 md:mr-4"/>
    <div class="flex-1 flex flex-col gap-2">
      <div class="flex items-center gap-2">
        <span class="text-2xl font-bold">${movie.primaryTitle}</span>
        <span class="bg-pink-500 text-xs px-2 py-0.5 rounded">${(movie.genres||[]).join(', ')}</span>
      </div>
      <div class="flex gap-4 text-sm text-gray-300">
        <span>⭐ ${movie.averageRating || '-'}</span>
        <span>${movie.startYear || '-'}</span>
        <span>${movie.runtimeMinutes ? movie.runtimeMinutes + ' min' : ''}</span>
      </div>
      <div class="text-sm">${movie.description || ''}</div>
      <div class="text-sm"><b>Director:</b> ${(movie.directors||[]).map(d=>d.name).join(', ') || '-'}</div>
      <div class="text-sm"><b>Cast:</b> ${(movie.cast||[]).slice(0,5).map(c=>c.name).join(', ') || '-'}</div>
      <div class="text-xs text-gray-400 mt-2">IMDb: <a href="https://www.imdb.com/title/${movie.id}/" target="_blank" class="underline">View on IMDb</a></div>
    </div>
  `;
} 