document.addEventListener("DOMContentLoaded", () => {
	const categoryCards = document.querySelectorAll(".category-card");
	const viewAllBtn = document.querySelector(".view-all-btn");
	const recipesGrid = document.getElementById("recipes-grid");
	const recipesCount = document.getElementById("recipes-count");
	const gridViewBtn = document.getElementById("grid-view-btn");
	const listViewBtn = document.getElementById("list-view-btn");
	const sectionTitle = document.querySelector("#all-recipes-section h2");
	const allRecipesSection = document.getElementById("all-recipes-section");
	const mealSearchInput = document.getElementById("search-input");
	const filterButtons = document.querySelectorAll(
		"#search-filters-section button",
	);
	const searchFilter = document.getElementById("search-filters-section");
	const mealcategoriessection = document.getElementById(
		"meal-categories-section",
	);
	const mealdetails = document.getElementById("meal-details");
	const productssection = document.getElementById("products-section");
	const foodlogsection = document.getElementById("foodlog-section");
	const tabs = [
		{
			btn: document.getElementById("li-1"),
			section: document.getElementById("hero-section"),
		},
		{
			btn: document.getElementById("li-2"),
			section: document.getElementById("products-section"),
		},
		{
			btn: document.getElementById("li-3"),
			section: document.getElementById("foodlog-section"),
		},
	];
	tabs.forEach((tab) => {
		if (!tab.btn) return;
		tab.btn.addEventListener("click", () => {
			tabs.forEach((item) => {
				if (item.section) {
					item.section.classList.add("hidden");
				}
				if (item.btn) {
					item.btn.classList.remove("bg-emerald-50", "text-emerald-700");
					item.btn.classList.add("text-gray-600");
				}
			});
			if (tab.section) {
				tab.section.classList.remove("hidden");
			}
			tab.btn.classList.add("bg-emerald-50", "text-emerald-700");
			tab.btn.classList.remove("text-gray-600");
		});
	});
	const backBtn = document.getElementById("back-to-meals-btn");
	if (backBtn) {
		backBtn.addEventListener("click", function () {
			backToRecipes();
		});
	}
	async function fetchRecipes(url, title = "All Recipes") {
		try {
			if (sectionTitle) {
				sectionTitle.textContent = title;
			}
			if (recipesGrid) {
				recipesGrid.innerHTML = `
                    <div
                        class="col-span-full text-center
                               py-10 text-gray-500
                               font-semibold text-lg"
                    >
                        <i
                            class="fa-solid
                                   fa-spinner
                                   fa-spin
                                   mr-2"
                        ></i>
                        جاري تحميل الوصفات...
                    </div>
                `;
			}
			const response = await fetch(url);
			if (!response.ok) {
				throw new Error(`HTTP Error: ${response.status}`);
			}
			const data = await response.json();
			let mealsArray = [];
			if (Array.isArray(data)) {
				mealsArray = data;
			} else if (data && Array.isArray(data.meals)) {
				mealsArray = data.meals;
			} else if (data && Array.isArray(data.data)) {
				mealsArray = data.data;
			} else if (data && typeof data === "object") {
				const arrayKey = Object.keys(data).find((key) =>
					Array.isArray(data[key]),
				);
				if (arrayKey) {
					mealsArray = data[arrayKey];
				}
			}
			displayRecipes(mealsArray);
		} catch (error) {
			console.error("Error fetching recipes:", error);
			if (recipesGrid) {
				recipesGrid.innerHTML = `
                    <div
                        class="col-span-full
                               text-center
                               py-10
                               text-red-500
                               font-semibold
                               text-lg"
                    >
                        حدث خطأ أثناء تحميل الوصفات.
                        يرجى المحاولة لاحقاً.
                    </div>
                `;
			}
		}
	}
	function displayRecipes(meals) {
		if (!recipesGrid) return;
		if (!Array.isArray(meals) || meals.length === 0) {
			recipesGrid.innerHTML = `
                <div
                    class="col-span-full
                           text-center
                           py-10
                           text-gray-500
                           font-semibold
                           text-lg"
                >
                    لا توجد وصفات متاحة مطابقة لبحثك.
                </div>
            `;
			if (recipesCount) {
				recipesCount.textContent = "Showing 0 recipes";
			}
			return;
		}
		if (recipesCount) {
			recipesCount.textContent = `Showing ${meals.length} recipes`;
		}
		const mealsHTML = meals
			.map((meal) => {
				const mealId = meal.idMeal || meal._id || meal.id || "";
				const mealName =
					meal.strMeal ||
					meal.title ||
					meal.name ||
					meal.recipeName ||
					"Unnamed Recipe";
				const mealCategory =
					meal.strCategory || meal.category || meal.type || "Meal";
				const mealArea = meal.strArea || meal.area || meal.country || "Unknown";
				const mealThumb =
					meal.strMealThumb || meal.image || meal.thumbnail || meal.photo || "";
				const rawInstructions =
					meal.instructions || meal.strInstructions || meal.description;
				const mealInstructions = formatInstructions(rawInstructions);
				const imgTag = mealThumb
					? `
                            <img
                                class="w-full h-full
                                       object-cover
                                       group-hover:scale-110
                                       transition-transform
                                       duration-500"
                                src="${escapeHTML(mealThumb)}"
                                alt="${escapeHTML(mealName)}"
                                loading="lazy"
                            />
                        `
					: `
                            <div
                                class="w-full h-full
                                       flex items-center
                                       justify-center
                                       bg-gray-200
                                       text-gray-400
                                       text-xs"
                            >
                                No Image
                            </div>
                        `;
				return `
                    <div
                        class="recipe-card
                               bg-white
                               rounded-xl
                               overflow-hidden
                               shadow-sm
                               hover:shadow-lg
                               transition-all
                               cursor-pointer
                               group
                               flex
                               flex-col
                               h-full"
                        data-meal-id="${escapeHTML(mealId)}"
                    >
                        <div
                            class="relative
                                   h-48
                                   overflow-hidden
                                   shrink-0
                                   bg-gray-100"
                        >
                            ${imgTag}
                            <div
                                class="absolute
                                       bottom-3
                                       left-3
                                       flex
                                       gap-2"
                            >
                                ${
																	mealCategory !== "Meal"
																		? `
                                            <span
                                                class="px-2 py-1
                                                       bg-white/90
                                                       backdrop-blur-sm
                                                       text-xs
                                                       font-semibold
                                                       rounded-full
                                                       text-gray-700"
                                            >
                                                ${escapeHTML(mealCategory)}
                                            </span>
                                        `
																		: ""
																}
                                ${
																	mealArea !== "Unknown"
																		? `
                                            <span
                                                class="px-2 py-1
                                                       bg-emerald-500
                                                       text-xs
                                                       font-semibold
                                                       rounded-full
                                                       text-white"
                                            >
                                                ${escapeHTML(mealArea)}
                                            </span>
                                        `
																		: ""
																}
                            </div>
                        </div>
                        <div
                            class="p-4
                                   flex
                                   flex-col
                                   flex-grow"
                        >
                            <h3
                                class="text-base
                                       font-bold
                                       text-gray-900
                                       mb-1
                                       group-hover:text-emerald-600
                                       transition-colors
                                       line-clamp-1"
                            >
                                ${escapeHTML(mealName)}
                            </h3>
                            <p
                                class="text-xs
                                       text-gray-600
                                       mb-3
                                       line-clamp-2"
                            >
                                ${escapeHTML(
																	mealInstructions.substring(0, 80),
																)}...
                            </p>
                            <div
                                class="flex
                                       items-center
                                       justify-between
                                       text-xs
                                       mt-auto
                                       pt-3
                                       border-t
                                       border-gray-100"
                            >
                                <span
                                    class="font-semibold
                                           text-gray-900"
                                >
                                    <i
                                        class="fa-solid
                                               fa-utensils
                                               text-emerald-600
                                               mr-1"
                                    ></i>
                                    ${escapeHTML(mealCategory)}
                                </span>
                                <span
                                    class="font-semibold
                                           text-gray-500"
                                >
                                    <i
                                        class="fa-solid
                                               fa-globe
                                               text-blue-500
                                               mr-1"
                                    ></i>
                                    ${escapeHTML(mealArea)}
                                </span>
                            </div>
                        </div>
                    </div>
                `;
			})
			.join("");
		recipesGrid.innerHTML = mealsHTML;
		document.querySelectorAll(".recipe-card").forEach((card) => {
			card.addEventListener("click", function () {
				const mealId = this.getAttribute("data-meal-id");
				if (mealId) {
					showMealDetails(mealId);
				}
			});
		});
	}
	function setViewMode(mode) {
		if (!recipesGrid) return;
		if (mode === "list") {
			recipesGrid.className = "grid gap-5 grid-cols-2";
			if (listViewBtn) {
				listViewBtn.classList.add("bg-white", "shadow-sm", "rounded-md");
				listViewBtn
					.querySelector("i")
					?.classList.replace("text-gray-500", "text-gray-700");
			}
			if (gridViewBtn) {
				gridViewBtn.classList.remove("bg-white", "shadow-sm", "rounded-md");
				gridViewBtn
					.querySelector("i")
					?.classList.replace("text-gray-700", "text-gray-500");
			}
		} else {
			recipesGrid.className =
				"grid gap-5 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4";
			if (gridViewBtn) {
				gridViewBtn.classList.add("bg-white", "shadow-sm", "rounded-md");
				gridViewBtn
					.querySelector("i")
					?.classList.replace("text-gray-500", "text-gray-700");
			}
			if (listViewBtn) {
				listViewBtn.classList.remove("bg-white", "shadow-sm", "rounded-md");
				listViewBtn
					.querySelector("i")
					?.classList.replace("text-gray-700", "text-gray-500");
			}
		}
	}
	if (mealSearchInput) {
		let searchTimeout;
		mealSearchInput.addEventListener("input", (e) => {
			clearTimeout(searchTimeout);
			const query = e.target.value.trim();
			searchTimeout = setTimeout(() => {
				const searchUrl = `https://nutriplan-api.vercel.app/api/meals/search?q=${encodeURIComponent(query)}&page=1&limit=25`;
				fetchRecipes(
					searchUrl,
					query ? `Search Results for "${query}"` : "All Recipes",
				);
			}, 300);
		});
	}
	filterButtons.forEach((button) => {
		button.addEventListener("click", function () {
			filterButtons.forEach((btn) => {
				btn.className =
					"px-4 py-2 bg-gray-100 text-gray-700 rounded-full font-medium text-sm whitespace-nowrap hover:bg-gray-200 transition-all";
			});
			this.className =
				"px-4 py-2 bg-emerald-600 text-white rounded-full font-medium text-sm whitespace-nowrap hover:bg-emerald-700 transition-all";
			const countryName = this.textContent.trim();
			if (countryName === "All Recipes") {
				fetchRecipes(
					`https://nutriplan-api.vercel.app/api/meals/search?q=&page=1&limit=25`,
					"All Recipes",
				);
			} else {
				const filterUrl = `https://nutriplan-api.vercel.app/api/meals/filter?area=${encodeURIComponent(countryName)}&page=1&limit=25`;
				fetchRecipes(filterUrl, `${countryName} Recipes`);
			}
			if (allRecipesSection) {
				allRecipesSection.scrollIntoView({
					behavior: "smooth",
					block: "start",
				});
			}
		});
	});
	categoryCards.forEach((card) => {
		card.addEventListener("click", function () {
			const categoryName = this.getAttribute("data-category");
			const categoryUrl = `https://nutriplan-api.vercel.app/api/meals/filter?category=${encodeURIComponent(categoryName)}&page=1&limit=25`;
			fetchRecipes(categoryUrl, `${categoryName} Recipes`);
			if (allRecipesSection) {
				allRecipesSection.scrollIntoView({
					behavior: "smooth",
					block: "start",
				});
			}
		});
	});
	if (viewAllBtn) {
		viewAllBtn.addEventListener("click", function () {
			fetchRecipes(
				`https://nutriplan-api.vercel.app/api/meals/search?q=&page=1&limit=25`,
				"All Recipes",
			);
			if (allRecipesSection) {
				allRecipesSection.scrollIntoView({
					behavior: "smooth",
					block: "start",
				});
			}
		});
	}
	if (gridViewBtn) {
		gridViewBtn.addEventListener("click", () => setViewMode("grid"));
	}
	if (listViewBtn) {
		listViewBtn.addEventListener("click", () => setViewMode("list"));
	}
	fetchRecipes(
		`https://nutriplan-api.vercel.app/api/meals/search?q=&page=1&limit=25`,
		"All Recipes",
	);
});
function formatInstructions(inst) {
	if (!inst) {
		return "Delicious recipe to try!";
	}
	if (typeof inst === "string") {
		return inst;
	}
	if (Array.isArray(inst)) {
		return inst.map((item) => formatInstructions(item)).join("\n");
	}
	if (typeof inst === "object") {
		if (inst.text) {
			return formatInstructions(inst.text);
		}
		if (inst.description) {
			return formatInstructions(inst.description);
		}
		if (inst.en) {
			return formatInstructions(inst.en);
		}
		if (inst.ar) {
			return formatInstructions(inst.ar);
		}
		const textValues = Object.values(inst).filter(
			(val) => typeof val === "string",
		);
		if (textValues.length > 0) {
			return textValues.join("\n");
		}
		try {
			return JSON.stringify(inst, null, 2);
		} catch (e) {
			return "Delicious recipe to try!";
		}
	}
	return String(inst);
}
function showMealDetails(mealId) {
	const searchFilters = document.getElementById("search-filters-section");
	const mealCategories = document.getElementById("meal-categories-section");
	const allRecipes = document.getElementById("all-recipes-section");
	const mealDetails = document.getElementById("meal-details");
	if (searchFilters) {
		searchFilters.classList.add("hidden");
	}
	if (mealCategories) {
		mealCategories.classList.add("hidden");
	}
	if (allRecipes) {
		allRecipes.classList.add("hidden");
	}
	if (mealDetails) {
		mealDetails.classList.remove("hidden");
		loadMealDetails(mealId);
	} else {
		console.error("Element with id 'meal-details' not found in HTML!");
	}
}
function backToRecipes() {
	const searchFilters = document.getElementById("search-filters-section");
	const mealCategories = document.getElementById("meal-categories-section");
	const allRecipes = document.getElementById("all-recipes-section");
	const mealDetails = document.getElementById("meal-details");
	if (searchFilters) {
		searchFilters.classList.remove("hidden");
	}
	if (mealCategories) {
		mealCategories.classList.remove("hidden");
	}
	if (allRecipes) {
		allRecipes.classList.remove("hidden");
	}
	if (mealDetails) {
		mealDetails.classList.add("hidden");
	}
}
function prepareMealDetailsDom() {
	const mealDetails = document.getElementById("meal-details");
	if (!mealDetails) {
		return null;
	}
	const result = {
		title: null,
		image: null,
		badges: null,
		time: null,
		servings: null,
		caloriesHero: null,
		ingredientsGrid: null,
		ingredientsCount: null,
		instructionsList: null,
		videoIframe: null,
		nutritionContainer: null,
	};
	result.image = mealDetails.querySelector("#meal-image");
	result.title = mealDetails.querySelector("#meal-title");
	if (!result.title) {
		result.title = mealDetails.querySelector(".absolute.bottom-0 h1");
		if (result.title) {
			result.title.id = "meal-title";
		}
	}
	result.badges = mealDetails.querySelector(
		".absolute.bottom-0 .flex.items-center.gap-3.mb-3",
	);
	if (!result.badges) {
		const heroBottom = mealDetails.querySelector(".absolute.bottom-0");
		if (heroBottom) {
			result.badges = heroBottom.querySelector("div.flex");
		}
	}
	const heroMeta = mealDetails.querySelector(
		".absolute.bottom-0 .flex.items-center.gap-6",
	);
	if (heroMeta) {
		const metaSpans = heroMeta.querySelectorAll(":scope > span");
		if (metaSpans[0]) {
			result.time = metaSpans[0].querySelector("span");
			if (result.time) {
				result.time.id = "hero-time";
			}
		}
		if (metaSpans[1]) {
			result.servings = metaSpans[1].querySelector("span");
			if (result.servings) {
				result.servings.id = "hero-servings";
			}
		}
		if (metaSpans[2]) {
			result.caloriesHero = metaSpans[2].querySelector("span");
			if (result.caloriesHero) {
				result.caloriesHero.id = "hero-calories";
			}
		}
	}
	result.ingredientsGrid = mealDetails.querySelector("#ingredients-grid");
	if (!result.ingredientsGrid) {
		const headings = mealDetails.querySelectorAll("h2");
		for (const heading of headings) {
			if (
				heading.textContent.trim().toLowerCase() === "ingredients".toLowerCase()
			) {
				const parent = heading.closest(".bg-white");
				if (parent) {
					const grids = parent.querySelectorAll(".grid");
					for (const grid of grids) {
						if (grid.querySelector('input[type="checkbox"]')) {
							result.ingredientsGrid = grid;
							result.ingredientsGrid.id = "ingredients-grid";
							break;
						}
					}
				}
			}
			if (result.ingredientsGrid) {
				break;
			}
		}
	}
	if (result.ingredientsGrid) {
		const parentCard = result.ingredientsGrid.closest(".bg-white");
		if (parentCard) {
			const countElement = parentCard.querySelector("h2 .ml-auto");
			if (countElement) {
				countElement.id = "ingredients-count";
				result.ingredientsCount = countElement;
			}
		}
	}
	result.instructionsList = mealDetails.querySelector("#instructions-list");
	if (!result.instructionsList) {
		const headings = mealDetails.querySelectorAll("h2");
		for (const heading of headings) {
			if (
				heading.textContent.trim().toLowerCase() ===
				"instructions".toLowerCase()
			) {
				const parent = heading.closest(".bg-white");
				if (parent) {
					const candidates = parent.querySelectorAll(":scope > div");
					for (const candidate of candidates) {
						const directRows = candidate.querySelectorAll(":scope > div");
						if (
							directRows.length > 0 &&
							candidate.querySelector(".rounded-full.bg-emerald-600")
						) {
							result.instructionsList = candidate;
							result.instructionsList.id = "instructions-list";
							break;
						}
					}
				}
			}
			if (result.instructionsList) {
				break;
			}
		}
	}
	result.videoIframe = mealDetails.querySelector("#video-iframe");
	if (!result.videoIframe) {
		result.videoIframe = mealDetails.querySelector("iframe");
		if (result.videoIframe) {
			result.videoIframe.id = "video-iframe";
		}
	}
	result.nutritionContainer = mealDetails.querySelector(
		"#nutrition-facts-container",
	);
	return result;
}
async function analyzeMealNutrition(meal) {
	try {
		const ingredients = Array.isArray(meal.ingredients)
			? meal.ingredients
					.map((item) => {
						const measure = item?.measure || "";
						const ingredient = item?.ingredient || "";
						return `
                            ${measure}
                            ${ingredient}
                        `.trim();
					})
					.filter(Boolean)
			: [];
		if (ingredients.length === 0) {
			console.warn("No ingredients available for nutrition analysis.");
			return null;
		}
		const response = await fetch(
			"https://nutriplan-api.vercel.app/api/nutrition/analyze",
			{
				method: "POST",
				headers: {
					"Content-Type": "application/json",
					"x-api-key": "9kFTgKAswPWO0HKnEuVnawhuhXhjeNstkPczyOJW",
				},
				body: JSON.stringify({
					recipeName: meal.name || "Recipe",
					ingredients: ingredients,
				}),
			},
		);
		if (!response.ok) {
			throw new Error(`Nutrition API HTTP Error: ${response.status}`);
		}
		const result = await response.json();
		console.log("Nutrition API Response:", result);
		if (!result || result.success === false) {
			return null;
		}
		return result.data || null;
	} catch (error) {
		console.error("Nutrition analysis error:", error);
		return null;
	}
	console.log(result);
}
function setElementText(element, value, fallback = "--") {
	if (!element) return;
	element.textContent =
		value !== undefined && value !== null && value !== "" ? value : fallback;
}
function renderNutritionFacts(nutritionData, mealDom) {
	const container =
		mealDom?.nutritionContainer ||
		document.getElementById("nutrition-facts-container");
	if (!container) {
		return;
	}
	if (!nutritionData) {
		container.innerHTML = `
            <p class="text-sm text-gray-500 mb-4">
                Per serving
            </p>
            <div
                class="text-center
                       py-6
                       bg-gray-50
                       rounded-xl"
            >
                <i
                    class="fa-solid
                           fa-chart-pie
                           text-3xl
                           text-gray-300
                           mb-3"
                ></i>
                <p class="text-gray-500">
                    Nutrition information
                    is not available.
                </p>
            </div>
        `;
		return;
	}
	const perServing = nutritionData.perServing || {};
	const totals = nutritionData.totals || {};
	const servings = nutritionData.servings ?? "--";
	const totalWeight = nutritionData.totalWeight ?? "--";
	const nutritionRows = [
		{
			key: "protein",
			label: "Protein",
			value: perServing.protein,
			unit: "g",
			color: "emerald",
		},
		{
			key: "carbs",
			label: "Carbs",
			value: perServing.carbs,
			unit: "g",
			color: "blue",
		},
		{
			key: "fat",
			label: "Fat",
			value: perServing.fat,
			unit: "g",
			color: "purple",
		},
		{
			key: "fiber",
			label: "Fiber",
			value: perServing.fiber,
			unit: "g",
			color: "orange",
		},
		{
			key: "sugar",
			label: "Sugar",
			value: perServing.sugar,
			unit: "g",
			color: "pink",
		},
		{
			key: "saturatedFat",
			label: "Saturated Fat",
			value: perServing.saturatedFat,
			unit: "g",
			color: "red",
		},
		{
			key: "cholesterol",
			label: "Cholesterol",
			value: perServing.cholesterol,
			unit: "mg",
			color: "yellow",
		},
		{
			key: "sodium",
			label: "Sodium",
			value: perServing.sodium,
			unit: "mg",
			color: "cyan",
		},
	];
	const getBarWidth = (value, maxValue) => {
		const numeric = Number(value);
		if (!Number.isFinite(numeric) || numeric <= 0) {
			return 0;
		}
		return Math.min((numeric / Number(maxValue)) * 100, 100);
	};
	const maxValues = {
		protein: Math.max(Number(perServing.protein) || 0, 50),
		carbs: Math.max(Number(perServing.carbs) || 0, 100),
		fat: Math.max(Number(perServing.fat) || 0, 50),
		fiber: Math.max(Number(perServing.fiber) || 0, 30),
		sugar: Math.max(Number(perServing.sugar) || 0, 50),
		saturatedFat: Math.max(Number(perServing.saturatedFat) || 0, 30),
		cholesterol: Math.max(Number(perServing.cholesterol) || 0, 300),
		sodium: Math.max(Number(perServing.sodium) || 0, 1000),
	};
	container.innerHTML = `
        <p class="text-sm text-gray-500 mb-4">
            Per serving
        </p>
        <div
            class="text-center
                   py-4
                   mb-4
                   bg-gradient-to-br
                   from-emerald-50
                   to-teal-50
                   rounded-xl"
        >
            <p
                class="text-sm
                       text-gray-600"
            >
                Calories per serving
            </p>
            <p
                class="text-4xl
                       font-bold
                       text-emerald-600"
            >
                ${perServing.calories ?? "--"}
            </p>
            <p
                class="text-xs
                       text-gray-500
                       mt-1"
            >
                Total:
                ${totals.calories ?? "--"}
                cal
            </p>
        </div>
        <div
            class="grid
                   grid-cols-2
                   gap-3
                   mb-6"
        >
            <div
                class="bg-gray-50
                       rounded-xl
                       p-3"
            >
                <p
                    class="text-xs
                           text-gray-500"
                >
                    Servings
                </p>
                <p
                    class="font-bold
                           text-gray-900"
                >
                    ${servings}
                </p>
            </div>
            <div
                class="bg-gray-50
                       rounded-xl
                       p-3"
            >
                <p
                    class="text-xs
                           text-gray-500"
                >
                    Total Weight
                </p>
                <p
                    class="font-bold
                           text-gray-900"
                >
                    ${totalWeight !== "--" ? `${totalWeight}g` : "--"}
                </p>
            </div>
        </div>
        <div class="space-y-4">
            ${nutritionRows
							.map((row) => {
								const width = getBarWidth(row.value, maxValues[row.key]);
								return `
                            <div>
                                <div
                                    class="flex
                                           items-center
                                           justify-between"
                                >
                                    <div
                                        class="flex
                                               items-center
                                               gap-2"
                                    >
                                        <div
                                            class="w-3
                                                   h-3
                                                   rounded-full
                                                   bg-${row.color}-500"
                                        ></div>
                                        <span
                                            class="text-gray-700"
                                        >
                                            ${row.label}
                                        </span>
                                    </div>
                                    <span
                                        class="font-bold
                                               text-gray-900"
                                    >
                                        ${
																					row.value !== undefined &&
																					row.value !== null
																						? `${row.value}${row.unit}`
																						: "--"
																				}
                                    </span>
                                </div>
                                <div
                                    class="w-full
                                           bg-gray-100
                                           rounded-full
                                           h-2
                                           mt-2"
                                >
                                    <div
                                        class="bg-${row.color}-500
                                               h-2
                                               rounded-full
                                               transition-all
                                               duration-500"
                                        style="
                                            width:${width}%;
                                        "
                                    ></div>
                                </div>
                            </div>
                        `;
							})
							.join("")}
        </div>
        <div
            class="mt-6
                   pt-6
                   border-t
                   border-gray-100"
        >
            <h3
                class="text-sm
                       font-semibold
                       text-gray-900
                       mb-3"
            >
                Total Recipe
            </h3>
            <div
                class="grid
                       grid-cols-2
                       gap-3
                       text-sm"
            >
                <div
                    class="flex
                           justify-between"
                >
                    <span
                        class="text-gray-600"
                    >
                        Calories
                    </span>
                    <span
                        class="font-medium"
                    >
                        ${totals.calories ?? "--"}
                    </span>
                </div>
                <div
                    class="flex
                           justify-between"
                >
                    <span
                        class="text-gray-600"
                    >
                        Protein
                    </span>
                    <span
                        class="font-medium"
                    >
                        ${
													totals.protein !== undefined
														? `${totals.protein}g`
														: "--"
												}
                    </span>
                </div>
                <div
                    class="flex
                           justify-between"
                >
                    <span
                        class="text-gray-600"
                    >
                        Carbs
                    </span>
                    <span
                        class="font-medium"
                    >
                        ${
													totals.carbs !== undefined ? `${totals.carbs}g` : "--"
												}
                    </span>
                </div>
                <div
                    class="flex
                           justify-between"
                >
                    <span
                        class="text-gray-600"
                    >
                        Fat
                    </span>
                    <span
                        class="font-medium"
                    >
                        ${totals.fat !== undefined ? `${totals.fat}g` : "--"}
                    </span>
                </div>
            </div>
        </div>
    `;
}
async function loadMealDetails(mealId) {
	try {
		const mealDom = prepareMealDetailsDom();
		setElementText(mealDom?.title, "Loading...");
		const response = await fetch(
			`https://nutriplan-api.vercel.app/api/meals/${encodeURIComponent(mealId)}`,
		);
		if (!response.ok) {
			throw new Error(`Meal API HTTP Error: ${response.status}`);
		}
		const data = await response.json();
		console.log("Meal API Response:", data);
		const meal = data?.result || data?.meal || data?.data || data;
		if (!meal) {
			throw new Error("Meal data not found");
		}
		console.log("Meal:", meal);
		if (mealDom?.image) {
			mealDom.image.src = meal.thumbnail || meal.image || "";
			mealDom.image.alt = meal.name || "Meal Image";
		}
		setElementText(mealDom?.title, meal.name, "Unnamed Recipe");
		if (mealDom?.badges) {
			const category = meal.category || meal.strCategory || "Unknown";
			const area = meal.area || meal.strArea || "Unknown";
			const tags = Array.isArray(meal.tags) ? meal.tags : [];
			const thirdBadge = tags[0] || tags[1] || "Recipe";
			mealDom.badges.innerHTML = `
                <span
                    class="px-3 py-1
                           bg-emerald-500
                           text-white
                           text-sm
                           font-semibold
                           rounded-full"
                >
                    ${escapeHTML(category)}
                </span>
                <span
                    class="px-3 py-1
                           bg-blue-500
                           text-white
                           text-sm
                           font-semibold
                           rounded-full"
                >
                    ${escapeHTML(area)}
                </span>
                <span
                    class="px-3 py-1
                           bg-purple-500
                           text-white
                           text-sm
                           font-semibold
                           rounded-full"
                >
                    ${escapeHTML(thirdBadge)}
                </span>
            `;
		}
		const cookTime =
			meal.cookTime ??
			meal.time ??
			meal.readyInMinutes ??
			meal.prepTime ??
			null;
		const ingredients = Array.isArray(meal.ingredients) ? meal.ingredients : [];
		if (mealDom?.ingredientsGrid) {
			if (ingredients.length > 0) {
				mealDom.ingredientsGrid.innerHTML = ingredients
					.map((item) => {
						const ingredientName = escapeHTML(item?.ingredient || "");
						const ingredientMeasure = escapeHTML(item?.measure || "");
						return `
                                <div
                                    class="flex
                                           items-center
                                           gap-3
                                           p-3
                                           bg-gray-50
                                           rounded-xl
                                           hover:bg-emerald-50
                                           transition-colors"
                                >
                                    <input
                                        type="checkbox"
                                        class="ingredient-checkbox
                                               w-5 h-5
                                               text-emerald-600
                                               rounded
                                               border-gray-300"
                                    />
                                    <span
                                        class="text-gray-700"
                                    >
                                        <span
                                            class="font-medium
                                                   text-gray-900"
                                        >
                                            ${ingredientMeasure}
                                        </span>
                                        ${ingredientName}
                                    </span>
                                </div>
                            `;
					})
					.join("");
			} else {
				mealDom.ingredientsGrid.innerHTML = `
                    <div
                        class="col-span-full
                               text-center
                               text-gray-500
                               py-4"
                    >
                        No ingredients available.
                    </div>
                `;
			}
		}
		if (mealDom?.ingredientsCount) {
			mealDom.ingredientsCount.textContent = `${ingredients.length} items`;
		}
		const instructions = Array.isArray(meal.instructions)
			? meal.instructions
			: [];
		if (mealDom?.instructionsList) {
			if (instructions.length > 0) {
				mealDom.instructionsList.innerHTML = instructions
					.map((step, index) => {
						return `
                                    <div
                                        class="flex
                                               gap-4
                                               p-4
                                               rounded-xl
                                               hover:bg-gray-50
                                               transition-colors"
                                    >
                                        <div
                                            class="w-10
                                                   h-10
                                                   rounded-full
                                                   bg-emerald-600
                                                   text-white
                                                   flex
                                                   items-center
                                                   justify-center
                                                   font-bold
                                                   shrink-0"
                                        >
                                            ${index + 1}
                                        </div>
                                        <p
                                            class="text-gray-700
                                                   leading-relaxed
                                                   pt-2"
                                        >
                                            ${escapeHTML(
																							formatInstructions(step),
																						)}
                                        </p>
                                    </div>
                                `;
					})
					.join("");
			} else {
				mealDom.instructionsList.innerHTML = `
                    <div
                        class="text-gray-500
                               p-4"
                    >
                        No instructions available.
                    </div>
                `;
			}
		}
		if (mealDom?.videoIframe) {
			if (meal.youtube) {
				let youtubeUrl = meal.youtube;
				if (youtubeUrl.includes("watch?v=")) {
					const videoId = youtubeUrl.split("watch?v=")[1]?.split("&")[0];
					if (videoId) {
						youtubeUrl = `https://www.youtube.com/embed/${videoId}`;
					}
				}
				mealDom.videoIframe.src = youtubeUrl;
			} else {
				mealDom.videoIframe.src = "";
			}
		}
		const nutritionData = await analyzeMealNutrition(meal);
		console.log("Nutrition Data:", nutritionData);
		const logMealBtn = document.getElementById("log-meal-btn");
		if (logMealBtn && nutritionData) {
			const perServing = nutritionData.perServing || {};
			logMealBtn.dataset.calories = perServing.calories ?? 0;
			logMealBtn.dataset.protein = perServing.protein ?? 0;
			logMealBtn.dataset.carbs = perServing.carbs ?? 0;
			logMealBtn.dataset.fat = perServing.fat ?? 0;
		}
		renderNutritionFacts(nutritionData, mealDom);
		async function analyzeProductNutrition(product) {
			try {
				let ingredients = [];
				const rawIngredients =
					product.ingredients ||
					product.ingredientsText ||
					product.ingredients_text;
				if (Array.isArray(rawIngredients)) {
					ingredients = rawIngredients;
				} else if (
					typeof rawIngredients === "string" &&
					rawIngredients.trim() !== ""
				) {
					ingredients = rawIngredients
						.split(",")
						.map((item) => item.trim())
						.filter(Boolean);
				}
				if (ingredients.length === 0) {
					ingredients = [product.name || "Product"];
				}
				const response = await fetch(
					"https://nutriplan-api.vercel.app/api/nutrition/analyze",
					{
						method: "POST",
						headers: {
							"Content-Type": "application/json",
							"x-api-key": "9kFTgKAswPWO0HKnEuVnawhuhXhjeNstkPczyOJW",
						},
						body: JSON.stringify({
							recipeName: product.name || "Product",
							ingredients: ingredients,
						}),
					},
				);
				if (!response.ok) {
					throw new Error(`Nutrition API HTTP Error: ${response.status}`);
				}
				const result = await response.json();
				if (!result || result.success === false) {
					return null;
				}
				return result.data || null;
			} catch (error) {
				console.error("Product nutrition analysis error:", error);
				return null;
			}
		}
		if (nutritionData) {
			const servings = nutritionData.servings ?? meal.servings ?? null;
			setElementText(
				mealDom?.servings,
				servings !== null ? `${servings} servings` : "-- servings",
			);
			const perServing = nutritionData.perServing || {};
			setElementText(
				mealDom?.caloriesHero,
				perServing.calories !== undefined
					? `${perServing.calories} cal/serving`
					: "-- cal/serving",
			);
		} else {
			setElementText(
				mealDom?.servings,
				meal.servings !== undefined
					? `${meal.servings} servings`
					: "-- servings",
			);
			setElementText(
				mealDom?.caloriesHero,
				meal.calories !== undefined
					? `${meal.calories} cal/serving`
					: "-- cal/serving",
			);
		}
		const mealDetails = document.getElementById("meal-details");
		if (mealDetails) {
			mealDetails.classList.remove("hidden");
		}
	} catch (error) {
		console.error("Error fetching meal details:", error);
		const mealDom = prepareMealDetailsDom();
		setElementText(mealDom?.title, "Failed to load meal");
		if (mealDom?.instructionsList) {
			mealDom.instructionsList.innerHTML = `
                <div
                    class="text-red-500
                           text-center
                           p-4"
                >
                    حدث خطأ أثناء تحميل بيانات الوجبة.
                </div>
            `;
		}
	}
}
const productSearchBtn = document.getElementById("search-product-btn");
const productSearchInput = document.getElementById("product-search-input");
const lookupBarcodeBtn = document.getElementById("lookup-barcode-btn");
const barcodeInput = document.getElementById("barcode-input");
const productsGrid = document.getElementById("products-grid");
const productsCount = document.getElementById("products-count");
const API_BASE_URL = "https://nutriplan-api.vercel.app/api/products";
const API_HEADERS = {
	"x-api-key": "9kFTgKAswPWO0HKnEuVnawhuhXhjeNstkPczyOJW",
};
function escapeHTML(value) {
	if (value === null || value === undefined) {
		return "";
	}
	return String(value)
		.replace(/&/g, "&amp;")
		.replace(/</g, "&lt;")
		.replace(/>/g, "&gt;")
		.replace(/"/g, "&quot;")
		.replace(/'/g, "&#039;");
}
function normalizeBarcode(barcode) {
	return String(barcode || "")
		.trim()
		.replace(/\D/g, "");
}
async function searchByName(query) {
	const cleanQuery = String(query || "").trim();
	if (!cleanQuery) {
		productsCount.textContent = "من فضلك أدخل اسم المنتج";
		return;
	}
	try {
		productsCount.textContent = "جاري البحث بالاسم...";
		productsGrid.innerHTML = `
            <div
                class="col-span-full
                       flex
                       items-center
                       justify-center
                       py-12
                       text-gray-500"
            >
                <div
                    class="flex
                           items-center
                           gap-3"
                >
                    <i
                        class="fa-solid
                               fa-spinner
                               fa-spin
                               text-emerald-600"
                    ></i>
                    <span>
                        جاري البحث...
                    </span>
                </div>
            </div>
        `;
		const url = `${API_BASE_URL}/search?q=${encodeURIComponent(cleanQuery)}`;
		const response = await fetch(url, {
			method: "GET",
			headers: API_HEADERS,
		});
		if (!response.ok) {
			throw new Error(`HTTP Error: ${response.status}`);
		}
		const data = await response.json();
		console.log("Name search response:", data);
		const items = Array.isArray(data.results)
			? data.results
			: Array.isArray(data)
				? data
				: [];
		setProducts(items);
	} catch (error) {
		console.error("خطأ في البحث بالاسم:", error);
		productsGrid.innerHTML = "";
		productsCount.textContent = "حدث خطأ أثناء البحث بالاسم. حاول مرة أخرى.";
	}
}
async function searchByBarcode(barcode) {
	const cleanBarcode = normalizeBarcode(barcode);
	if (!cleanBarcode) {
		productsCount.textContent = "من فضلك أدخل باركود صحيح";
		return;
	}
	try {
		productsCount.textContent = "جاري البحث بالباركود...";
		productsGrid.innerHTML = `
            <div
                class="col-span-full
                       flex
                       items-center
                       justify-center
                       py-12
                       text-gray-500"
            >
                <div
                    class="flex
                           items-center
                           gap-3"
                >
                    <i
                        class="fa-solid
                               fa-spinner
                               fa-spin
                               text-emerald-600"
                    ></i>
                    <span>
                        جاري البحث عن المنتج...
                    </span>
                </div>
            </div>
        `;
		const url = `${API_BASE_URL}/barcode/${encodeURIComponent(cleanBarcode)}`;
		const response = await fetch(url, {
			method: "GET",
			headers: API_HEADERS,
		});
		console.log("Barcode HTTP status:", response.status);
		if (response.status === 404) {
			productsGrid.innerHTML = `
                <div
                    class="col-span-full
                           text-center
                           py-12"
                >
                    <div
                        class="text-gray-400
                               text-5xl
                               mb-4"
                    >
                        <i
                            class="fa-solid
                                   fa-barcode"
                        ></i>
                    </div>
                    <h3
                        class="text-lg
                               font-bold
                               text-gray-700
                               mb-2"
                    >
                        لم يتم العثور على المنتج
                    </h3>
                    <p
                        class="text-sm
                               text-gray-500"
                    >
                        لا يوجد منتج بالباركود:
                        <span
                            class="font-semibold"
                        >
                            ${escapeHTML(cleanBarcode)}
                        </span>
                    </p>
                </div>
            `;
			productsCount.textContent = `لم يتم العثور على منتج بالباركود ${cleanBarcode}`;
			return;
		}
		if (!response.ok) {
			throw new Error(`HTTP Error: ${response.status}`);
		}
		const data = await response.json();
		console.log("Barcode API response:", data);
		const product = data?.result;
		if (!product) {
			productsGrid.innerHTML = "";
			productsCount.textContent = `لم يتم العثور على منتج بالباركود ${cleanBarcode}`;
			return;
		}
		setProducts([product]);
		productsCount.textContent = "تم العثور على المنتج بالباركود";
	} catch (error) {
		console.error("خطأ في البحث بالباركود:", error);
		productsGrid.innerHTML = `
            <div
                class="col-span-full
                       text-center
                       py-12"
            >
                <div
                    class="text-red-400
                           text-5xl
                           mb-4"
                >
                    <i
                        class="fa-solid
                               fa-circle-exclamation"
                    ></i>
                </div>
                <h3
                    class="text-lg
                           font-bold
                           text-gray-700
                           mb-2"
                >
                    حدث خطأ أثناء البحث
                </h3>
                <p
                    class="text-sm
                           text-gray-500"
                >
                    تأكد من الاتصال بالإنترنت
                    ثم حاول مرة أخرى.
                </p>
            </div>
        `;
		productsCount.textContent = "حدث خطأ أثناء البحث بالباركود.";
	}
}
if (productSearchBtn && productSearchInput) {
	productSearchBtn.addEventListener("click", () => {
		searchByName(productSearchInput.value);
	});
	productSearchInput.addEventListener("keypress", (e) => {
		if (e.key === "Enter") {
			e.preventDefault();
			searchByName(productSearchInput.value);
		}
	});
}
if (lookupBarcodeBtn && barcodeInput) {
	lookupBarcodeBtn.addEventListener("click", () => {
		searchByBarcode(barcodeInput.value);
	});
	barcodeInput.addEventListener("keypress", (e) => {
		if (e.key === "Enter") {
			e.preventDefault();
			searchByBarcode(barcodeInput.value);
		}
	});
}
function renderProducts(items) {
	productsGrid.innerHTML = "";
	if (!Array.isArray(items) || items.length === 0) {
		productsCount.textContent = "لم يتم العثور على نتائج مطابقة";
		productsGrid.innerHTML = `
            <div
                class="col-span-full
                       text-center
                       py-12"
            >
                <div
                    class="text-gray-400
                           text-5xl
                           mb-4"
                >
                    <i
                        class="fa-solid
                               fa-magnifying-glass"
                    ></i>
                </div>
                <h3
                    class="text-lg
                           font-bold
                           text-gray-700
                           mb-2"
                >
                    لا توجد نتائج
                </h3>
                <p
                    class="text-sm
                           text-gray-500"
                >
                    حاول البحث باستخدام اسم أو باركود آخر.
                </p>
            </div>
        `;
		return;
	}
	productsCount.textContent = `تم العثور على ${items.length} منتج`;
	items.forEach((product) => {
		const brand = escapeHTML(product?.brand || "Unknown Brand");
		const name = escapeHTML(product?.name || "Unnamed Product");
		const barcode = escapeHTML(product?.barcode || "");
		const productQuantity = escapeHTML(
			product?.quantity || product?.servingSize || "100g",
		);
		const nutritionGrade = product?.nutritionGrade
			? String(product.nutritionGrade).toUpperCase()
			: "N/A";
		const nutrients = product?.nutrients || {};
		const calories = nutrients?.calories ?? 0;
		const protein =
			nutrients?.protein !== undefined &&
			nutrients?.protein !== null &&
			nutrients?.protein !== ""
				? `${nutrients.protein}g`
				: "0g";
		const carbs =
			nutrients?.carbs !== undefined &&
			nutrients?.carbs !== null &&
			nutrients?.carbs !== ""
				? `${nutrients.carbs}g`
				: "0g";
		const fat =
			nutrients?.fat !== undefined &&
			nutrients?.fat !== null &&
			nutrients?.fat !== ""
				? `${nutrients.fat}g`
				: "0g";
		const sugar =
			nutrients?.sugar !== undefined &&
			nutrients?.sugar !== null &&
			nutrients?.sugar !== ""
				? `${nutrients.sugar}g`
				: "0g";
		const imageUrl =
			product?.image && String(product.image).trim()
				? escapeHTML(product.image)
				: "https://via.placeholder.com/300?text=No+Image";
		const cardHTML = `
                <div
                    class="product-card
                           bg-white
                           rounded-xl
                           overflow-hidden
                           shadow-sm
                           hover:shadow-lg
                           transition-all
                           cursor-pointer
                           group"
                    data-barcode="${barcode}"
                >
                    <div
                        class="relative
                               h-40
                               bg-gray-100
                               flex
                               items-center
                               justify-center
                               overflow-hidden"
                    >
                        <img
                            class="w-full
                                   h-full
                                   object-contain
                                   group-hover:scale-110
                                   transition-transform
                                   duration-300"
                            src="${imageUrl}"
                            alt="${name}"
                            loading="lazy"
                            onerror="
                                this.onerror=null;
                                this.src='https://dummyimage.com/300x300/f3f4f6/6b7280&text=No+Image';
                            "
                        />
                        <div
                            class="absolute
                                   top-2
                                   left-2
                                   bg-emerald-600
                                   text-white
                                   text-xs
                                   font-bold
                                   px-2
                                   py-1
                                   rounded
                                   uppercase"
                        >
                            Nutri-Score:
                            ${escapeHTML(nutritionGrade)}
                        </div>
                    </div>
                    <div class="p-4">
                        <p
                            class="text-xs
                                   text-emerald-600
                                   font-semibold
                                   mb-1
                                   truncate"
                        >
                            ${brand}
                        </p>
                        <h3
                            class="font-bold
                                   text-gray-900
                                   mb-2
                                   line-clamp-2
                                   group-hover:text-emerald-600
                                   transition-colors"
                        >
                            ${name}
                        </h3>
                        <div
                            class="flex
                                   items-center
                                   gap-3
                                   text-xs
                                   text-gray-500
                                   mb-3"
                        >
                           <span>
    <i class="fa-solid fa-weight-scale mr-1"></i>
    ${productQuantity}
</span>
                            <span>
                                <i
                                    class="fa-solid
                                           fa-fire
                                           mr-1"
                                ></i>
                                ${escapeHTML(calories)}
                                kcal/100g
                            </span>
                        </div>
                        <div
                            class="grid
                                   grid-cols-4
                                   gap-1
                                   text-center"
                        >
                            <div
                                class="bg-emerald-50
                                       rounded
                                       p-1.5"
                            >
                                <p
                                    class="text-xs
                                           font-bold
                                           text-emerald-700"
                                >
                                    ${escapeHTML(protein)}
                                </p>
                                <p
                                    class="text-[10px]
                                           text-gray-500"
                                >
                                    Protein
                                </p>
                            </div>
                            <div
                                class="bg-blue-50
                                       rounded
                                       p-1.5"
                            >
                                <p
                                    class="text-xs
                                           font-bold
                                           text-blue-700"
                                >
                                    ${escapeHTML(carbs)}
                                </p>
                                <p
                                    class="text-[10px]
                                           text-gray-500"
                                >
                                    Carbs
                                </p>
                            </div>
                            <div
                                class="bg-purple-50
                                       rounded
                                       p-1.5"
                            >
                                <p
                                    class="text-xs
                                           font-bold
                                           text-purple-700"
                                >
                                    ${escapeHTML(fat)}
                                </p>
                                <p
                                    class="text-[10px]
                                           text-gray-500"
                                >
                                    Fat
                                </p>
                            </div>
                            <div
                                class="bg-orange-50
                                       rounded
                                       p-1.5"
                            >
                                <p
                                    class="text-xs
                                           font-bold
                                           text-orange-700"
                                >
                                    ${escapeHTML(sugar)}
                                </p>
                                <p
                                    class="text-[10px]
                                           text-gray-500"
                                >
                                    Sugar
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            `;
		productsGrid.insertAdjacentHTML("beforeend", cardHTML);
	});
}
const nutriScoreButtons = document.querySelectorAll(".nutri-score-filter");
let allProducts = [];
let currentNutriGrade = "";
nutriScoreButtons.forEach((button) => {
	button.addEventListener("click", () => {
		currentNutriGrade = (button.dataset.grade || "").toLowerCase();
		nutriScoreButtons.forEach((btn) => {
			btn.classList.remove("ring-2", "ring-emerald-500", "scale-105");
		});
		button.classList.add("ring-2", "ring-emerald-500", "scale-105");
		filterProductsByNutriScore();
	});
});
function filterProductsByNutriScore() {
	if (currentNutriGrade === "") {
		renderProducts(allProducts);
		return;
	}
	const filteredProducts = allProducts.filter((product) => {
		const grade = String(product?.nutritionGrade || "")
			.trim()
			.toLowerCase();
		return grade === currentNutriGrade;
	});
	renderProducts(filteredProducts);
}
const productCategoryButtons = document.querySelectorAll(
	".product-category-btn",
);
async function loadProductsByCategory(category) {
	if (!category) return;
	try {
		productsCount.textContent = "جاري تحميل المنتجات...";
		productsGrid.innerHTML = `
            <div
                class="col-span-full
                       flex
                       items-center
                       justify-center
                       py-12
                       text-gray-500"
            >
                <div
                    class="flex
                           items-center
                           gap-3"
                >
                    <i
                        class="fa-solid
                               fa-spinner
                               fa-spin
                               text-emerald-600"
                    ></i>
                    <span>
                        جاري تحميل المنتجات...
                    </span>
                </div>
            </div>
        `;
		const url = `https://nutriplan-api.vercel.app/api/products/category/${encodeURIComponent(
			category,
		)}`;
		console.log("Category URL:", url);
		const response = await fetch(url, {
			method: "GET",
			headers: API_HEADERS,
		});
		if (!response.ok) {
			throw new Error(`HTTP Error: ${response.status}`);
		}
		const data = await response.json();
		console.log("Category API Response:", data);
		const items = Array.isArray(data?.results)
			? data.results
			: Array.isArray(data)
				? data
				: [];
		setProducts(items);
	} catch (error) {
		console.error("خطأ في فلترة المنتجات:", error);
		productsGrid.innerHTML = `
            <div
                class="col-span-full
                       text-center
                       py-12"
            >
                <div
                    class="text-red-400
                           text-5xl
                           mb-4"
                >
                    <i
                        class="fa-solid
                               fa-circle-exclamation"
                    ></i>
                </div>
                <h3
                    class="text-lg
                           font-bold
                           text-gray-700
                           mb-2"
                >
                    حدث خطأ أثناء تحميل المنتجات
                </h3>
                <p
                    class="text-sm
                           text-gray-500"
                >
                    حاول مرة أخرى.
                </p>
            </div>
        `;
		productsCount.textContent = "حدث خطأ أثناء تحميل المنتجات.";
	}
}
productCategoryButtons.forEach((button) => {
	button.addEventListener("click", () => {
		const category = button.dataset.category;
		productCategoryButtons.forEach((btn) => {
			btn.classList.remove("ring-2", "ring-white", "scale-105");
		});
		button.classList.add("ring-2", "ring-white", "scale-105");
		loadProductsByCategory(category);
	});
});
function setProducts(items) {
	allProducts = Array.isArray(items) ? items : [];
	currentNutriGrade = "";
	nutriScoreButtons.forEach((btn) => {
		btn.classList.remove("ring-2", "ring-emerald-500", "scale-105");
	});
	const allButton = document.querySelector(
		'.nutri-score-filter[data-grade=""]',
	);
	if (allButton) {
		allButton.classList.add("ring-2", "ring-emerald-500", "scale-105");
	}
	renderProducts(allProducts);
}
const productModal = document.getElementById("product-details-modal");
const productModalOverlay = document.getElementById("product-modal-overlay");
const closeProductModal = document.getElementById("close-product-modal");
const modalCloseBtn = document.getElementById("modal-close-btn");
if (productModal && productModal.parentElement !== document.body) {
	document.body.appendChild(productModal);
}
function getNutriScoreInfo(grade) {
	const score = String(grade || "")
		.trim()
		.toLowerCase();
	const map = {
		a: {
			label: "Excellent",
			bg: "bg-green-50",
			color: "bg-green-500",
		},
		b: {
			label: "Good",
			bg: "bg-lime-50",
			color: "bg-lime-500",
		},
		c: {
			label: "Moderate",
			bg: "bg-yellow-50",
			color: "bg-yellow-500",
		},
		d: {
			label: "Bad",
			bg: "bg-orange-50",
			color: "bg-orange-500",
		},
		e: {
			label: "Bad",
			bg: "bg-red-50",
			color: "bg-red-500",
		},
	};
	return (
		map[score] || {
			label: "Unknown",
			bg: "bg-gray-50",
			color: "bg-gray-500",
		}
	);
}
function getNovaLabel(value) {
	const nova = Number(value);
	const labels = {
		1: "Unprocessed",
		2: "Processed ingredients",
		3: "Processed",
		4: "Ultra-processed",
	};
	return labels[nova] || "Unknown";
}
function setModalValue(id, value, unit = "") {
	const element = document.getElementById(id);
	if (!element) {
		return;
	}
	if (value === undefined || value === null || value === "") {
		element.textContent = "--";
		return;
	}
	element.textContent = `${value}${unit}`;
}
function openProductDetails(product) {
	if (!productModal || !product) {
		return;
	}
	const image = document.getElementById("modal-product-image");
	if (image) {
		image.src =
			product.image ||
			"https://dummyimage.com/400x400/f3f4f6/6b7280&text=No+Image";
		image.alt = product.name || "Product";
	}
	setModalValue(
		"modal-product-brand",
		product.brand || "Unknown Brand",
	);
	setModalValue(
		"modal-product-name",
		product.name || "Unnamed Product",
	);
	const quantity = product.quantity || product.servingSize || "Per 100g";
	setModalValue("modal-product-quantity", quantity);
	const score = String(product.nutritionGrade || "unknown").toUpperCase();
	const scoreInfo = getNutriScoreInfo(score);
	const nutriBadge = document.getElementById("modal-nutri-badge");
	const nutriLetter = document.getElementById("modal-nutri-letter");
	const nutriLabel = document.getElementById("modal-nutri-label");
	if (nutriBadge) {
		nutriBadge.className = `
                flex
                items-center
                gap-3
                px-4
                py-3
                rounded-xl
                ${scoreInfo.bg}
            `;
	}
	if (nutriLetter) {
		nutriLetter.className = `
                w-10
                h-10
                rounded-lg
                text-white
                font-bold
                text-lg
                flex
                items-center
                justify-center
                ${scoreInfo.color}
            `;
		nutriLetter.textContent = score === "UNKNOWN" ? "?" : score;
	}
	if (nutriLabel) {
		nutriLabel.textContent = scoreInfo.label;
	}
	const novaValue = product.novaGroup ?? product.nova ?? null;
	const novaNumber = document.getElementById("modal-nova-number");
	const novaLabel = document.getElementById("modal-nova-label");
	if (novaValue !== null) {
		if (novaNumber) {
			novaNumber.textContent = novaValue;
		}
		if (novaLabel) {
			novaLabel.textContent = getNovaLabel(novaValue);
		}
	} else {
		if (novaNumber) {
			novaNumber.textContent = "?";
		}
		if (novaLabel) {
			novaLabel.textContent = "Unknown";
		}
	}
	const nutrients = product.nutrients || {};
	const calories = nutrients.calories ?? 0;
	const protein = nutrients.protein ?? 0;
	const carbs = nutrients.carbs ?? 0;
	const fat = nutrients.fat ?? 0;
	const sugar = nutrients.sugar ?? 0;
	const fiber = nutrients.fiber ?? 0;
	const saturatedFat = nutrients.saturatedFat ?? nutrients.saturated_fat ?? 0;
	const sodium = nutrients.sodium ?? 0;
	const salt = nutrients.salt ?? 0;
	const cholesterol = nutrients.cholesterol ?? 0;
	setModalValue("modal-calories", calories);
	setModalValue("modal-protein", protein, "g");
	setModalValue("modal-carbs", carbs, "g");
	setModalValue("modal-fat", fat, "g");
	setModalValue("modal-sugar", sugar, "g");
	setModalValue("modal-saturated-fat", saturatedFat, "g");
	setModalValue("modal-fiber", fiber, "g");
	setModalValue("modal-salt", salt, "g");
	setModalValue("modal-sodium", sodium, "mg");
	setModalValue("modal-cholesterol", cholesterol, "mg");
	setProgressBar("modal-protein-bar", protein, 50);
	setProgressBar("modal-carbs-bar", carbs, 100);
	setProgressBar("modal-fat-bar", fat, 50);
	setProgressBar("modal-sugar-bar", sugar, 50);
	const ingredientsElement = document.getElementById("modal-ingredients");
	if (ingredientsElement) {
		const ingredients =
			product.ingredients ||
			product.ingredientsText ||
			product.ingredients_text ||
			"";
		if (Array.isArray(ingredients)) {
			ingredientsElement.innerHTML = ingredients
				.map(
					(item) => `
                            <span
                                class="inline-block
                                       mr-2
                                       mb-1"
                            >
                                ${escapeHTML(item)}
                            </span>
                        `,
				)
				.join("");
		} else {
			ingredientsElement.textContent =
				ingredients || "No ingredients available.";
		}
	}
	productModal.dataset.barcode = product.barcode || "";
	productModal.classList.remove("hidden");
	document.body.classList.add("overflow-hidden");
	setupModalLogButton(product, {
		perServing: product.nutrients,
	});
}
function setupModalLogButton(currentProduct, nutritionData) {
	let logButton = document.getElementById("log-food-btn");
	if (logButton) {
		const newBtn = logButton.cloneNode(true);
		logButton.parentNode.replaceChild(newBtn, logButton);
		newBtn.addEventListener("click", () => {
			const perServing = nutritionData?.perServing || {};
			const itemToLog = {
				name: currentProduct.name,
				brand: currentProduct.brand,
				quantity:
					currentProduct.quantity || currentProduct.servingSize || "100g",
				calories:
					perServing.calories ?? currentProduct.nutrients?.calories ?? 0,
				protein: perServing.protein ?? currentProduct.nutrients?.protein ?? 0,
				carbs: perServing.carbs ?? currentProduct.nutrients?.carbs ?? 0,
				fat: perServing.fat ?? currentProduct.nutrients?.fat ?? 0,
				type: "product",
			};
			logFoodItem(itemToLog);
			if (typeof productModal !== "undefined" && productModal) {
				productModal.classList.add("hidden");
				document.body.classList.remove("overflow-hidden");
			}
		});
	}
}
function setProgressBar(id, value, max) {
	const bar = document.getElementById(id);
	if (!bar) return;
	const numeric = Number(value) || 0;
	const percentage = Math.min((numeric / max) * 100, 100);
	bar.style.width = `${percentage}%`;
}
function closeProductDetails() {
	if (!productModal) {
		return;
	}
	productModal.classList.add("hidden");
	document.body.classList.remove("overflow-hidden");
}
if (closeProductModal) {
	closeProductModal.addEventListener("click", closeProductDetails);
}
if (modalCloseBtn) {
	modalCloseBtn.addEventListener("click", closeProductDetails);
}
if (productModalOverlay) {
	productModalOverlay.addEventListener("click", closeProductDetails);
}
document.addEventListener("keydown", (event) => {
	if (
		event.key === "Escape" &&
		productModal &&
		!productModal.classList.contains("hidden")
	) {
		closeProductDetails();
	}
});
if (productsGrid) {
	productsGrid.addEventListener("click", (event) => {
		const card = event.target.closest(".product-card");
		if (!card) {
			return;
		}
		const barcode = card.dataset.barcode;
		if (!barcode) {
			return;
		}
		const product = allProducts.find(
			(item) => String(item?.barcode || "") === String(barcode),
		);
		if (!product) {
			console.warn("Product not found:", barcode);
			return;
		}
		openProductDetails(product);
	});
}
const FOOD_LOG_STORAGE_KEY = "nutriplan_daily_food_log";
function getLoggedFoodItems() {
	try {
		const data = localStorage.getItem(FOOD_LOG_STORAGE_KEY);
		return data ? JSON.parse(data) : [];
	} catch (e) {
		console.error("Error reading food log from storage:", e);
		return [];
	}
}
function saveLoggedFoodItems(items) {
	try {
		localStorage.setItem(FOOD_LOG_STORAGE_KEY, JSON.stringify(items));
	} catch (e) {
		console.error("Error saving food log to storage:", e);
	}
}
function initFoodLogDate() {
	const dateElement = document.getElementById("foodlog-date");
	if (dateElement) {
		const options = { weekday: "long", month: "short", day: "numeric" };
		const todayStr = new Date().toLocaleDateString("en-US", options);
		dateElement.textContent = todayStr;
	}
}
function logFoodItem(item) {
	const items = getLoggedFoodItems();
	const sanitizedItem = {
		id: "log_" + Date.now() + Math.random().toString(36).substr(2, 5),
		name: item.name || "Unnamed Food",
		brand: item.brand || "",
		calories: Number(item.calories || item.nutrients?.calories || 0),
		protein: Number(item.protein || item.nutrients?.protein || 0),
		carbs: Number(item.carbs || item.nutrients?.carbs || 0),
		fat: Number(item.fat || item.nutrients?.fat || 0),
		quantity: item.quantity || item.servingSize || "1 serving",
		type: item.type || "meal", 
	};
	items.push(sanitizedItem);
	saveLoggedFoodItems(items);
	updateFoodLogUI();
	Swal.fire({
		icon: "success",
		title: "تمت الإضافة بنجاح!",
		text: "تمت إضافة الوجبة إلى سجلك اليومي.",
		timer: 2000, 
		showConfirmButton: false, 
		timerProgressBar: true,
	});
}
function removeFoodLogItem(id) {
	let items = getLoggedFoodItems();
	items = items.filter((item) => item.id !== id);
	saveLoggedFoodItems(items);
	updateFoodLogUI();
}
function updateFoodLogUI() {
	const items = getLoggedFoodItems();
	const goals = {
		calories: 2000,
		protein: 50,
		carbs: 250,
		fat: 65,
	};
	let totals = {
		calories: 0,
		protein: 0,
		carbs: 0,
		fat: 0,
	};
	items.forEach((item) => {
		totals.calories += item.calories;
		totals.protein += item.protein;
		totals.carbs += item.carbs;
		totals.fat += item.fat;
	});
	updateProgressCard("Calories", totals.calories, goals.calories, "kcal", 0);
	updateProgressCard("Protein", totals.protein, goals.protein, "g", 1);
	updateProgressCard("Carbs", totals.carbs, goals.carbs, "g", 2);
	updateProgressCard("Fat", totals.fat, goals.fat, "g", 3);
	const loggedItemsSection = document.getElementById("foodlog-today-section");
	if (loggedItemsSection) {
		const headerCount = loggedItemsSection.querySelector("h4");
		if (headerCount) {
			headerCount.textContent = `Logged Items (${items.length})`;
		}
		const clearBtn = document.getElementById("clear-foodlog");
		if (clearBtn) {
			clearBtn.style.display = items.length > 0 ? "inline-flex" : "none";
		}
	}
	const listContainer = document.getElementById("logged-items-list");
	if (listContainer) {
		if (items.length === 0) {
			listContainer.innerHTML = `
                <div class="text-center py-8 text-gray-500">
                    <i class="fa-solid fa-utensils text-4xl mb-3 text-gray-300"></i>
                    <p class="font-medium">No meals logged today</p>
                    <p class="text-sm">Add meals from the Meals page or scan products</p>
                </div>
            `;
		} else {
			listContainer.innerHTML = items
				.map(
					(item) => `
                <div class="flex items-center justify-between bg-gray-50 p-3 rounded-xl border border-gray-100 hover:bg-gray-100 transition-all">
                    <div class="flex items-center gap-3">
                        <div class="w-10 h-10 rounded-lg bg-emerald-100 text-emerald-600 flex items-center justify-center font-bold">
                            <i class="fa-solid ${item.type === "product" ? "fa-barcode" : "fa-utensil-spoon"}"></i>
                        </div>
                        <div>
                            <h5 class="font-semibold text-gray-900 text-sm">${escapeHTML(item.name)}</h5>
                            <p class="text-xs text-gray-500">
                                ${item.brand ? escapeHTML(item.brand) + " • " : ""} 
                                ${escapeHTML(item.quantity)} • 
                                <span class="text-emerald-600 font-medium">${Math.round(item.calories)} kcal</span>
                            </p>
                        </div>
                    </div>
                    <div class="flex items-center gap-4">
                        <div class="text-right text-xs text-gray-500 hidden sm:block">
                            <span>P: ${Math.round(item.protein)}g</span> | 
                            <span>C: ${Math.round(item.carbs)}g</span> | 
                            <span>F: ${Math.round(item.fat)}g</span>
                        </div>
                        <button onclick="removeFoodLogItem('${item.id}')" class="text-gray-400 hover:text-red-500 p-2 transition-colors" title="Remove item">
                            <i class="fa-solid fa-trash-can"></i>
                        </button>
                    </div>
                </div>
            `,
				)
				.join("");
		}
	}
}
function updateProgressCard(labelName, current, max, unit, gridIndex) {
	const foodLogSection = document.getElementById("foodlog-today-section");
	if (!foodLogSection) return;
	const progressCards = foodLogSection.querySelectorAll(".grid > div");
	if (progressCards[gridIndex]) {
		const card = progressCards[gridIndex];
		const spanText = card.querySelector(".text-sm.text-gray-500");
		const progressBar = card.querySelector('[class~="h-2.5"]');
		if (spanText) {
			spanText.textContent = `${Math.round(current)} / ${max} ${unit}`;
		}
		if (progressBar) {
			let percentage = (current / max) * 100;
			if (percentage > 100) percentage = 100;
			progressBar.style.width = `${percentage}%`;
		}
	}
}
document.addEventListener("DOMContentLoaded", () => {
	const foodLogDate = document.getElementById("foodlog-date");
	const loggedItemsList = document.getElementById("logged-items-list");
	const clearFoodLogBtn = document.getElementById("clear-foodlog");
	const foodLogSection = document.getElementById("foodlog-section");
	const caloriesProgress = document.getElementById("calories-progress");
	const proteinProgress = document.getElementById("protein-progress");
	const carbsProgress = document.getElementById("carbs-progress");
	const fatProgress = document.getElementById("fat-progress");
	const caloriesText = document.getElementById("calories-text");
	const proteinText = document.getElementById("protein-text");
	const carbsText = document.getElementById("carbs-text");
	const fatText = document.getElementById("fat-text");
	const loggedItemsCount = document.getElementById("logged-items-count");
	const FOOD_LOG_TARGETS = {
		calories: 2000,
		protein: 50,
		carbs: 250,
		fat: 65,
	};
	function getTodayKey() {
		const today = new Date();
		const year = today.getFullYear();
		const month = String(today.getMonth() + 1).padStart(2, "0");
		const day = String(today.getDate()).padStart(2, "0");
		return `${year}-${month}-${day}`;
	}
	function getFoodLogStorageKey() {
		return `foodLog_${getTodayKey()}`;
	}
	function updateFoodLogDate() {
		if (!foodLogDate) {
			return;
		}
		const today = new Date();
		foodLogDate.textContent = today.toLocaleDateString("en-US", {
			weekday: "long",
			month: "short",
			day: "numeric",
		});
	}
	function getFoodLog() {
		const key = getFoodLogStorageKey();
		const saved = localStorage.getItem(key);
		if (!saved) {
			return [];
		}
		try {
			const data = JSON.parse(saved);
			return Array.isArray(data) ? data : [];
		} catch (error) {
			console.error("Food Log JSON Error:", error);
			return [];
		}
	}
	function saveFoodLog(foodLog) {
		const key = getFoodLogStorageKey();
		localStorage.setItem(key, JSON.stringify(foodLog));
	}
	function numberValue(value) {
		if (value === null || value === undefined || value === "") {
			return 0;
		}
		const number = parseFloat(String(value).replace(/[^\d.-]/g, ""));
		return Number.isFinite(number) ? number : 0;
	}
	function escapeFoodLogHTML(value) {
		const div = document.createElement("div");
		div.textContent = String(value ?? "");
		return div.innerHTML;
	}
	function calculateFoodLogTotals(foodLog) {
		return foodLog.reduce(
			(totals, item) => {
				totals.calories += numberValue(item.calories);
				totals.protein += numberValue(item.protein);
				totals.carbs += numberValue(item.carbs);
				totals.fat += numberValue(item.fat);
				return totals;
			},
			{
				calories: 0,
				protein: 0,
				carbs: 0,
				fat: 0,
			},
		);
	}
	function getProgressPercentage(value, target) {
		if (!target) {
			return 0;
		}
		return Math.min(Math.max((value / target) * 100, 0), 100);
	}
	function updateFoodLogProgress(foodLog) {
		const totals = calculateFoodLogTotals(foodLog);
		if (caloriesText) {
			caloriesText.textContent = `${Math.round(
				totals.calories,
			)} / ${FOOD_LOG_TARGETS.calories} kcal`;
		}
		if (caloriesProgress) {
			caloriesProgress.style.width = `${getProgressPercentage(
				totals.calories,
				FOOD_LOG_TARGETS.calories,
			)}%`;
		}
		if (proteinText) {
			proteinText.textContent = `${totals.protein.toFixed(1)} / ${FOOD_LOG_TARGETS.protein} g`;
		}
		if (proteinProgress) {
			proteinProgress.style.width = `${getProgressPercentage(
				totals.protein,
				FOOD_LOG_TARGETS.protein,
			)}%`;
		}
		if (carbsText) {
			carbsText.textContent = `${totals.carbs.toFixed(1)} / ${FOOD_LOG_TARGETS.carbs} g`;
		}
		if (carbsProgress) {
			carbsProgress.style.width = `${getProgressPercentage(
				totals.carbs,
				FOOD_LOG_TARGETS.carbs,
			)}%`;
		}
		if (fatText) {
			fatText.textContent = `${totals.fat.toFixed(1)} / ${FOOD_LOG_TARGETS.fat} g`;
		}
		if (fatProgress) {
			fatProgress.style.width = `${getProgressPercentage(
				totals.fat,
				FOOD_LOG_TARGETS.fat,
			)}%`;
		}
	}
	function renderFoodLog() {
		if (!loggedItemsList) {
			return;
		}
		const foodLog = getFoodLog();
		if (loggedItemsCount) {
			loggedItemsCount.textContent = `Logged Items (${foodLog.length})`;
		}
		if (foodLog.length === 0) {
			loggedItemsList.innerHTML = `
                <div
                    class="text-center py-8 text-gray-500"
                >
                    <i
                        class="fa-solid
                               fa-utensils
                               text-4xl
                               mb-3
                               text-gray-300"
                    ></i>
                    <p class="font-medium">
                        No meals logged today
                    </p>
                    <p class="text-sm">
                        Add meals from the Meals page
                        or scan products
                    </p>
                </div>
            `;
			if (clearFoodLogBtn) {
				clearFoodLogBtn.style.display = "none";
			}
			updateFoodLogProgress(foodLog);
			return;
		}
		if (clearFoodLogBtn) {
			clearFoodLogBtn.style.display = "inline-block";
		}
		loggedItemsList.innerHTML = foodLog
			.map((item) => {
				const isProduct = item.type === "product";
				const icon = isProduct ? "fa-barcode" : "fa-utensils";
				const typeName = isProduct ? "Product" : "Meal";
				return `
                        <div
                            class="
                                food-log-item
                                flex
                                items-center
                                justify-between
                                bg-gray-50
                                border
                                border-gray-200
                                rounded-xl
                                p-4
                            "
                        >
                            <div
                                class="
                                    flex
                                    items-center
                                    gap-3
                                "
                            >
                                <div
                                    class="
                                        w-10
                                        h-10
                                        rounded-lg
                                        bg-indigo-100
                                        flex
                                        items-center
                                        justify-center
                                    "
                                >
                                    <i
                                        class="
                                            fa-solid
                                            ${icon}
                                            text-indigo-600
                                        "
                                    ></i>
                                </div>
                                <div>
                                    <p
                                        class="
                                            font-semibold
                                            text-gray-900
                                        "
                                    >
                                        ${escapeFoodLogHTML(item.name)}
                                    </p>
                                    <p
                                        class="
                                            text-xs
                                            text-gray-500
                                        "
                                    >
                                        ${typeName}
                                    </p>
                                </div>
                            </div>
                            <div
                                class="
                                    flex
                                    items-center
                                    gap-4
                                "
                            >
                                <div
                                    class="text-right"
                                >
                                    <p
                                        class="
                                            font-semibold
                                            text-gray-900
                                        "
                                    >
                                        ${numberValue(item.calories)} kcal
                                    </p>
                                    <p
                                        class="
                                            text-xs
                                            text-gray-500
                                        "
                                    >
                                        P:
                                        ${numberValue(item.protein).toFixed(1)}g
                                        · C:
                                        ${numberValue(item.carbs).toFixed(1)}g
                                        · F:
                                        ${numberValue(item.fat).toFixed(1)}g
                                    </p>
                                </div>
                               <button
    type="button"
    class="
        remove-foodlog-item
        text-gray-400
        hover:text-red-500
        p-2
        transition-colors
    "
    data-log-id="${item.logId}"
    title="Remove item"
>
    <i class="fa-solid fa-trash"></i>
</button>
                            </div>
                        </div>
                    `;
			})
			.join("");
		updateFoodLogProgress(foodLog);
	}
	function addFoodLogItem({
		id = "",
		name = "Unknown Food",
		calories = 0,
		protein = 0,
		carbs = 0,
		fat = 0,
		type = "meal",
	}) {
		const foodLog = getFoodLog();
		const newItem = {
			logId: `${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
			id: String(id),
			name: String(name),
			calories: numberValue(calories),
			protein: numberValue(protein),
			carbs: numberValue(carbs),
			fat: numberValue(fat),
			type: type,
			addedAt: new Date().toISOString(),
		};
		foodLog.push(newItem);
		saveFoodLog(foodLog);
		renderFoodLog();
		updateWeeklyFoodLog();
		showFoodLogToast(`${newItem.name} added to today's log`);
		return newItem;
	}
	async function removeFoodLogItem(logId) {
		const foodLog = getFoodLog();
		const item = foodLog.find((item) => String(item.logId) === String(logId));
		if (!item) {
			return;
		}
		const result = await Swal.fire({
			title: "Remove item?",
			text: `Are you sure you want to remove "${item.name}" from today's food log?`,
			icon: "warning",
			showCancelButton: true,
			confirmButtonText: "Yes, remove it",
			cancelButtonText: "Cancel",
			reverseButtons: true,
			focusCancel: true,
		});
		if (!result.isConfirmed) {
			return;
		}
		const updatedLog = foodLog.filter(
			(item) => String(item.logId) !== String(logId),
		);
		saveFoodLog(updatedLog);
		renderFoodLog();
		if (typeof updateWeeklyFoodLog === "function") {
			updateWeeklyFoodLog();
		}
		await Swal.fire({
			title: "Removed!",
			text: `"${item.name}" has been removed from today's food log.`,
			icon: "success",
			confirmButtonText: "OK",
			timer: 1500,
			timerProgressBar: true,
		});
	}
	if (clearFoodLogBtn) {
		clearFoodLogBtn.addEventListener("click", async () => {
			const foodLog = getFoodLog();
			if (foodLog.length === 0) {
				await Swal.fire({
					title: "Food Log is empty",
					text: "There are no meals or products to remove.",
					icon: "info",
					confirmButtonText: "OK",
				});
				return;
			}
			const result = await Swal.fire({
				title: "Clear all food log?",
				text: `You are about to remove ${foodLog.length} ${
					foodLog.length === 1 ? "item" : "items"
				} from today's food log.`,
				icon: "warning",
				showCancelButton: true,
				confirmButtonText: "Yes, clear all",
				cancelButtonText: "Cancel",
				confirmButtonColor: "#d33",
				cancelButtonColor: "#6b7280",
				reverseButtons: true,
				focusCancel: true,
			});
			if (!result.isConfirmed) {
				return;
			}
			localStorage.removeItem(getFoodLogStorageKey());
			renderFoodLog();
			if (typeof updateWeeklyFoodLog === "function") {
				updateWeeklyFoodLog();
			}
			await Swal.fire({
				title: "Cleared!",
				text: "All meals and products have been removed from today's food log.",
				icon: "success",
				confirmButtonText: "OK",
				timer: 1500,
				timerProgressBar: true,
			});
		});
	}
	if (loggedItemsList) {
		loggedItemsList.addEventListener("click", (event) => {
			const button = event.target.closest(".remove-foodlog-item");
			if (!button) {
				return;
			}
			const logId = button.dataset.logId;
			removeFoodLogItem(logId);
		});
	}
	function showFoodLogToast(message) {
		const oldToast = document.getElementById("food-log-toast");
		if (oldToast) {
			oldToast.remove();
		}
		const toast = document.createElement("div");
		toast.id = "food-log-toast";
		toast.className = `
            fixed
            bottom-6
            right-6
            z-[9999]
            bg-gray-900
            text-white
            px-5
            py-3
            rounded-xl
            shadow-xl
            flex
            items-center
            gap-3
        `;
		toast.innerHTML = `
            <i
                class="
                    fa-solid
                    fa-circle-check
                    text-emerald-400
                "
            ></i>
            <span>
                ${escapeFoodLogHTML(message)}
            </span>
        `;
		document.body.appendChild(toast);
		setTimeout(() => {
			toast.remove();
		}, 2500);
	}
	document.addEventListener("click", async (event) => {
		const button = event.target.closest("#log-meal-btn");
		if (!button) {
			return;
		}
		const mealId = button.dataset.mealId;
		if (!mealId) {
			console.error("Meal ID not found");
			return;
		}
		let mealData = null;
		const mealNameElement = document.getElementById("meal-title");
		const mealName = mealNameElement?.textContent?.trim() || "Unnamed Recipe";
		const caloriesElement =
			document.getElementById("meal-calories") ||
			document.getElementById("modal-meal-calories");
		const proteinElement =
			document.getElementById("meal-protein") ||
			document.getElementById("modal-meal-protein");
		const carbsElement =
			document.getElementById("meal-carbs") ||
			document.getElementById("modal-meal-carbs");
		const fatElement =
			document.getElementById("meal-fat") ||
			document.getElementById("modal-meal-fat");
		const calories = numberValue(caloriesElement?.textContent);
		const protein = numberValue(proteinElement?.textContent);
		const carbs = numberValue(carbsElement?.textContent);
		const fat = numberValue(fatElement?.textContent);
		mealData = {
			id: mealId,
			name: mealName,
			calories: calories,
			protein: protein,
			carbs: carbs,
			fat: fat,
		};
		if (button.dataset.calories) {
			mealData.calories = numberValue(button.dataset.calories);
		}
		if (button.dataset.protein) {
			mealData.protein = numberValue(button.dataset.protein);
		}
		if (button.dataset.carbs) {
			mealData.carbs = numberValue(button.dataset.carbs);
		}
		if (button.dataset.fat) {
			mealData.fat = numberValue(button.dataset.fat);
		}
		addFoodLogItem({
			id: mealData.id,
			name: mealData.name,
			calories: mealData.calories,
			protein: mealData.protein,
			carbs: mealData.carbs,
			fat: mealData.fat,
			type: "meal",
		});
		Swal.fire({
			icon: "success",
			title: "تمت الإضافة بنجاح!",
			text: "تمت إضافة الوجبة إلى سجلك اليومي.",
			timer: 2000,
			showConfirmButton: false,
			timerProgressBar: true,
		});
	});
	document.addEventListener("click", (event) => {
		const button = event.target.closest("#log-food-btn");
		if (!button) {
			return;
		}
		const nameElement = document.getElementById("modal-product-name");
		const caloriesElement = document.getElementById("modal-calories");
		const proteinElement = document.getElementById("modal-protein");
		const carbsElement = document.getElementById("modal-carbs");
		const fatElement = document.getElementById("modal-fat");
		const productName = nameElement?.textContent?.trim() || "Product";
		const calories = numberValue(caloriesElement?.textContent);
		const protein = numberValue(proteinElement?.textContent);
		const carbs = numberValue(carbsElement?.textContent);
		const fat = numberValue(fatElement?.textContent);
		const productModal = document.getElementById("product-modal");
		const productId = productModal?.dataset?.barcode || "";
		addFoodLogItem({
			id: productId,
			name: productName,
			calories: calories,
			protein: protein,
			carbs: carbs,
			fat: fat,
			type: "product",
		});
	});
	updateFoodLogDate();
	renderFoodLog();
	setInterval(() => {
		updateFoodLogDate();
	}, 60000);
});
const logmeal = document.getElementById("log-meal");
const logproduct = document.getElementById("log-product");
const sections1 = document.querySelectorAll("section");
const herosection = document.getElementById("hero-section");
const productssection = document.getElementById("products-section");
const searchfilterssection = document.getElementById("search-filters-section");
const mealcategoriessection = document.getElementById(
	"meal-categories-section",
);
const allrecipessection = document.getElementById("all-recipes-section");
const mealdetails = document.getElementById("meal-details");
const btnp = document.getElementById("li-1");
const btnp2 = document.getElementById("li-2");
const btnp3 = document.getElementById("li-3");
logmeal.addEventListener("click", function () {
	sections1.forEach((section) => {
		section.classList.add("hidden");
	});
	herosection.classList.remove("hidden");
	searchfilterssection.classList.remove("hidden");
	mealcategoriessection.classList.remove("hidden");
	allrecipessection.classList.remove("hidden");
	btnp3.classList.remove("bg-emerald-50", "text-emerald-700");
	btnp2.classList.remove("bg-emerald-50", "text-emerald-700");
	btnp.classList.add("bg-emerald-50", "text-emerald-700");
	btnp2.classList.add("text-gray-600");
	btnp3.classList.add("text-gray-600");
});
logproduct.addEventListener("click", function () {
	sections1.forEach((section) => {
		section.classList.add("hidden");
	});
	productssection.classList.remove("hidden");
	btnp3.classList.remove("bg-emerald-50", "text-emerald-700");
	btnp.classList.remove("bg-emerald-50", "text-emerald-700");
	btnp2.classList.add("bg-emerald-50", "text-emerald-700");
	btnp.classList.add("text-gray-600");
	btnp3.classList.add("text-gray-600");
});
function getFoodLogForDate(date) {
	const year = date.getFullYear();
	const month = String(date.getMonth() + 1).padStart(2, "0");
	const day = String(date.getDate()).padStart(2, "0");
	const key = `foodLog_${year}-${month}-${day}`;
	const saved = localStorage.getItem(key);
	if (!saved) {
		return [];
	}
	try {
		const data = JSON.parse(saved);
		return Array.isArray(data) ? data : [];
	} catch (error) {
		console.error("Weekly Food Log Error:", error);
		return [];
	}
}
function getLast7Days() {
	const days = [];
	const today = new Date();
	today.setHours(0, 0, 0, 0);
	for (let i = 6; i >= 0; i--) {
		const date = new Date(today);
		date.setDate(today.getDate() - i);
		days.push(date);
	}
	return days;
}
function updateWeeklyFoodLog() {
	const container = document.getElementById("weekly-overview");
	if (!container) {
		return;
	}
	const days = getLast7Days();
	let totalCalories = 0;
	let totalItems = 0;
	let daysOnGoal = 0;
	container.innerHTML = "";
	days.forEach((date) => {
		const foodLog = getFoodLogForDate(date);
		const calories = foodLog.reduce((total, item) => {
			return total + (parseFloat(item.calories) || 0);
		}, 0);
		const items = foodLog.length;
		totalCalories += calories;
		totalItems += items;
		if (calories >= 1800 && calories <= 2200) {
			daysOnGoal++;
		}
		const isToday = date.toDateString() === new Date().toDateString();
		const dayName = date.toLocaleDateString("en-US", {
			weekday: "short",
		});
		const dayNumber = date.getDate();
		const wrapper = document.createElement("div");
		wrapper.className = isToday
			? "text-center bg-indigo-100 rounded-xl p-2"
			: "text-center p-2";
		const caloriesClass = calories > 0 ? "text-emerald-600" : "text-gray-300";
		wrapper.innerHTML = `
            <p
                class="text-xs text-gray-500 mb-1"
            >
                ${dayName}
            </p>
            <p
                class="text-sm font-medium text-gray-900"
            >
                ${dayNumber}
            </p>
            <div
                class="mt-2 ${caloriesClass}"
            >
                <p
                    class="text-lg font-bold"
                >
                    ${Math.round(calories)}
                </p>
                <p
                    class="text-xs"
                >
                    kcal
                </p>
            </div>
            ${
							items > 0
								? `
                        <p
                            class="text-xs text-gray-400 mt-1"
                        >
                            ${items} ${items === 1 ? "item" : "items"}
                        </p>
                    `
								: ""
						}
        `;
		container.appendChild(wrapper);
	});
	const weeklyAverage = days.length > 0 ? totalCalories / days.length : 0;
	const averageElement = document.getElementById("weekly-average");
	if (averageElement) {
		averageElement.textContent = `${Math.round(weeklyAverage)} kcal`;
	}
	const itemsElement = document.getElementById("weekly-items");
	if (itemsElement) {
		itemsElement.textContent = `${totalItems} ${
			totalItems === 1 ? "item" : "items"
		}`;
	}
	const goalElement = document.getElementById("days-on-goal");
	if (goalElement) {
		goalElement.textContent = `${daysOnGoal} / 7`;
	}
}
document.addEventListener("DOMContentLoaded", () => {
	updateWeeklyFoodLog();
});