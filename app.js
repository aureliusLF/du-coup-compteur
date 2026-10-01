const score = document.querySelector('#score');
const listen = document.querySelector('#listen');
const reset = document.querySelector('#reset');
const status = document.querySelector('#status');
const transcript = document.querySelector('#transcript');
const wave = document.querySelector('#wave');
const buttonText = document.querySelector('#button-text');

const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
let recognition;
let listening = false;
let total = Number(localStorage.getItem('du-coup-score') || 0);
score.value = total;

function setScore(value) { total = value; score.value = total; localStorage.setItem('du-coup-score', total); }
function setListening(value) {
  listening = value;
  listen.classList.toggle('listening', value); wave.classList.toggle('active', value); status.classList.toggle('live', value);
  buttonText.textContent = value ? "Arrêter l'écoute" : "Commencer l'écoute";
  status.textContent = value ? 'Le micro écoute… dites « du coup ».': 'Le micro est en pause.';
}
function occurrences(text) { return (text.toLowerCase().match(/\bdu[\s-]*coup\b/gi) || []).length; }

if (!SpeechRecognition) {
  listen.disabled = true;
  status.textContent = 'La reconnaissance vocale n’est pas disponible ici. Ouvrez cette page dans Chrome ou Edge.';
} else {
  recognition = new SpeechRecognition();
  recognition.lang = 'fr-FR'; recognition.continuous = true; recognition.interimResults = true;
  recognition.onresult = (event) => {
    let finalText = '', currentText = '';
    for (let i = event.resultIndex; i < event.results.length; i++) {
      const text = event.results[i][0].transcript;
      currentText += text;
      if (event.results[i].isFinal) finalText += text;
    }
    transcript.textContent = currentText || finalText || 'J’écoute…';
    if (finalText) setScore(total + occurrences(finalText));
  };
  recognition.onerror = (event) => { if (event.error === 'not-allowed') { status.textContent = 'L’accès au micro a été refusé. Autorisez-le puis réessayez.'; setListening(false); } };
  recognition.onend = () => { if (listening) { try { recognition.start(); } catch (_) {} } };
}
listen.addEventListener('click', () => {
  if (listening) { setListening(false); recognition.stop(); return; }
  recognition.start(); setListening(true);
});
reset.addEventListener('click', () => { setScore(0); transcript.textContent = 'Compteur remis à zéro.'; });
