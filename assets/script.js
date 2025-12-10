document.addEventListener('DOMContentLoaded', () => {
    fetch('catalogs.json')
        .then(response => response.json())
        .then(catalogs => {
            const categoriesContainer = document.getElementById('categories-container');
            categoriesContainer.innerHTML = ''; // Clear loading message

            if (catalogs.length === 0) {
                categoriesContainer.innerHTML = '<p>No catalogs available.</p>';
                return;
            }

            // Group catalogs by category
            const categorizedCatalogs = catalogs.reduce((acc, catalog) => {
                if (catalog.visible) {
                    const category = catalog.category || 'Uncategorized';
                    if (!acc[category]) {
                        acc[category] = [];
                    }
                    acc[category].push(catalog);
                }
                return acc;
            }, {});

            // Sort categories alphabetically
            const sortedCategories = Object.keys(categorizedCatalogs).sort();

            sortedCategories.forEach(category => {
                const categorySection = document.createElement('section');
                categorySection.classList.add('category-section');

                const h2 = document.createElement('h2');
                h2.textContent = category;
                categorySection.appendChild(h2);

                const catalogCardsContainer = document.createElement('div');
                catalogCardsContainer.classList.add('catalog-cards-container');

                categorizedCatalogs[category].forEach(catalog => {
                    const catalogCard = document.createElement('a');
                    catalogCard.href = catalog.path;
                    catalogCard.classList.add('catalog-card');

                    catalogCard.innerHTML = `
                        <div class="catalog-card-image-wrapper">
                            <img src="${catalog.image}" alt="${catalog.title}" class="catalog-image">
                        </div>
                        <div class="catalog-card-overlay">
                            <h3 class="catalog-name">${catalog.title}</h3>
                            <button class="view-catalog-btn">View Catalog</button>
                        </div>
                    `;
                    catalogCardsContainer.appendChild(catalogCard);
                });

                categorySection.appendChild(catalogCardsContainer);
                categoriesContainer.appendChild(categorySection);
            });
        })
        .catch(error => {
            console.error('Error fetching catalogs:', error);
            document.getElementById('categories-container').innerHTML = '<p>Error loading catalogs.</p>';
        });
});