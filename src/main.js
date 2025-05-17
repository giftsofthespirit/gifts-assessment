import './style.css';
import Chart from 'chart.js/auto';

const app = document.querySelector('#app');

const appHeight = () => document.documentElement.style.setProperty('--app-height', `${window.innerHeight}px`)
window.addEventListener('resize', appHeight)
appHeight()

const state = {
  currentPage: 'directions',
  answers: [],
  questions: [],
  categories: []
};

async function loadQuestions() {
  const response = await fetch('/gifts-assessment/questions.txt');
  const text = await response.text();
  state.questions = text.split('\n').filter(Boolean);
}

async function loadCategories() {
  const response = await fetch('/gifts-assessment/categories.json');
  state.categories = await response.json();
}

async function initialize() {
  await loadQuestions();
  await loadCategories();
  render();
}

function render() {
  if (state.currentPage === 'directions') {
    app.innerHTML = `
      <div class="directions">
        <h1>Gifts of the Spirit</h1>
        <h3>DIRECTIONS</h3>
        <p>This is not a test, so there are no wrong answers. The Spiritual Gifts Survey consists of 80 statements. Some
items reflect concrete actions, other items are descriptive traits, and still others are statements of belief.</p>
        <ul>
          <li>Select the one response you feel best characterizes yourself.</li>
          <li>Do not spend too much time on any one item. Remember, it is not a test. Usually your immediate response is best.</li>
          <li>Please give an answer for each item. Do not skip any items.</li>
          <li>Do not ask others how they are answering or how they think you should answer.</li>
          <li>Work at your own pace.</li>
        </ul>
        <p>Your response choices are:</p>
        <div style="text-indent: 20px;">
          <p>5—Highly characteristic of me/definitely true for me</p>
          <p>4—Highly characteristic of me</p>
          <p>3—Frequently characteristic of me/true for me–about 50 percent of the time </p>
          <p>2—Occasionally characteristic of me/true for me–about 25 percent of the time </p>
          <p>1—Not at all characteristic of me/definitely untrue for me</p>
        </div>
        <button class="nav-button" id="start">Start</button>
      </div>
    `;
    document.querySelector('#start').addEventListener('click', () => {
      state.currentPage = 'question1';
      render();
    });
  } else if (state.currentPage.startsWith('question')) {
    const questionIndex = parseInt(state.currentPage.replace('question', '')) - 1;
    const answerLabels = {
      1: '1 - Not at all',
      2: '2 - Occasionally',
      3: '3 - Frequently',
      4: '4 - Highly',
      5: '5 - Definitely'
    };

    app.innerHTML = `
      <div class="question-page-container">
        <div class="progress-container">
          <p class="progress-text">Question ${questionIndex + 1} of ${state.questions.length}</p>
          <div class="progress-bar" style="width: ${(questionIndex + 1) / state.questions.length * 100}%;"></div>
        </div>
        <div class="question-container">
          <h3>${state.questions[questionIndex]}</h3>
        </div>
        <div class="question-button-container">
          <div class="buttons-container">
            ${[5, 4, 3, 2, 1]
              .map(
                (num) => `
                  <button class="answer-button" data-value="${num}">
                    ${answerLabels[num]}
                  </button>
                `
              )
              .join('')}
          </div>
        </div>
        <div class="navigation-container">
          <button class="nav-button" id="prev">Back</button>
        </div>
      </div>
    `;

    document.querySelectorAll('.answer-button').forEach((button) => {
      button.addEventListener('click', (e) => {
        state.answers[questionIndex] = parseInt(e.target.dataset.value);
        if (questionIndex < state.questions.length - 1) {
          state.currentPage = `question${questionIndex + 2}`;
        } else {
          state.currentPage = 'results';
        }
        render();
      });
    });

    document.querySelector('#prev').addEventListener('click', () => {
      if (questionIndex == 0) {
        state.currentPage = 'directions';
      } else {
      state.currentPage = `question${questionIndex}`;
      }
      render();
    });
  } else if (state.currentPage === 'results') {
    const results = state.categories.map(category => {
      const score = category.questions.reduce((sum, qIndex) => sum + (state.answers[qIndex - 1] || 0), 0);
      return { category: category.category, score };
    });

    const topCategories = results
      .sort((a, b) => b.score - a.score)
      .slice(0, 3)
      .map(result => result.category)
      .join(', ');

    app.innerHTML = `
      <div class="results">
        <h1 style="text-align: left;">GRAPHING YOUR PROFILE</h1>
        <p>The gifts I have begun to discover in my life are: <span class="em-text">${topCategories}</span></p>
        <div class="chart-container" style="height: 500px;">
          <canvas id="resultsChart"></canvas>
        </div>
        <p>Now that you have completed the assessment, thoughtfully answer the following statement:<p>
        <p>After prayer and worship, I am beginning to sense that God wants me to use my spiritual gifts to serve Christ’s body by:</p>
        <p>If you are not sure yet how God wants you to use your gifts to serve others, commit to prayer and worship, seeking wisdom and opportunities to use the gifts you have received from God. Ask Him to help you know how He has gifted you for service and how you can begin to use this gift in ministry to others.</p>
        <button class="nav-button" id="restart">Restart</button>
      </div>
    `;

    const ctx = document.getElementById('resultsChart').getContext('2d');
    new Chart(ctx, {
      type: 'bar',
      data: {
        labels: results.map(result => result.category),
        datasets: [{
          label: 'Scores',
          data: results.map(result => result.score),
          backgroundColor: 'rgb(45, 135, 27, 0.4)',
          borderColor: 'rgb(45, 135, 27)',
          borderWidth: 1,
          // barThickness: 40,
          // barPercentage: 0.5,
        }]
      },
      options: {
        maintainAspectRatio: false,
        responsive: true,
        indexAxis: 'y',
        scales: {
          x: {
            beginAtZero: true,
            ticks: {
                stepSize: 5
            }
          },
          y: {
            beginAtZero: true,
            display: true,
            autoSkip: false,
            ticks: {
              display: true,
              autoSkip: false,
            },
            grid: {
              display: false
            }
          },
        },
        plugins: {
            legend: {
                display: false
            }
        }
      }
    });

    document.querySelector('#restart').addEventListener('click', () => {
      state.currentPage = 'directions';
      state.answers = [];
      render();
    });
  }
}

initialize();
