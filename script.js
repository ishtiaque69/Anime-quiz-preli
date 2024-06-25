let timer;
let timeLeft = 1200; // 20 minutes in seconds

function startQuiz() {
    const name = document.getElementById('name').value;
    const phone = document.getElementById('phone').value;
    const email = document.getElementById('email').value;

    if (!name || !phone || !email) {
        alert('Please enter your name, phone number, and email.');
        return;
    }

    const submissions = JSON.parse(localStorage.getItem('submissions')) || [];
    const emailExists = submissions.some(submission => submission.email === email);

    if (emailExists) {
        alert("This email ID has already been used to take the quiz.");
        return;
    }

    submissions.push({ name, phone, email });
    localStorage.setItem('submissions', JSON.stringify(submissions));
    localStorage.setItem('userName', name);
    localStorage.setItem('userPhone', phone);
    localStorage.setItem('userEmail', email);
    localStorage.setItem('quizStartTime', new Date().getTime()); // Store start time

    preventBackNavigation();
    localStorage.setItem('timeLeft', timeLeft);
    window.location.href = 'quiz.html';
}

function startTimer() {
    const timerElement = document.getElementById('timer');
    const savedTimeLeft = localStorage.getItem('timeLeft');
    if (savedTimeLeft) {
        timeLeft = parseInt(savedTimeLeft);
    }

    timer = setInterval(() => {
        timeLeft--;
        localStorage.setItem('timeLeft', timeLeft);
        let minutes = Math.floor(timeLeft / 60);
        let seconds = timeLeft % 60;
        timerElement.textContent = `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;

        if (timeLeft <= 0) {
            clearInterval(timer);
            submitQuiz();
        }
    }, 1000);
}

function submitQuiz() {
    clearInterval(timer);
    localStorage.removeItem('timeLeft');

    const form = document.getElementById('quizForm');
    const formData = new FormData(form);
    let userAnswers = {};

    formData.forEach((value, key) => {
        userAnswers[key] = value;
    });

    const userName = localStorage.getItem('userName');
    const userEmail = localStorage.getItem('userEmail');
    const userPhone = localStorage.getItem('userPhone');
    userAnswers['name'] = userName;
    userAnswers['email'] = userEmail;
    userAnswers['phone'] = userPhone;

    const quizStartTime = parseInt(localStorage.getItem('quizStartTime'));
    const quizEndTime = new Date().getTime();
    const timeTaken = Math.floor((quizEndTime - quizStartTime) / 1000); // Time taken in seconds
    userAnswers['timeTaken'] = timeTaken;

    const allAnswers = JSON.parse(localStorage.getItem('allAnswers')) || [];
    allAnswers.push(userAnswers);
    localStorage.setItem('allAnswers', JSON.stringify(allAnswers));

    preventBackNavigation();
    window.location.href = 'results.html';
}

function loadResults() {
    const userName = localStorage.getItem('userName');

    document.getElementById('thankYouMessage').textContent = `Thank you, ${userName}, for participating! Your response is being processed right now. Soon we will publish the leaderboard in the group.`;
}

function loadAnswerSheet() {
    const allAnswers = JSON.parse(localStorage.getItem('allAnswers')) || [];
    const allUserAnswersDiv = document.getElementById('allUserAnswers');

    if (allAnswers.length > 0) {
        const table = document.createElement('table');
        const thead = document.createElement('thead');
        const tbody = document.createElement('tbody');

        const headerRow = document.createElement('tr');
        headerRow.innerHTML = '<th>Name</th><th>Email</th><th>Time Taken (seconds)</th>';

        // Extract question headers dynamically based on stored data
        const questionKeys = Object.keys(allAnswers[0]).filter(key => key !== 'name' && key !== 'email' && key !== 'phone' && key !== 'timeTaken');
        questionKeys.forEach(key => {
            const th = document.createElement('th');
            th.textContent = `Answer to ${key}`;
            headerRow.appendChild(th);
        });

        thead.appendChild(headerRow);
        table.appendChild(thead);

        allAnswers.forEach(user => {
            const row = document.createElement('tr');
            row.innerHTML = `<td>${user.name}</td><td>${user.email}</td><td>${user.timeTaken}</td>`;

            questionKeys.forEach(key => {
                const td = document.createElement('td');
                td.textContent = user[key] || 'N/A';
                row.appendChild(td);
            });

            tbody.appendChild(row);
        });

        table.appendChild(tbody);
        allUserAnswersDiv.appendChild(table);
    } else {
        allUserAnswersDiv.textContent = 'No answers submitted yet.';
    }
}

function preventBackNavigation() {
    history.pushState(null, null, location.href);
    window.addEventListener('popstate', () => {
        history.pushState(null, null, location.href);
    });
}

function restoreQuizState() {
    if (window.location.pathname.endsWith('quiz.html')) {
        const savedTimeLeft = localStorage.getItem('timeLeft');
        if (savedTimeLeft) {
            timeLeft = parseInt(savedTimeLeft);
        }
        startTimer();
    }
}

if (window.location.pathname.endsWith('quiz.html')) {
    preventBackNavigation();
    restoreQuizState();
} else if (window.location.pathname.endsWith('results.html')) {
    preventBackNavigation();
    loadResults();
} else if (window.location.pathname.endsWith('answer_sheet.html')) {
    preventBackNavigation();
    loadAnswerSheet();
}
