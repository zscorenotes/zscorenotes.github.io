// Function to show the selected section and hide the others
function showSection(event, sectionId) {
    // Prevent the default anchor link action
    event.preventDefault();

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