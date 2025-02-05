
function createSkillCards() {
    const skillsContainer = document.querySelector('.skills');

    for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        const storedData = localStorage.getItem(key);

        if (storedData) {
            try {
                const keywordData = JSON.parse(storedData);
                if (keywordData.keyword && keywordData.dateAccessed) {

                    const skillCard = document.createElement('div');
                    skillCard.classList.add('skill-card');
                    skillCard.innerHTML = `
                    <h3>${keywordData.keyword}</h3>
                    <p>Completion Date: ${new Date(keywordData.dateAccessed).toLocaleDateString()}</p>
                    `;
                    
                    skillsContainer.appendChild(skillCard);
                } else {
                    console.error('Invalid data format for key:', key);
                }
            } catch (error) {
                console.error('Error parsing data for key:', key, error);
            }
        }
    }
}

// Call the function to create skill cards when the page loads
window.onload = createSkillCards;
