let currentOpenDropdown = null; 

function createDropdown(buttonId, contentId) {
    const button = document.getElementById(buttonId);
    const content = document.getElementById(contentId);
    const totalHeight = Array.from(content.children).length * 40;

    content.style.maxHeight = '0px';
    content.style.opacity = '0';

    button.setAttribute('aria-haspopup', 'true');
    button.setAttribute('aria-expanded', 'false');

    button.addEventListener("click", function (event) {
        event.stopPropagation();

        if (currentOpenDropdown && currentOpenDropdown !== content) {
            currentOpenDropdown.style.maxHeight = '0px';
            currentOpenDropdown.style.opacity = '0';
            currentOpenDropdown.previousElementSibling.setAttribute('aria-expanded', 'false'); 
        }

        const isVisible = content.style.maxHeight === `${totalHeight}px`;
        content.style.maxHeight = isVisible ? '0px' : `${totalHeight}px`;
        content.style.opacity = isVisible ? '0' : '1';
        button.setAttribute('aria-expanded', !isVisible);

        currentOpenDropdown = isVisible ? null : content; 
    });

    window.addEventListener("click", (event) => {
        if (!content.contains(event.target) && event.target !== button) {
            content.style.maxHeight = '0px';
            content.style.opacity = '0';
            button.setAttribute('aria-expanded', 'false');

            if (currentOpenDropdown === content) {
                currentOpenDropdown = null; 
            }
        }
    });
}

document.addEventListener("DOMContentLoaded", function() {
    createDropdown("header-history-button", "header-history-content");
    createDropdown("header-settings-button", "header-settings-content");
    createDropdown("header-explore-button", "header-explore-content");
    const homeButton = document.getElementById('skills-button');
    homeButton.addEventListener('click', function() {
        window.location.href = 'skills.html'; // Redirects to skills.html
    });
    
});
