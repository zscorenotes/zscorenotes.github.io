// Function to show the selected section and hide the others
function showSection(event, sectionId) {
    if (event) {
        event.preventDefault();
    }

    const sections = document.querySelectorAll('.section');
    const navLinks = document.querySelectorAll('header nav ul li a'); // More specific selector for main nav

    sections.forEach(section => {
        section.classList.toggle('visible', section.id === sectionId);
    });

    navLinks.forEach(link => {
        link.classList.toggle('active-nav', link.getAttribute('href') === `#${sectionId}`);
    });

    // If navigating to a section, scroll to the top of that section
    if (sectionId && document.getElementById(sectionId)) {
        setTimeout(() => {
            const sectionElement = document.getElementById(sectionId);
            if (sectionElement) {
                let headerOffset = 0;
                const mainNavElement = document.querySelector('header nav'); // Main page sticky nav
                if (mainNavElement && getComputedStyle(mainNavElement).position === 'sticky') {
                    headerOffset = mainNavElement.offsetHeight;
                }
                const elementPosition = sectionElement.getBoundingClientRect().top + window.scrollY;
                const offsetPosition = elementPosition - headerOffset;

                window.scrollTo({
                    top: offsetPosition,
                    behavior: "smooth"
                });
            }
        }, 100);
    } else if (sectionId === 'home') {
         window.scrollTo({ top: 0, behavior: "smooth" });
    }
}

// Set current year in footer
function setCurrentYear() {
    const yearSpan = document.getElementById('currentYear');
    if (yearSpan) {
        yearSpan.textContent = new Date().getFullYear();
    }
}

// --- Portfolio Logic ---
let portfolioData = [];

async function loadPortfolio() {
    try {
        const response = await fetch('portfolio.json'); 
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        portfolioData = await response.json();
        renderPortfolioItems(portfolioData);
    } catch (error) {
        console.error("Could not load portfolio data:", error);
        const portfolioGrid = document.getElementById('portfolioGrid');
        if (portfolioGrid) {
            portfolioGrid.innerHTML = "<p>Error loading portfolio projects. Please try again later.</p>";
        }
    }
}

function renderPortfolioItems(projects) {
    const portfolioGrid = document.getElementById('portfolioGrid');
    if (!portfolioGrid) return;

    portfolioGrid.innerHTML = ''; 

    projects.forEach(project => {
        const item = document.createElement('div');
        // Using portfolio-item class for consistent styling
        item.className = 'portfolio-item'; 
        item.innerHTML = `
            <a href="project-detail.html?id=${project.id}" class="portfolio-item-link">
                <img src="${project.coverImage}" alt="${project.title} Thumbnail" class="portfolio-thumbnail">
                <div class="portfolio-item-content">
                    <h4>${project.title}</h4>
                </div>
            </a>
            <div class="portfolio-item-lower-content">
                <p>${project.summary || 'Click to learn more.'}</p>
                <div class="portfolio-tags">
                    ${project.tags.map(tag => `<span class="tag">${tag}</span>`).join('')}
                </div>
                <a href="project-detail.html?id=${project.id}" class="portfolio-external-link news-read-more-link">Read More →</a>
            </div>
        `;
        portfolioGrid.appendChild(item);
    });
}

// --- News Logic ---
async function loadNews() {
    const newsGrid = document.getElementById('newsGrid');
    if (!newsGrid) {
        return;
    }

    try {
        const response = await fetch('news.json');
        if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
        const newsData = await response.json();

        if (newsData.length === 0) {
            newsGrid.innerHTML = "<p>No news articles found at the moment.</p>";
            return;
        }

        newsGrid.innerHTML = ''; // Clear loading message

        newsData.forEach(article => {
            const item = document.createElement('div');
            // Use 'portfolio-item' class for news items to inherit portfolio styling
            item.className = 'portfolio-item news-card-item'; // Add an extra class if specific news styling is ever needed

            let tagsHTML = '';
            if (article.tags && article.tags.length > 0) {
                tagsHTML = article.tags.map(tag => `<span class="tag">${tag}</span>`).join('');
            }
            
            const formattedDate = new Date(article.date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

            // Structure mirrors portfolio items
            item.innerHTML = `
                <a href="news-detail.html?id=${article.id}" class="portfolio-item-link"> 
                    ${article.coverImage ? `<img src="${article.coverImage}" alt="${article.title} Thumbnail" class="portfolio-thumbnail">` : '<div class="portfolio-thumbnail placeholder-thumbnail">No Image</div>'}
                    <div class="portfolio-item-content">
                        <h4>${article.title}</h4>
                    </div>
                </a>
                <div class="portfolio-item-lower-content">
                    <p class="news-date-summary"><strong>Published:</strong> ${formattedDate}</p>
                    <p>${article.summary || 'Click to learn more.'}</p>
                    ${tagsHTML ? `<div class="portfolio-tags">${tagsHTML}</div>` : ''}
                    <a href="news-detail.html?id=${article.id}" class="portfolio-external-link news-read-more-link">Read More →</a>
                </div>
            `;
            newsGrid.appendChild(item);
        });

    } catch (error) {
        console.error('Failed to load news items:', error);
        newsGrid.innerHTML = "<p>Could not load news. Please try again later.</p>";
    }
}


// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    setCurrentYear();
    loadPortfolio(); 
    loadNews(); // Load news items for the #news section in index.html

    const currentHash = window.location.hash.substring(1);
    if (currentHash) {
        const targetSection = document.getElementById(currentHash);
        if (targetSection && targetSection.classList.contains('section')) {
            showSection(null, currentHash);
        } else {
            showSection(null, 'home'); 
        }
    } else {
        showSection(null, 'home'); 
    }

    const navLinks = document.querySelectorAll('header nav ul li a');
    navLinks.forEach(link => {
        link.addEventListener('click', function(event) {
            const href = this.getAttribute('href');
            if (href.startsWith('#')) { // Internal section link
                const sectionId = href.substring(1);
                if (document.getElementById(sectionId)) {
                     showSection(event, sectionId);
                }
            }
            // If it's an external link (like news-detail.html from a news card), the browser will handle it.
        });
    });
});
