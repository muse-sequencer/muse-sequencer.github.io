/**
	* @typedef {Object} IndexedFile
	* @property {string} title
	* @property {string} url
	* @property {string} content
*/

/** @type {HTMLElement} */
let baseResultDiv = document.getElementById('example-search-result');
baseResultDiv.removeAttribute('id');
baseResultDiv.remove();

const messageDiv = document.getElementById('message');
const resultsContainer = document.getElementById('searchresults');

const parameters = new URLSearchParams(window.location.search);
const searchParameter = parameters.get("search");

var response;
var search_index;

setup();

async function setup() {
	response = await fetch('search_index.json');

	/** @type {IndexedFile[]} */
	search_index = await response.json();

	if (searchParameter) {
		document.getElementById("searchbar").value = searchParameter;
	}

	document.getElementById("searchbar").addEventListener('input', (event) => {
		search(event.target.value);
	});

	search(document.getElementById("searchbar").value);
}


/** @param {string} searchQuery */
function search(searchQuery) {
	/** @type(HTMLDivElement[]) */
	let searchResultDivs = [];

	const fragment = document.createDocumentFragment();
	let resultsCount = 0;

	const searchQueryEmpty = searchQuery.trim() == "";

	if (!searchQueryEmpty) {
		for (const articleIndex of search_index) {
			if (articleIndex.content.toLowerCase().includes(searchQuery.toLowerCase())) {
				const thisResultDiv = articleIndexIntoSearchResultDiv(articleIndex, searchQuery);
				fragment.appendChild(thisResultDiv);

				resultsCount += howManyOcurrences(articleIndex.content, searchQuery);
			}
		}
	}

	if (resultsCount == 0) {

		messageDiv.innerHTML = searchQueryEmpty ? messageDiv.getAttribute("enter-query-message") : messageDiv.getAttribute("no-results-message").replace('{searchQuery}', searchQuery);
	} else {
		messageDiv.innerHTML = messageDiv.getAttribute("results-message").replace('{matches}', resultsCount);
	}

	resultsContainer.replaceChildren(fragment);
}

/**
	* @param {IndexedFile} articleIndex
	* @param {string} searchQuery
	* @returns {HTMLDivElement}
*/
function articleIndexIntoSearchResultDiv(articleIndex, searchQuery) {
	/** @type(HTMLDivElement) */
	const newResultDiv = baseResultDiv.cloneNode(true);

	newResultDiv.querySelector('a').href = getLinkWithHighlight(articleIndex.url, searchQuery);
	newResultDiv.querySelector('.search-result-title').textContent = articleIndex.title;

	const ocurrencesSpan = newResultDiv.querySelector('.search-result-ocurrences-count');
	ocurrencesSpan.textContent = ocurrencesSpan.textContent.replace('{matches}', howManyOcurrences(articleIndex.content, searchQuery));

	const startIndex = articleIndex.content.toLowerCase().indexOf(searchQuery.toLowerCase());
	const endIndex = startIndex + searchQuery.length;

	const CHARACTERS_AROUND_HIGHLIGHT = 150;
	let paragraphStartIndex = Math.max(0, startIndex - CHARACTERS_AROUND_HIGHLIGHT);
	let paragraphEndIndex = Math.min(articleIndex.content.length - 1, endIndex + CHARACTERS_AROUND_HIGHLIGHT);

	for (let i = paragraphStartIndex; i > -1; i--) {
		if (articleIndex.content[i] == " ") {
			paragraphStartIndex = i;
			break;
		}
	}

	for (let i = paragraphEndIndex; i < articleIndex.content.length; i++) {
		if (articleIndex.content[i] == " ") {
			paragraphEndIndex = i;
			break;
		}
	}


	const textBefore = articleIndex.content.slice(paragraphStartIndex, startIndex);
	const textHighlighted = articleIndex.content.slice(startIndex, endIndex);
	const textAfter = articleIndex.content.slice(endIndex, paragraphEndIndex);

	newResultDiv.querySelector('.search-result-content').innerHTML =
		`... ${format(textBefore)}<mark>${format(textHighlighted)}</mark>${format(textAfter)}...`;

	return newResultDiv;
}

function format(text) {
	return escapeHtml(text);
}

/**
 * @param {string} text
 * @returns {string}
 */
function escapeHtml(text) {
	return text
		.replaceAll('<?xml', '&lt;' + 'xml')
}

function getLinkWithHighlight(url, highlightedText) {
	const encodedText = encodeURIComponent(highlightedText);
	return `${url}#:~:text=${encodedText}`;
}

/**
	* @param {string} inString 
	* @param {string} ofThis 
	* @returns {string}
*/
function howManyOcurrences(inString, ofThis) {
	return inString.toLowerCase().split(ofThis.toLowerCase()).length - 1;
}



