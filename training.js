let correct = 0;
let bad = 0;
let trainingSet;
const container = document.querySelector("#training-container");

function GetArrayOfRangedNumber(mininclusive, maxexclusive) {
  const r = [];
  for (let i = mininclusive; i < maxexclusive; i++) {
    r.push(i);
  }
  return r;
}
// Generates the trainingDataSet

/*
 *
 * [data, list, symbols, index]
 *
 */
function GenerateTraining(dataset, length) {
  if (dataset.symbol === undefined) {
    return (container.innerHTML =
      "An error occured while fetching the symbols");
  }
  let shuffleList = GetArrayOfRangedNumber(0, dataset.symbol.length);

  const list = [];
  const symbolContainerList = [];

  for (let i = 0; i < length; i++) {
    let c = Math.floor(Math.random() * shuffleList.length);

    list.push(shuffleList[c]);
    symbolContainerList.push(InstanciateSymbol(dataset.symbol[shuffleList[c]]));

    shuffleList.splice(c, 1);

    if (shuffleList.length < 1) {
      shuffleList = GetArrayOfRangedNumber(0, dataset.symbol.length);
    }
  }

  const trainingSet = [dataset, list, symbolContainerList, 0];

  return trainingSet;
}
// appends trainingSet to the input and add the TrainingListener function as the event
function StartListening(trainingSet) {
  document.querySelector("#training-input").trainingSet = trainingSet;
  document
    .querySelector("#training-input")
    .addEventListener("input", TrainingListener);
}
// is called anytime an input is entered and checks with the help of other functions if it's right or not
function TrainingListener(evt) {
  const trainingSet = document.querySelector("#training-input").trainingSet;
  const value = evt.srcElement.value;
  const currentIndex = trainingSet[3];
  const indexOfCurrentSymbol = trainingSet[2][currentIndex];
  const symbolList = trainingSet[0].symbol;
  const romajiList = trainingSet[0].romaji;

  if (evt.data === " ") {
    if (value === romajiList[currentIndex]) {
      setSymbolCorrectness(indexOfCurrentSymbol, true);
      correct++;
    } else {
      setSymbolCorrectness(indexOfCurrentSymbol, false);
      bad++;
    }
    evt.srcElement.value = "";
    trainingSet[3]++;
    updateAnswerPanel(symbolList, romajiList, currentIndex);
    UpdateCounter();
  }

  // currentIndex >= trainingSet[2] replace everything and reload new test
  if (trainingSet[3] >= trainingSet[2].length) {
    document
      .querySelector("#training-input")
      .removeEventListener("input", TrainingListener);
    clearAndLoadData();
  }
}

// updates panel on the left !
function updateAnswerPanel(symbolList, romajiList, currentIndex) {
  document.getElementById("last-symbol").innerHTML = symbolList[currentIndex];
  document.getElementById("last-transcription").innerHTML =
    romajiList[currentIndex];
}

// update counter of errors / success
function UpdateCounter() {
  document.querySelector("#correct-counter").innerHTML = `Correct : ${correct}`;
  document.querySelector("#bad-counter").innerHTML = `Bad : ${bad}`;
}

// clears all the div and replaces them with new ones
function ClearTrainingContext(symbolContainerList) {
  for (symbol of symbolContainerList) {
    symbol.remove();
  }
}

// loads the data needed for trying from a JSON file /content/nameofthejson.json
async function LoadTrainingData(type) {
  let json = null;
  try {
    const res = await fetch(`content/${type}.json`);
    const data = await res.json();
    json = data;
  } catch (e) {
    container.innerHTML = e.message;
  }
  return json;
}

// creates the div for each symbol we load
function InstanciateSymbol(symbol) {
  const container = document.getElementById("training-container");
  const symbolContainer = document.createElement("div");
  const symbolElement = document.createElement("h1");

  symbolContainer.classList.add("training-symbol-container");
  symbolElement.classList.add("training-symbol");
  symbolElement.appendChild(document.createTextNode(symbol));
  symbolContainer.appendChild(symbolElement);
  container.appendChild(symbolContainer);

  return symbolContainer;
}

// checks if the symbol and the input are the same if true increases success counter if not increases fail counter
function setSymbolCorrectness(symbolContainer, correctness) {
  return correctness
    ? symbolContainer.classList.add("correct-answer")
    : symbolContainer.classList.add("wrong-answer");
}

// clears and load new data by calling clearTrainingContext, LoadTrainingData, GenerateTraining and StartListening
async function clearAndLoadData() {
  container.innerHTML = "Loading symbols...";
  const trainingData = await LoadTrainingData("hiragana");
  if (trainingSet !== undefined) {
    ClearTrainingContext(trainingSet[2]);
  }
  container.innerHTML = "";
  trainingSet = GenerateTraining(trainingData, 48);
  StartListening(trainingSet);
}
