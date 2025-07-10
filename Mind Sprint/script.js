const username = localStorage.getItem("username");
if (username) {
  document.getElementById("username").textContent = username;
}

let questions = [];
let score = 0;
let quesCount = 0;
let maxques = 12;
let attempt = 0;
let unattempt = maxques;
let review = 0;
let currques = {};
let accans = true;
let selchoice = null;

const choices = Array.from(document.getElementsByClassName("choice"));
const scoreText = document.getElementById("score");
const attemptText = document.getElementById("attempt");
const unattemptText = document.getElementById("unattempt");
const reviewText = document.getElementById("reviewbutton");
const next = document.getElementById("next");
const end = document.getElementById("end");
const reviewBtn = document.getElementById("review");
const submitBtn = document.getElementById("submit");

// QUESTION SELECTION
choices.forEach(choice => {
  choice.addEventListener("click", event => {
    if (!accans) return;
    if (selchoice) selchoice.style.backgroundColor = "#efe9e9";

    selchoice = event.currentTarget.querySelector(".value");
    selchoice.style.backgroundColor = "blue";
  });
});

// SUBMIT ANSWER
submitBtn.addEventListener("click", () => {
  if (!selchoice) return;

  const selectedAns = selchoice.dataset["number"];
  if (selectedAns == currques.answer) {
    selchoice.style.backgroundColor = "green";
    score += 4;
  } else {
    selchoice.style.backgroundColor = "red";
    score -= 1;
  }

  setTimeout(() => {
    selchoice.style.backgroundColor = "#efe9e9";
    newques();
  }, 1000);

  scoreText.textContent = score;
  localStorage.setItem("score", score);

  attempt++;
  unattempt--;

  attemptText.textContent = `Attempted: ${attempt}`;
  unattemptText.textContent = `Unattempted: ${unattempt}`;

  document.getElementById(quesCount).style.backgroundColor = "green";
  accans = true;
  selchoice = null;
});

// MARK FOR REVIEW
reviewBtn.addEventListener("click", () => {
  review++;
  unattempt--;

  reviewText.textContent = `Marked for review: ${review}`;
  unattemptText.textContent = `Unattempted: ${unattempt}`;

  document.getElementById(quesCount).style.backgroundColor = "purple";

  setTimeout(() => {
    newques();
  }, 500);
});

// END QUIZ
end.addEventListener("click", () => {
  addScore(username, score);
  window.location.href = "end.html";
});

// TIMER
let time = 5 * 60;
const timerElement = document.getElementById("timer");

function updateTimer() {
  const min = Math.floor(time / 60);
  const sec = time % 60;
  timerElement.textContent = `Time Left: 0${min}:${sec < 10 ? "0" + sec : sec}`;
  if (time <= 30) timerElement.style.color = "red";
}

setInterval(() => {
  if (time > 0) {
    time--;
    updateTimer();
  } else {
    end.click();
  }
}, 1000);

// ALERT BEFORE 30s
setTimeout(() => {
  alert("Hurry Up!\nTest is going to end soon.");
}, 270000);

// NAVIGATION & STATUS PANEL
const container = document.getElementById("container");
const statbutton = document.getElementById("statbutton");
const status1 = document.getElementById("status1");
const icon = document.getElementById("icon");

statbutton.addEventListener("click", () => {
  status1.style.display = "flex";
  container.style.display = "grid";
  icon.style.display = "block";
  statbutton.style.display = "none";
});

icon.addEventListener("click", () => {
  status1.style.display = "none";
  container.style.display = "block";
  icon.style.display = "none";
  statbutton.style.display = "block";
});

// NAVIGATION CIRCLES
const progress = document.getElementById("progress");
for (let i = 1; i <= 12; i++) {
  const span = document.createElement("span");
  span.className = "span";
  span.id = i;
  span.textContent = i;
  progress.appendChild(span);
}

document.querySelectorAll(".span").forEach((span, index) => {
  span.addEventListener("click", () => {
    if (index < questions.length) {
      quesCount = index;
      newques();
    }
  });
});

// START & FETCH QUESTIONS
document.addEventListener("DOMContentLoaded", () => {
  document.getElementById("loader").style.display = "flex";

  fetch("https://opentdb.com/api.php?amount=20&category=21&difficulty=medium&type=multiple")
    .then(response => response.json())
    .then(data => {
      questions = data.results.map((q, i) => {
        const formattedQ = {
          id: i + 1,
          question: q.question,
          answer: Math.floor(Math.random() * 4) + 1
        };

        const choices = [...q.incorrect_answers];
        choices.splice(formattedQ.answer - 1, 0, q.correct_answer);

        for (let j = 0; j < 4; j++) {
          formattedQ["choosen" + (j + 1)] = choices[j];
        }

        return formattedQ;
      });

      document.getElementById("loader").style.display = "none";
      start();
    })
    .catch(err => console.error("Error fetching questions:", err));
});

// START QUIZ
function start() {
  score = 0;
  quesCount = 0;
  newques();
}

// DISPLAY NEW QUESTION
function newques() {
  if (quesCount >= maxques) {
    end.click();
    return;
  }

  currques = questions[quesCount];
  const qElement = document.querySelector("h2");
  qElement.textContent = `${quesCount + 1}. ${currques.question}`;
  qElement.id = quesCount + 1;

  choices.forEach((choice, index) => {
    const label = choice.querySelector(".option");
    const val = choice.querySelector(".value");

    label.textContent = String.fromCharCode(65 + index); // A, B, C, D
    val.textContent = currques["choosen" + (index + 1)];
    val.dataset.number = index + 1;
    choice.style.backgroundColor = "#efe9e9";
  });

  selchoice = null;
  accans = true;

  quesCount++;
  if (quesCount === maxques) {
    next.style.display = "none";
  }
}

// HIGH SCORE STORAGE
function save(highScores) {
  localStorage.setItem("highScores", JSON.stringify(highScores));
}

function addScore(username, score) {
  const highScores = JSON.parse(localStorage.getItem("highScores")) || [];
  highScores.push({ name: username, score: score });
  highScores.sort((a, b) => b.score - a.score);
  highScores.splice(3);
  save(highScores);
}
