let numbers;
let currentMode = 'number'; // 'number' or 'text'
let correctAnswers = 0;
let incorrectAnswers = 0;
let answersHistory = {}; // Track answers history to identify most mistaken numbers


const modeDiv = document.getElementById('mode');
const questionDiv = document.getElementById('question');
const answerInput = document.getElementById('answerInput');
const submitAnswerButton = document.getElementById('submitAnswer');
const resultsDiv = document.getElementById('results');
const difficulty = document.getElementById('difficulty');


fetch('danish_numbers.json')
    .then(response => response.json())
    .then(data => {
        numbers = data;
        console.log("Loaded numbers");
        updateMode();
    })
    .catch(error => console.error('Error fetching numbers:', error));


answerInput.addEventListener('keypress', function(e) {
    if (e.key === 'Enter') {
        e.preventDefault(); 
        submitAnswerButton.click(); 
    }
});

document.getElementById('difficulty').addEventListener('change', function() {
    const selectedDifficulty = this.value;
    console.log('Selected difficulty:', selectedDifficulty);
    generateQuestion();
});

function updateMode() {
    modeDiv.textContent = `${currentMode.toUpperCase()} MODE`;
    generateQuestion();
}


function generateQuestion() {
    if (numbers) {
        let keys;
        if (difficulty.value === 'easy') {
            keys = Object.keys(numbers).filter(key => parseInt(key) <= 10);
        } else if (difficulty.value === 'medium') {
            keys = Object.keys(numbers).filter(key => parseInt(key)  <= 100);
        } else if (difficulty.value === 'all'){
            keys = Object.keys(numbers);
        } else {
            console.error('Invalid difficulty level');
            return;
        }
        currentNumberKey = keys[Math.floor(Math.random() * keys.length)];
        questionDiv.textContent = currentMode === 'read' ? `How do you say "${currentNumberKey}" in Danish?` : `What is the number for "${numbers[currentNumberKey]}"?`;
    } else {
        console.error('Numbers data is not available');
    }
}

document.getElementById('difficulty').addEventListener('change', function() {
    const selectedDifficulty = this.value;
    generateQuestion(selectedDifficulty);
});

function checkAnswer() {
    const userAnswer = answerInput.value.trim();
    const correctAnswer = currentMode === 'read' ? numbers[currentNumberKey] : currentNumberKey;
    const answerStatus = document.createElement('div');
    if (userAnswer.toLowerCase() === correctAnswer.toLowerCase()) {
        correctAnswers++;
        answerStatus.textContent = 'Correct!';
        answerStatus.style.color = 'green';
    } else {
        incorrectAnswers++;
        answerStatus.textContent = `Incorrect! The correct answer was "${correctAnswer}".`;
        answerStatus.style.color = 'red';
    }
    questionDiv.parentNode.insertBefore(answerStatus, questionDiv);
    setTimeout(() => {
        answerStatus.remove();
    }, 2000); // Remove the status message after 2 seconds
    updateResults();
    generateQuestion(difficulty.value);
    answerInput.value = '';
}

function updateResults() {
    resultsDiv.innerHTML = `<strong>Results:</strong><br>Correct answers: ${correctAnswers}<br>Incorrect answers: ${incorrectAnswers}`;

    // Additional stats for most mistaken and memorized numbers
    let mostMistaken = Object.keys(answersHistory).sort((a, b) => answersHistory[b].incorrect - answersHistory[a].incorrect)[0];
    let mostMemorized = Object.keys(answersHistory).sort((a, b) => answersHistory[b].correct - answersHistory[a].correct)[0];
    if(mostMistaken) {
        resultsDiv.innerHTML += `<br>Most mistaken number: "${mostMistaken}" (${answersHistory[mostMistaken].incorrect} times)`;
    }
    if(mostMemorized) {
        resultsDiv.innerHTML += `<br>Best memorized number: "${mostMemorized}" (${answersHistory[mostMemorized].correct} times)`;
    }
}

document.getElementById('toggleMode').addEventListener('click', () => {
    currentMode = currentMode === 'number' ? 'text' : 'number';
    updateMode();
});

document.getElementById('submitAnswer').addEventListener('click', checkAnswer);

