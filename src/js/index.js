import Search from './models/Search';
import Recipe from './models/Recipe'
import * as searchView from './views/searchView';
import * as recipeView from './views/recipeView';
import { elements, renderLoader, clearLoader } from './views/base'; 

/* Global stat of the app 
	- search object
	- current recipe object
	- shopping list object
	- liked recipes
*/
const state = {};

// SEARCH CONTROLLER
const controlSearch = async () => {
	// 1 get the query from the view
	const query = searchView.getInput(); 

	if (query) {
		// 2 new search object and add to state

		state.search = new Search(query);

		// 3 prepare UI for results
		searchView.clearInput();
		searchView.clearResults();
		renderLoader(elements.searchRes);

		try {
			// 4 search for recipes
			await state.search.getResults();

			// 5 render results on UI
			clearLoader();
			searchView.renderResults(state.search.result);
		} catch (err) {
			alert('Error processing recipe');
			clearLoader();
		}
	}
}

elements.searchForm.addEventListener('submit', e => {
	e.preventDefault();

	controlSearch();
});

elements.searchResPages.addEventListener('click', e => {
	const btn = e.target.closest('.btn-inline');
	if (btn) {
		const goToPage = parseInt(btn.dataset.goto, 10);
		searchView.clearResults();
		
		searchView.renderResults(state.search.result, goToPage);
	}
});

// RECIPE CONTROLLER
const controlRecipe = async () => {
	// get id from url
	const id = window.location.hash.replace('#', '');
	
	if (id) {
		// prepare UI for changes
		recipeView.clearRecipe();
		renderLoader(elements.recipe);

		// highlight selected search item
		if (state.search) {
			searchView.highlightSelected(id);
		}

		// create new recipe
		state.recipe = new Recipe(id);

		try {
			// get recipe data
			await state.recipe.getRecipe();
			state.recipe.parseIngredients();

			// calculate servings and time
			state.recipe.calcServings();
			state.recipe.calcTime();

			// render the recipe
			clearLoader();
			recipeView.renderRecipe(state.recipe);
		} catch (err) {
			alert('Error processing recipe');
		}
		
	}
};

// window.addEventListener('hashchange', controlRecipe);
// window.addEventListener('load', controlRecipe);
['hashchange', 'load'].forEach(e => window.addEventListener(e, controlRecipe));