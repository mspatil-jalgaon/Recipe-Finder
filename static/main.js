// ===============================================
// main.js — Frontend Logic for Recipe Finder
// ------------------------------------------------
// Handles search, random recipe fetch, and modal
// display by interacting with Flask proxy endpoints.
// ===============================================

// --- API Endpoints (Flask Routes) ---
const SEARCH_API_URL = "/api/search?s=";
const RANDOM_API_URL = "/api/random";
const LOOKUP_API_URL = "/api/lookup?i=";

// --- Select DOM Elements ---
const searchForm = document.getElementById("search-form");
const searchInput = document.getElementById("search-input");
const resultsGrid = document.getElementById("results-grid");
const messageArea = document.getElementById("message-area");
const randomButton = document.getElementById("random-button");
const modal = document.getElementById("recipe-modal");
const modalContent = document.getElementById("recipe-details-content");
const modalCloseBtn = document.getElementById("modal-close-btn");

// =====================
//  SEARCH FUNCTIONALITY
// =====================
searchForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const query = searchInput.value.trim();

  if (query) {
    searchRecipes(query);
  } else {
    showMessage("Please enter a search term", true);
  }
});

// Fetch recipes from Flask proxy
async function searchRecipes(query) {
  showMessage(`Searching for "${query}"...`, false, true);
  resultsGrid.innerHTML = "";

  try {
    const response = await fetch(`${SEARCH_API_URL}${query}`);
    if (!response.ok) throw new Error("Network error");

    const data = await response.json();
    clearMessage();

    if (data.meals) {
      displayRecipes(data.meals);
    } else {
      showMessage(`No recipes found for "${query}"`, true);
    }
  } catch {
    showMessage("Something went wrong. Please try again.", true);
  }
}

// =====================
//  RANDOM RECIPE
// =====================
randomButton.addEventListener("click", getRandomRecipe);

async function getRandomRecipe() {
  showMessage("Fetching a random recipe...", false, true);
  resultsGrid.innerHTML = "";

  try {
    const response = await fetch(RANDOM_API_URL);
    if (!response.ok) throw new Error("Network issue");
    const data = await response.json();

    clearMessage();
    if (data.meals && data.meals.length > 0) {
      displayRecipes(data.meals);
    } else {
      showMessage("No random recipe found. Try again.", true);
    }
  } catch {
    showMessage("Failed to fetch a random recipe.", true);
  }
}

// =====================
//  DISPLAY RECIPES GRID
// =====================
function displayRecipes(recipes) {
  if (!recipes || recipes.length === 0) {
    showMessage("No recipes to display");
    return;
  }

  recipes.forEach((recipe) => {
    const card = document.createElement("div");
    card.classList.add("recipe-item");
    card.dataset.id = recipe.idMeal;

    card.innerHTML = `
      <img src="${recipe.strMealThumb}" alt="${recipe.strMeal}" loading="lazy">
      <h3>${recipe.strMeal}</h3>
    `;

    resultsGrid.appendChild(card);
  });
}

// =====================
//  MODAL & DETAILS VIEW
// =====================

// Click on recipe → Show details
resultsGrid.addEventListener("click", (e) => {
  const card = e.target.closest(".recipe-item");
  if (card) {
    getRecipeDetails(card.dataset.id);
  }
});

// Fetch full recipe details by ID
async function getRecipeDetails(id) {
  modalContent.innerHTML = '<p class="message loading">Loading details...</p>';
  showModal();

  try {
    const response = await fetch(`${LOOKUP_API_URL}${id}`);
    if (!response.ok) throw new Error("Failed to fetch details.");
    const data = await response.json();

    if (data.meals && data.meals.length > 0) {
      displayRecipeDetails(data.meals[0]);
    } else {
      modalContent.innerHTML =
        '<p class="message error">Recipe details unavailable.</p>';
    }
  } catch {
    modalContent.innerHTML =
      '<p class="message error">Error loading recipe details.</p>';
  }
}

// Show modal
function showModal() {
  modal.classList.remove("hidden");
  document.body.style.overflow = "hidden";
}

// Close modal
function closeModal() {
  modal.classList.add("hidden");
  document.body.style.overflow = "";
}

// Close modal on click outside or button
modalCloseBtn.addEventListener("click", closeModal);
modal.addEventListener("click", (e) => {
  if (e.target === modal) closeModal();
});

// Display formatted recipe details
function displayRecipeDetails(recipe) {
  const ingredients = [];
  for (let i = 1; i <= 20; i++) {
    const ing = recipe[`strIngredient${i}`]?.trim();
    const measure = recipe[`strMeasure${i}`]?.trim();
    if (ing) ingredients.push(`<li>${measure ? `${measure} ` : ""}${ing}</li>`);
  }

  modalContent.innerHTML = `
    <h2>${recipe.strMeal}</h2>
    <img src="${recipe.strMealThumb}" alt="${recipe.strMeal}">
    ${recipe.strCategory ? `<h3>Category: ${recipe.strCategory}</h3>` : ""}
    ${recipe.strArea ? `<h3>Area: ${recipe.strArea}</h3>` : ""}
    ${ingredients.length ? `<h3>Ingredients</h3><ul>${ingredients.join("")}</ul>` : ""}
    <h3>Instructions</h3>
    <p>${recipe.strInstructions?.replace(/\r?\n/g, "<br>") || "No instructions available."}</p>
    ${
      recipe.strYoutube
        ? `<h3>Video Recipe</h3><a href="${recipe.strYoutube}" target="_blank">Watch on YouTube</a>`
        : ""
    }
    ${
      recipe.strSource
        ? `<div><a href="${recipe.strSource}" target="_blank">View Original Source</a></div>`
        : ""
    }
  `;
}

// =====================
//  UTILITY FUNCTIONS
// =====================
function showMessage(message, isError = false, isLoading = false) {
  messageArea.textContent = message;
  messageArea.className = "message";
  if (isError) messageArea.classList.add("error");
  if (isLoading) messageArea.classList.add("loading");
}

function clearMessage() {
  messageArea.textContent = "";
  messageArea.className = "message";
}
