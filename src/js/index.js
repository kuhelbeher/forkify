import Search from './models/Search';
import Recipe from './models/Recipe';
import List from './models/List';
import Likes from './models/Likes';
import * as searchView from './views/searchView';
import * as recipeView from './views/recipeView';
import * as listView from './views/listView';
import * as likesView from './views/likesView';
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
			recipeView.renderRecipe(state.recipe, state.likes.isLiked(id));
		} catch (err) {
			alert('Error processing recipe');
		}

	}
};

// window.addEventListener('hashchange', controlRecipe);
// window.addEventListener('load', controlRecipe);
['hashchange', 'load'].forEach(e => window.addEventListener(e, controlRecipe));



// LIST CONTROLLER
const controlList = () => {
	// create a new list if there isn't one yet
	if (!state.list) {
		state.list = new List();
	}

	// add each ingredients to the list and UI
	state.recipe.ingredients.forEach(el => {
		const item = state.list.addItem(el.count, el.unit, el.ingredient);
		listView.renderItem(item);
	});
}

// Handle delete and update list item events
elements.shopping.addEventListener('click', e => {
	const id = e.target.closest('.shopping__item').dataset.itemid;

	// handle the delete button
	if (e.target.matches('.shopping__delete, .shopping__delete *')) {
		// delete from state
		state.list.deleteItem(id);
		// delete from UI
		listView.deleteItem(id);
		// handle the update button
	} else if (e.target.matches('.shopping__count-value')) {
		const val = parseFloat(e.target.value, 10);
		if (val >= 0) {
			state.list.updateCount(id, val);
		} else {
			e.target.value = 0;
		}
	}
});




// LIKE CONTROLLER
const controlLike = () => {
	if (!state.likes) {
		state.likes = new Likes();
	}

	// user has not yet liked current recipe
	const currentID = state.recipe.id;
	if (!state.likes.isLiked(currentID)) {
		// add like to the state
		const newLike = state.likes.addLike(
			currentID,
			state.recipe.title,
			state.recipe.author,
			state.recipe.img
		);

		// toggle the like button
		likesView.toggleLikeBtn(true);

		// add like to UI list
		likesView.renderLike(newLike);

	// user has yet liked current recipe
	} else {
		// remove like from the state
		state.likes.deleteLike(currentID);

		// toggle the like button
		likesView.toggleLikeBtn(false);

		// remove like from UI list
		likesView.deleteLike(currentID);
	}

	likesView.toggleLikeMenu(state.likes.getNumLikes());
};

// restore liked recipes on page load
window.addEventListener('load', () => {
	state.likes = new Likes();

	// restore likes
	state.likes.readStorage();

	// toggle button
	likesView.toggleLikeMenu(state.likes.getNumLikes());

	// render the existing likes
	state.likes.likes.forEach(like => likesView.renderLike(like));
});


// handling recipe button clicks
elements.recipe.addEventListener('click', e => {
	if (e.target.matches('.btn-decrease, .btn-decrease *')) {
		// Decrease button is clicked
		if (state.recipe.servings > 1) {
			state.recipe.updateServings('dec');
			recipeView.updateServingsIngredients(state.recipe);
		}
	} else if (e.target.matches('.btn-increase, .btn-increase *')) {
		// Increase button is clicked
		state.recipe.updateServings('inc');
		recipeView.updateServingsIngredients(state.recipe);
	} else if (e.target.matches('.recipe__btn--add, .recipe__btn--add *')) {
		// add ingredients to shopping list
		controlList();
	} else if (e.target.matches('.recipe__love, .recipe__love *')) {
		// Like controller
		controlLike();
	}
});