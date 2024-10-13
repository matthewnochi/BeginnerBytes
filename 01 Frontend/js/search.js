let skillsJSON = {};

async function loadSkillsJSON() {
    try {
        const response = await fetch('http://10.101.0.5:5000/static/Skills.json'); 
        if (!response.ok) {
            throw new Error('Could not load skills.json');
        }
        skillsJSON = await response.json(); 
    } catch (error) {
        console.error('Error loading skills.json:', error);
    }
}

loadSkillsJSON();

function checkForKeywords(resultText) {
    const foundKeywords = [];

    const currentDate = new Date().toISOString();

    for (const category in skillsJSON) {
        for (const skillCategory in skillsJSON[category]) {
            const keywords = skillsJSON[category][skillCategory];

            keywords.forEach(keyword => {
                if (resultText.includes(keyword)) {
                    foundKeywords.push(keyword);

                    const keywordData = {
                        keyword: keyword,
                        dateAccessed: currentDate
                    };

                    localStorage.setItem(keyword, JSON.stringify(keywordData));
                }
            });
        }
    }

    return foundKeywords;
}


const voiceButton = document.getElementById('voice-button');
const searchInput = document.getElementById('search-input');
const container = document.getElementById('hero-main');

const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
let recognition;

if (SpeechRecognition) {
    recognition = new SpeechRecognition();

    recognition.continuous = false;
    recognition.interimResults = false; 
    recognition.lang = 'en-US'; 

    recognition.onstart = () => {
        voiceButton.innerText = 'Listening...'; 
    };

    recognition.onend = () => {
        voiceButton.innerText = 'Start Voice Search';
    };

    recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        searchInput.value = searchInput.value + transcript; 
    };

    recognition.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        alert(`Recognition error: ${event.error}`);
    };

    voiceButton.addEventListener('click', () => {
        recognition.start();
    });
} else {
    alert("Speech recognition not supported in this browser.");
}

searchInput.addEventListener('keydown', (event) => {
    if (event.key === 'Enter') {
        const query = event.target.value; 
        event.target.value = "";
        const answer = performSearch(query);
        container.innerHTML = "";

        const queryText = document.createElement('div');
        queryText.textContent = query;
        queryText.classList.add("hero-query");
        container.appendChild(queryText);

        const answerText = document.createElement('div');
        answerText.classList.add("hero-answer");
        container.appendChild(answerText);

        const buttons = document.createElement('div');
        buttons.classList.add('hero-next');
        container.append(buttons);

        const svgNamespace = "http://www.w3.org/2000/svg"; 
        const speechButton = document.createElementNS(svgNamespace, "svg");
        speechButton.setAttribute("xmlns", svgNamespace);
        speechButton.setAttribute("viewBox", "0 0 24 24");
        const title = document.createElementNS(svgNamespace, "title");
        title.textContent = "volume-high";
        const path = document.createElementNS(svgNamespace, "path");
        path.setAttribute("d", "M14,3.23V5.29C16.89,6.15 19,8.83 19,12C19,15.17 16.89,17.84 14,18.7V20.77C18,19.86 21,16.28 21,12C21,7.72 18,4.14 14,3.23M16.5,12C16.5,10.23 15.5,8.71 14,7.97V16C15.5,15.29 16.5,13.76 16.5,12M3,9V15H7L12,20V4L7,9H3Z");
        speechButton.appendChild(title);
        speechButton.appendChild(path);
        buttons.appendChild(speechButton);
        speechButton.classList.add('hero-button');

        const reset = document.createElement('button');
        reset.classList.add('hero-reset');
        buttons.appendChild(reset);
        reset.textContent = "New Prompt";

        answer.then(result => {
            const foundKeywords = checkForKeywords(result);
            answerText.textContent = result;
            speechButton.addEventListener('click', function(event) {
                const utterance = new SpeechSynthesisUtterance(result);  
                utterance.lang = 'en-US';  
                utterance.rate = 1; 
                window.speechSynthesis.speak(utterance);
            })
        })

        reset.addEventListener('click', function(event) {
            location.reload();
        })



    }
});

async function performSearch(query) {
    try {
        const response = await fetch('http://10.101.0.5:5000/search', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ query })  
        });

        if (!response.ok) {
            throw new Error('Network response was not ok');
        }

        const results = await response.json(); 
        return results;
    } catch (error) {
        console.error('Error during search:', error);
        return [];
    }
}


