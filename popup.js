let quotes = [];
let allQuotes = [];
let index = 0;
let showingFavorites = false;

/* Elements */
const quoteText = document.getElementById("quoteText");
const quoteRef = document.getElementById("quoteRef");
const nextBtn = document.getElementById("nextBtn");
const themeToggle = document.getElementById("themeToggle");
const favBtn = document.getElementById("favBtn");
const showFavsBtn = document.getElementById("showFavsBtn");

/* ---------------- Utility Functions ---------------- */

function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
}

function saveState() {
  chrome.storage.local.set({ lastIndex: index });
}

function showQuote(i) {
  if (!quotes.length) return;

  quoteText.style.opacity = 0;

  setTimeout(() => {
    quoteText.textContent = quotes[i].text;
    quoteRef.textContent = `— ${quotes[i].ref}`;
    quoteText.style.opacity = 1;
    saveState();
    updateFavoriteIcon();
  }, 200);
}

/* ---------------- Favorites ---------------- */

function updateFavoriteIcon() {
  chrome.storage.local.get({ favorites: [] }, data => {
    const isFav = data.favorites.some(
      q => q.text === quotes[index]?.text
    );
    favBtn.textContent = isFav ? "❤️" : "🤍";
  });
}

favBtn.addEventListener("click", () => {
  chrome.storage.local.get({ favorites: [] }, data => {
    let favs = data.favorites;
    const current = quotes[index];

    if (!current) return;

    const exists = favs.some(q => q.text === current.text);

    if (exists) {
      favs = favs.filter(q => q.text !== current.text);
    } else {
      favs.push(current);
    }

    chrome.storage.local.set({ favorites: favs }, updateFavoriteIcon);
  });
});

/* ---------------- Load Quotes ---------------- */

fetch(chrome.runtime.getURL("quotes.json"))
  .then(res => res.json())
  .then(data => {
    allQuotes = data;
    quotes = [...allQuotes];
    shuffleArray(quotes);

    chrome.storage.local.get("lastIndex", stored => {
      if (
        stored.lastIndex !== undefined &&
        stored.lastIndex < quotes.length
      ) {
        index = stored.lastIndex;
      }
      showQuote(index);
    });
  })
  .catch(err => {
    quoteText.textContent = "Unable to load quotes.";
    console.error(err);
  });

/* ---------------- Events ---------------- */

nextBtn.addEventListener("click", () => {
  index = (index + 1) % quotes.length;
  showQuote(index);
});

/* Favorites view toggle */
showFavsBtn.addEventListener("click", () => {
  chrome.storage.local.get({ favorites: [] }, data => {
    if (!showingFavorites) {
      if (!data.favorites.length) {
        quoteText.textContent = "No favorite quotes yet ❤️";
        quoteRef.textContent = "";
        return;
      }
      quotes = [...data.favorites];
      index = 0;
      showingFavorites = true;
      showFavsBtn.textContent = "📜 View All Quotes";
    } else {
      quotes = [...allQuotes];
      shuffleArray(quotes);
      index = 0;
      showingFavorites = false;
      showFavsBtn.textContent = "⭐ View Favorites";
    }
    showQuote(index);
  });
});

/* Dark mode toggle */
themeToggle.addEventListener("click", () => {
  document.body.classList.toggle("dark");
  themeToggle.textContent =
    document.body.classList.contains("dark") ? "☀️" : "🌙";
});
