(function(){const r=document.createElement("link").relList;if(r&&r.supports&&r.supports("modulepreload"))return;for(const s of document.querySelectorAll('link[rel="modulepreload"]'))o(s);new MutationObserver(s=>{for(const i of s)if(i.type==="childList")for(const c of i.addedNodes)c.tagName==="LINK"&&c.rel==="modulepreload"&&o(c)}).observe(document,{childList:!0,subtree:!0});function n(s){const i={};return s.integrity&&(i.integrity=s.integrity),s.referrerPolicy&&(i.referrerPolicy=s.referrerPolicy),s.crossOrigin==="use-credentials"?i.credentials="include":s.crossOrigin==="anonymous"?i.credentials="omit":i.credentials="same-origin",i}function o(s){if(s.ep)return;s.ep=!0;const i=n(s);fetch(s.href,i)}})();const l=document.querySelector("#app"),e={currentPage:"directions",answers:[],questions:[],categories:[]};async function u(){const r=await(await fetch("/questions.txt")).text();e.questions=r.split(`
`).filter(Boolean)}async function d(){const t=await fetch("/categories.json");e.categories=await t.json()}async function p(){await u(),await d(),a()}function a(){if(e.currentPage==="directions")l.innerHTML=`
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
    `,document.querySelector("#start").addEventListener("click",()=>{e.currentPage="question1",a()});else if(e.currentPage.startsWith("question")){const t=parseInt(e.currentPage.replace("question",""))-1,r={1:"Not at all",2:"Occasionally",3:"Frequently",4:"Highly",5:"Definitely"};l.innerHTML=`
      <div class="question">
        <h3>${t+1}. ${e.questions[t]}</h2>
        <div class="options">
          ${[1,2,3,4,5].map(n=>`
                <label style="text-align: center;">
                  ${r[n]}
                  <input style="display: block;" type="radio" name="q${t}" value="${n}" ${e.answers[t]===n?"checked":""} />
                </label>
              `).join("")}
        </div>
        <div class="navigation">
          ${t>0?'<button id="prev">Previous</button>':""}
          <button id="next">${t<e.questions.length-1?"Next":"Submit"}</button>
        </div>
      </div>
    `,document.querySelectorAll(`input[name="q${t}"]`).forEach(n=>{n.addEventListener("change",o=>{e.answers[t]=parseInt(o.target.value)})}),t>0&&document.querySelector("#prev").addEventListener("click",()=>{e.currentPage=`question${t}`,a()}),document.querySelector("#next").addEventListener("click",()=>{t<e.questions.length-1?e.currentPage=`question${t+2}`:e.currentPage="results",a()})}else if(e.currentPage==="results"){const t=e.categories.map(r=>{const n=r.questions.reduce((o,s)=>o+(e.answers[s-1]||0),0);return{category:r.category,score:n}});l.innerHTML=`
      <div class="results">
        <h1 style="text-align: left;">GRAPHING YOUR PROFILE</h1>
        <div class="chart">
          ${t.map(r=>`
                <div class="bar-container">
                  <span class="label">${r.category}</span>
                  <div class="bar" style="width: ${r.score*20}px;">${r.score}</div>
                </div>
              `).join("")}
        </div>
        <button id="restart">Restart</button>
      </div>
    `,document.querySelector("#restart").addEventListener("click",()=>{e.currentPage="directions",e.answers=[],a()})}}p();
