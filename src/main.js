import './style.css';

const app = document.querySelector('#app');

const state = {
  currentPage: 'directions',
  answers: [],
  questions: [],
  categories: []
};

async function loadQuestions() {
  const response = await fetch('/src/questions.txt');
  const text = await response.text();
  state.questions = text.split('\n').filter(Boolean);
}

async function loadCategories() {
  const response = await fetch('/src/categories.json');
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
        <h2 class="romans-header">in Romans 12</h2>
        <h3>DIRECTIONS</h3>
        <p>This is not a test, so there are no wrong answers. The Spiritual Gifts Survey consists of 80 statements. Some
items reflect concrete actions, other items are descriptive traits, and still others are statements of belief.</p>
        <ul>
          <li>Select the one response you feel best characterizes yourself and place that number in the blank
provided. Record your answer in the blank beside each item.</li>
          <li>Do not spend too much time on any one item. Remember, it is not a test. Usually your immediate
response is best.</li>
          <li>Please give an answer for each item. Do not skip any items.</li>
          <li>Do not ask others how they are answering or how they think you should answer</li>
          <li>Work at your own pace.</li>
        </ul>
        <p>Your response choices are:</p>
        <div class="ranking">
          <p>5—Highly characteristic of me/definitely true for me</p>
          <p>5—Highly characteristic of me/definitely true for me</p>
          <p>3—Frequently characteristic of me/true for me–about 50 percent of the time </p>
          <p>2—Occasionally characteristic of me/true for me–about 25 percent of the time </p>
          <p>1—Not at all characteristic of me/definitely untrue for me</p>
        </div>
        <button id="start">Start</button>
      </div>
    `;
    document.querySelector('#start').addEventListener('click', () => {
      state.currentPage = 'question1';
      render();
    });
  } else if (state.currentPage.startsWith('question')) {
    const questionIndex = parseInt(state.currentPage.replace('question', '')) - 1;
    const answerLabels = {
      1: 'Not at all',
      2: 'Occasionally',
      3: 'Frequently',
      4: 'Highly',
      5: 'Definitely'
    }
    app.innerHTML = `
      <div class="question">
        <h3>${questionIndex+1}. ${state.questions[questionIndex]}</h2>
        <div class="options">
          ${[1, 2, 3, 4, 5]
            .map(
              (num) => `
                <label style="text-align: center;">
                  ${answerLabels[num]}
                  <input style="display: block;" type="radio" name="q${questionIndex}" value="${num}" ${
                    state.answers[questionIndex] === num ? 'checked' : ''
                  } />
                </label>
              `
            )
            .join('')}
        </div>
        <div class="navigation">
          ${questionIndex > 0 ? '<button id="prev">Previous</button>' : ''}
          <button id="next">${
            questionIndex < state.questions.length - 1 ? 'Next' : 'Submit'
          }</button>
        </div>
      </div>
    `;

    document.querySelectorAll(`input[name="q${questionIndex}"]`).forEach((input) => {
      input.addEventListener('change', (e) => {
        state.answers[questionIndex] = parseInt(e.target.value);
      });
    });

    if (questionIndex > 0) {
      document.querySelector('#prev').addEventListener('click', () => {
        state.currentPage = `question${questionIndex}`;
        render();
      });
    }

    document.querySelector('#next').addEventListener('click', () => {
      if (questionIndex < state.questions.length - 1) {
        state.currentPage = `question${questionIndex + 2}`;
      } else {
        state.currentPage = 'results';
      }
      render();
    });
  } else if (state.currentPage === 'results') {
    const results = state.categories.map(category => {
      const score = category.questions.reduce((sum, qIndex) => sum + (state.answers[qIndex - 1] || 0), 0);
      return { category: category.category, score };
    });

    app.innerHTML = `
      <div class="results">
        <h1 style="text-align: left;">GRAPHING YOUR PROFILE</h1>
        <div class="chart">
          ${results
            .map(
              (result) => `
                <div class="bar-container">
                  <span class="label">${result.category}</span>
                  <div class="bar" style="width: ${result.score * 20}px;">${result.score}</div>
                </div>
              `
            )
            .join('')}
        </div>
        <button id="restart">Restart</button>
      </div>
    `;

    document.querySelector('#restart').addEventListener('click', () => {
      state.currentPage = 'directions';
      state.answers = [];
      render();
    });
  }
}

initialize();
