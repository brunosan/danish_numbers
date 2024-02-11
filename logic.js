let numbers;
let currentMode = 'number'; // 'number' or 'text'
let correctAnswers = 0;
let incorrectAnswers = 0;
let answersHistory = {}; // Track answers history to identify most mistaken numbers


const modeDiv = document.getElementById('mode');
const questionDiv = document.getElementById('question');
const answerInput = document.getElementById('answerInput');
const answerStatus = document.getElementById('answerStatus');
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
    answerStatus.textContent = '';
    if (userAnswer.toLowerCase() === correctAnswer.toLowerCase()) {
        correctAnswers++;
        answerStatus.textContent = `Correct! "${numbers[currentNumberKey]}" is "${correctAnswer}".`;
        answerStatus.style.color = 'green';
    } else {
        incorrectAnswers++;
        answerStatus.textContent = `Incorrect! "${numbers[currentNumberKey]}" is "${correctAnswer}". Not "${userAnswer}".`;
        answerStatus.style.color = 'red';
    }

    if (!answersHistory[currentNumberKey]) {
        answersHistory[currentNumberKey] = { correct: 0, incorrect: 0 };
    }
    answersHistory[currentNumberKey].userAnswer = userAnswer;
    if (userAnswer.toLowerCase() === correctAnswer.toLowerCase()) {
        answersHistory[currentNumberKey].correct++;
    } else {
        answersHistory[currentNumberKey].incorrect++;
    }

    updateResults();
    generateQuestion(difficulty.value);
    answerInput.value = '';
    answerInput.focus();
}

function updateResults() {
    const totalQuestions = correctAnswers + incorrectAnswers;
    const score = totalQuestions > 0 ? `${((correctAnswers / totalQuestions) * 100).toFixed(0)}%` : 'N/A';

    
    let tableHTML = `<strong>Results: <strong>Total Correct: ${score}</strong><br></strong><br><table><tr><th>Number</th><th>Text</th><th>Correct?</th></tr>`;

    // Reverse the order of keys
    const Keys = Object.keys(answersHistory);

    let tableHTMLbody = '';
    Keys.forEach(number => {
        const text = numbers[number];
        const wasCorrect = answersHistory[number].userAnswer.toLowerCase() === number.toLowerCase();

        tableHTMLbody = `<tr><td>${number}</td><td>${text}</td><td>${wasCorrect ? 'Correct' : `Incorrect (${answersHistory[number].userAnswer})`}</td></tr>`
                  + tableHTMLbody;
    });

    tableHTML += tableHTMLbody + `</table>`;
    resultsDiv.innerHTML = tableHTML;
}

document.getElementById('toggleMode').addEventListener('click', () => {
    currentMode = currentMode === 'number' ? 'text' : 'number';
    updateMode();
});

document.getElementById('submitAnswer').addEventListener('click', checkAnswer);

document.addEventListener('DOMContentLoaded', function() {
    answerInput.focus(); 
});