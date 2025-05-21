// Function to show the selected section and hide the others
function showSection(event, sectionId) {
    if (event) {
        event.preventDefault();
    }

    const sections = document.querySelectorAll('.section');
    const navLinks = document.querySelectorAll('nav ul li a');

    sections.forEach(section => {
        section.classList.toggle('visible', section.id === sectionId);
    });

    navLinks.forEach(link => {
        link.classList.toggle('active-nav', link.getAttribute('href') === `#${sectionId}`);
    });
}

// Set current year in footer
function setCurrentYear() {
    const yearSpan = document.getElementById('currentYear');
    if (yearSpan) {
        yearSpan.textContent = new Date().getFullYear();
    }
}

// --- Portfolio and Lightbox Logic ---
let portfolioData = [];
let currentLightboxProjectImages = [];
let currentImageIndex = 0;

// Fetch and render portfolio items
async function loadPortfolio() {
    try {
        const response = await fetch('portfolio.json'); // Or 'data/portfolio.json' if you created a subfolder
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

    portfolioGrid.innerHTML = ''; // Clear existing items

    projects.forEach(project => {
        const item = document.createElement('div');
        item.className = 'portfolio-item';
        item.innerHTML = `
            <img src="${project.coverImage}" alt="${project.title} Thumbnail" class="portfolio-thumbnail" data-project-id="${project.id}">
            <div class="portfolio-item-content">
                <h4>${project.title}</h4>
                <p>${project.description}</p>
                <div class="portfolio-tags">
                    ${project.tags.map(tag => `<span class="tag">${tag}</span>`).join('')}
                </div>
                ${project.link ? `<a href="${project.link}" target="_blank" class="portfolio-link">${project.linkText || 'View Details'}</a>` : ''}
            </div>
        `;
        portfolioGrid.appendChild(item);

        // Add click listener to the thumbnail
        item.querySelector('.portfolio-thumbnail').addEventListener('click', function() {
            openLightbox(this.dataset.projectId);
        });
    });
}

// Lightbox Functionality
const lightbox = document.getElementById('imageLightbox');
const lightboxImg = document.getElementById('lightboxImg');
const captionText = document.getElementById('caption');
const prevButton = document.getElementById('lightboxPrev');
const nextButton = document.getElementById('lightboxNext');

function openLightbox(projectId) {
    const project = portfolioData.find(p => p.id === projectId);
    if (!project || !project.images || project.images.length === 0) return;

    currentLightboxProjectImages = project.images;
    currentImageIndex = 0; // Start with the first image of the project
    
    updateLightboxImage();
    lightbox.style.display = "block";
}

function closeLightbox() {
    lightbox.style.display = "none";
}

function updateLightboxImage() {
    if (currentLightboxProjectImages.length === 0) return;
    const project = portfolioData.find(p => p.images.includes(currentLightboxProjectImages[currentImageIndex]));
    
    lightboxImg.src = currentLightboxProjectImages[currentImageIndex];
    captionText.innerHTML = project ? `${project.title} (${currentImageIndex + 1}/${currentLightboxProjectImages.length})` : `Image ${currentImageIndex + 1}/${currentLightboxProjectImages.length}`;

    // Show/hide navigation buttons
    prevButton.style.display = currentLightboxProjectImages.length > 1 ? "block" : "none";
    nextButton.style.display = currentLightboxProjectImages.length > 1 ? "block" : "none";
}

function changeLightboxImage(direction) {
    currentImageIndex += direction;
    if (currentImageIndex >= currentLightboxProjectImages.length) {
        currentImageIndex = 0;
    } else if (currentImageIndex < 0) {
        currentImageIndex = currentLightboxProjectImages.length - 1;
    }
    updateLightboxImage();
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Lightbox HTML structure (ensure this is in your index.html or added here)
    // The one from the previous response is fine if you already added it.
    // Otherwise, add it here or ensure it's in index.html *before* this script runs.

    setCurrentYear();
    loadPortfolio(); // Load portfolio items from JSON

    // Event listener for closing lightbox by clicking outside the image (on the overlay)
    // Or simply on the lightbox itself as it covers the screen
    if (lightbox) {
        lightbox.addEventListener('click', (e) => {
            if (e.target === lightbox) { // Close only if overlay itself is clicked
                closeLightbox();
            }
        });
    }
    if (prevButton) {
        prevButton.addEventListener('click', (e) => {
            e.stopPropagation(); // Prevent lightbox from closing
            changeLightboxImage(-1);
        });
    }
    if (nextButton) {
        nextButton.addEventListener('click', (e) => {
            e.stopPropagation(); // Prevent lightbox from closing
            changeLightboxImage(1);
        });
    }
    
    // Keyboard navigation for lightbox
    document.addEventListener('keydown', function(e) {
        if (lightbox.style.display === 'block') {
            if (e.key === 'Escape') {
                closeLightbox();
            } else if (e.key === 'ArrowLeft') {
                if (currentLightboxProjectImages.length > 1) changeLightboxImage(-1);
            } else if (e.key === 'ArrowRight') {
                if (currentLightboxProjectImages.length > 1) changeLightboxImage(1);
            }
        }
    });

    // Initial section display
    if (window.location.hash) {
        const hashId = window.location.hash.substring(1);
        const targetSection = document.getElementById(hashId);
        if (targetSection && targetSection.classList.contains('section')) {
            showSection(null, hashId);
        } else {
            showSection(null, 'home');
        }
    } else {
        showSection(null, 'home');
    }
});