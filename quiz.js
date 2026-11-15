// Milestone #2 quiz: answer checking, timer, scoring, and reset.
const answers = [
 {type:'text', accepted:['worldwideweb','nexus'], display:'WorldWideWeb (also called Nexus)'},
 {type:'radio', correct:['0'], display:'Google'},
 {type:'radio', correct:['1'], display:'CSS'},
 {type:'checkbox', correct:['0','1','3'], display:'Chrome, Firefox, and Safari'},
 {type:'text', accepted:['hypertext markup language'], display:'HyperText Markup Language'},
 {type:'radio', correct:['2'], display:'Firefox'},
 {type:'select', correct:['3'], display:'2008'},
 {type:'radio', correct:['1'], display:'Data sent between a browser and website'},
 {type:'checkbox', correct:['0','1','2'], display:'Security, accessibility, and compatibility'},
 {type:'select', correct:['1'], display:'Interprets web content and displays the page'}
];
const form = document.getElementById('quiz-form');
const timerLabel = document.getElementById('timer');
const progressLabel = document.getElementById('progress');
const results = document.getElementById('results');
const submitButton = document.getElementById('submit-quiz');
const LIMIT_SECONDS = 600;
let startedAt = Date.now();
let timerId;
let submitted = false;
function normalize(value) { return value.toLowerCase().trim().replace(/[^a-z0-9 ]/g, '').replace(/\s+/g,' '); }
function selections(index) {
 const controls = Array.from(form.elements).filter(el => el.name === `q${index}`);
 return controls.filter(el => (el.type === 'checkbox' || el.type === 'radio') ? el.checked : el.value.trim() !== '').map(el => el.value);
}
function answeredCount() { return answers.filter((_,i) => selections(i+1).length > 0).length; }
function updateProgress() { progressLabel.textContent = `${answeredCount()} of 10 answered`; }
function elapsedSeconds() { return Math.min(LIMIT_SECONDS, Math.floor((Date.now() - startedAt) / 1000)); }
function formatTime(seconds) { return `${Math.floor(seconds/60)}:${String(seconds%60).padStart(2,'0')}`; }
function updateTimer() {
 if (submitted) return;
 const remaining = Math.max(0, LIMIT_SECONDS - elapsedSeconds());
 timerLabel.textContent = formatTime(remaining);
 timerLabel.classList.toggle('time-warning', remaining <= 60);
 if (remaining === 0) submitQuiz(true);
}
function checkAnswer(question, chosen) {
 if (question.type === 'text') return chosen.length === 1 && question.accepted.includes(normalize(chosen[0]));
 return chosen.length === question.correct.length && question.correct.every(value => chosen.includes(value));
}
function submitQuiz(timedOut = false) {
 if (submitted) return;
 submitted = true;
 clearInterval(timerId);
 const spent = elapsedSeconds();
 let score = 0;
 answers.forEach((question,i) => {
  const selected = selections(i+1);
  const correct = checkAnswer(question, selected);
  if (correct) score++;
  const feedback = document.getElementById(`feedback-${i+1}`);
  feedback.hidden = false;
  feedback.className = `question-feedback ${correct ? 'correct' : 'incorrect'}`;
  feedback.textContent = `${correct ? 'Correct (+1 point)' : 'Incorrect (0 points)'} — Correct answer: ${question.display}`;
  document.getElementById(`question-${i+1}`).classList.add(correct ? 'question-correct' : 'question-incorrect');
 });
 const passed = score >= 7;
 results.hidden = false;
 results.className = `results-panel ${passed ? 'pass' : 'fail'}`;
 // textContent avoids injecting user-supplied HTML into the result panel.
 results.replaceChildren();
 const heading = document.createElement('h2'); heading.textContent = passed ? 'Passed — Great job!' : 'Not passed — Keep practicing!';
 const summary = document.createElement('p'); summary.textContent = `Score: ${score}/10 (${score*10}%) · Time spent: ${formatTime(spent)} · ${timedOut ? 'Time expired; answers were submitted automatically.' : 'Quiz submitted.'}`;
 const detail = document.createElement('p'); detail.textContent = 'Review the correct answer and points below each question. Use Retake / Reset Quiz to try again.';
 results.append(heading,summary,detail);
 Array.from(form.elements).forEach(el => { if (el.matches('input, select')) el.disabled = true; });
 submitButton.disabled = true;
 timerLabel.textContent = formatTime(Math.max(0,LIMIT_SECONDS-spent));
 results.focus();
}
function resetQuiz() {
 clearInterval(timerId);
 form.reset();
 submitted = false;
 Array.from(form.elements).forEach(el => { if (el.matches('input, select')) el.disabled = false; });
 document.querySelectorAll('.question-feedback').forEach(el => {el.hidden = true; el.textContent = '';});
 document.querySelectorAll('.question-card').forEach(el => el.classList.remove('question-correct','question-incorrect'));
 results.hidden = true; results.replaceChildren();
 submitButton.disabled = false;
 startedAt = Date.now();
 timerLabel.classList.remove('time-warning');
 updateProgress(); updateTimer();
 timerId = setInterval(updateTimer, 250);
 window.scrollTo({top:0,behavior:'smooth'});
}
form.addEventListener('submit', event => {event.preventDefault(); submitQuiz(false);});
form.addEventListener('input', updateProgress);
form.addEventListener('change', updateProgress);
document.getElementById('reset-quiz').addEventListener('click', resetQuiz);
resetQuiz();
