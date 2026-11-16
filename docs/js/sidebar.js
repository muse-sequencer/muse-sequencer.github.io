const SIDEBAR_CACHE_ID = 'sidebar-cache';

const cachedSidebarHtml = sessionStorage.getItem(SIDEBAR_CACHE_ID);

if (cachedSidebarHtml) {
	loadSidebarHtml(cachedSidebarHtml);
}

fetch('contents.html')
	.then(r => r.text())
	.then(html => {
		sessionStorage.setItem(SIDEBAR_CACHE_ID, html);
		loadSidebarHtml(html);
	});


function loadSidebarHtml(html) {
	const contentsDiv = document.getElementById('contents');
	contentsDiv.innerHTML = html;

	afterSidebarLoaded();
}

function pressExpandButton() {
	const contents = document.querySelector('#contents');
	contents.classList.toggle('expanded');
}

function afterSidebarLoaded() {
	document.querySelector('#mobile-bar').addEventListener('click', pressExpandButton);
	document.querySelector('#mini-searchbar').addEventListener('keydown', (event) => {
		if(event.key !== 'Enter') return;
		window.location.href = `search.html?search=${event.target.value}`;
	});

	const first_h1_element = document.querySelector('h1');

	if(first_h1_element){
		document.querySelector('#mobile-bar-title').innerHTML = first_h1_element.innerHTML; 
	};
}



