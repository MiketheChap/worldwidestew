let searchIndex;
let searchData;

// Fetch the JSON index when the page loads
fetch('/index.json')
  .then(response => response.json())
  .then(data => {
    searchData = data;
    searchIndex = lunr(function() {
      this.ref('permalink');
      this.field('title', { boost: 10 });
      this.field('tags', { boost: 5 });
      this.field('categories', { boost: 5 });
      this.field('contents');

      data.forEach(function(doc) {
        this.add(doc);
      }, this);
    });
    
    // Initialize autocomplete after index is built
    initAutocomplete();
  });

function performSearch(query) {
  if (!searchIndex) {
    console.log('Search index not yet loaded');
    return;
  }

  console.log('Performing search for:', query);
  console.log('Search index:', searchIndex);

  const results = searchIndex.search(query);
  displayResults(results, query);
}

function displayResults(results, query) {
    const searchResults = document.getElementById('search-results');
    searchResults.innerHTML = ''; // Clear previous results
  
    console.log('Displaying results:', results);
  
    if (results.length === 0) {
      searchResults.innerHTML = '<p>No results found</p>';
      return;
    }
  
    const ul = document.createElement('ul');
    ul.className = 'search-results-list';
    
    results.forEach(result => {
      const li = document.createElement('li');
      const a = document.createElement('a');
      a.href = result.ref;
      
      // Find the full document data
      const doc = searchData.find(d => d.permalink === result.ref);
      
      // Use the title instead of the URL
      a.textContent = doc.title;
      
      li.appendChild(a);
      
      // Add a snippet of the content if available
      if (doc.contents) {
        const snippet = doc.contents.substring(0, 150) + '...';
        const p = document.createElement('p');
        p.className = 'search-result-snippet';
        p.textContent = snippet;
        li.appendChild(p);
      }
      
      ul.appendChild(li);
    });
  
    searchResults.appendChild(ul);
  }

function initAutocomplete() {
  const searchInput = document.getElementById('search-input');
  const autocompleteResults = document.createElement('ul');
  autocompleteResults.id = 'autocomplete-results';
  searchInput.parentNode.insertBefore(autocompleteResults, searchInput.nextSibling);

  searchInput.addEventListener('input', function() {
    const query = this.value.trim().toLowerCase();
    if (query.length < 2) {
      autocompleteResults.innerHTML = '';
      return;
    }

    const matches = searchData
      .filter(item => item.title.toLowerCase().includes(query))
      .slice(0, 5);  // Limit to 5 suggestions

    autocompleteResults.innerHTML = '';
    matches.forEach(match => {
      const li = document.createElement('li');
      li.textContent = match.title;
      li.addEventListener('click', function() {
        window.location.href = match.permalink;
      });
      autocompleteResults.appendChild(li);
    });
  });

  // Hide autocomplete when clicking outside
  document.addEventListener('click', function(e) {
    if (e.target !== searchInput) {
      autocompleteResults.innerHTML = '';
    }
  });
}

// Add event listener to the search form
document.addEventListener('DOMContentLoaded', function() {
  const searchForm = document.getElementById('search-form');
  const searchInput = document.getElementById('search-input');

  searchForm.addEventListener('submit', function(e) {
    e.preventDefault();
    performSearch(searchInput.value);
  });
});