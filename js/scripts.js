// Function to show the selected section and hide the others
function showSection(sectionId) {
    // Get all sections
    const sections = document.querySelectorAll('.section');
    
    // Loop through all sections
    sections.forEach(section => {
        if (section.id === sectionId) {
            // Show the clicked section
            section.classList.add('visible');
        } else {
            // Hide all other sections
            section.classList.remove('visible');
        }
    });
}

// Show Home section on page load by default
window.onload = function() {
    showSection('home');
};

