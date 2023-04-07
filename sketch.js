const ids = ['box', 'play', 'guess', 'check', 'message', 'min', 'minslider', 'max', 'maxslider'];
let els;
let synth;

let state = {
  endOfRound: false,
  freq: 100,
  guess: null,
  error: null,
  score: 0
};

function randomizeFreq() {
  const [min, max] = getFreqRangeValues();
  const exponent = Math.random() * (max - min) + min;
  state.freq = Math.floor(2 ** exponent);
}

function getFreqRangeValues() {
  return [parseInt(els.minslider.value), parseInt(els.maxslider.value)];
}

function setup() {
  els = Object.fromEntries(ids.map(id => [id, document.getElementById(id)]));
  state.endOfRound = false;
  randomizeFreq();
  renderState();


  els.play.onclick = () => {play(state.freq)};
  els.check.onclick = check;
  els.guess.oninput = updateGuess;
  els.minslider.oninput = updateRange;
  els.maxslider.oninput = updateRange;
  document.onkeydown = ({key}) => {if (key == " ") play(state.freq)};

  els.guess.onkeydown = ({key}) => {
    if (key == "Enter") {
      if (state.endOfRound) {
        newRound();
      } else {
        check();
      }
    } else if (key == " ") {
      play(state.freq);
    }
  }
}

function play(freq) {
  if (!synth) {
    synth = new p5.MonoSynth();
    synth.setADSR(0.01, 0.5, 0);
  }
  console.log(freq)
  synth.play(freq, 0.5, 0, 0.1);
}

function check() {
  if (state.endOfRound) {
    newRound();
  } else {
    if (state.guess) {
      if (state.guess < 20 || state.guess > 40000) {
        alert("Please pick a number between 20 and 40,000 hz");
      } else {
        play(state.guess);
        state.error = Math.round(Math.log2(state.guess/state.freq) * 12);
        state.score += Math.floor(10 / (Math.abs(state.error) + 1));
        state.endOfRound = !state.endOfRound;
        renderState();
      }
    }
  }
}

function updateGuess() {
  state.guess = els.guess.value.replace(/\D/g,'') || null;
  els.guess.value = parseInt(els.guess.value) || "";
  renderState();
}

function updateRange() {
  state.min = els.minslider.value;
  state.max = els.maxslider.value;
  renderState();
}

function newRound() {
  randomizeFreq();
  state.endOfRound = !state.endOfRound;
  state.guess = null;
  play(state.freq);
  renderState();
}

function draw() {
}

function renderState() {
  els.message.style.display = state.endOfRound ? "unset" : "none";
  if (state.endOfRound) {
    const actualFreqMessage = "Actual Frequency: " + state.freq + " Hz";
    const errorMessage = state.error == 0 ? (
      "Perfect!"
    ) : (
      `${state.error} semitone${Math.abs(state.error) == 1 ? "" : "s"} too ${state.error > 0 ? "high" : "low"}.`
    );
    const scoreMessage = `Total Score: ${state.score}`;
    els.message.innerHTML = `${actualFreqMessage}<br>${errorMessage}<br>${scoreMessage}`;
  } else {

  }
  els.guess.value = state.guess
  els.check.style.display = state.guess ? "unset" : "none";
  const [min, max] = getFreqRangeValues();
  const minFreq = 2 ** min
  const maxFreq = 2 ** max
  els.min.innerText = minFreq + " hz";
  els.max.innerText = maxFreq + " hz";
  els.check.innerText = state.endOfRound ? "New Round" : "Check";
}