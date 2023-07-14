let correct = 0;
let bad = 0;
let trainingSet;
const container = document.querySelector("#training-container");

function GetArrayOfRangedNumber(mininclusive, maxexclusive) {
  let r = [];
  for (let i = mininclusive; i < maxexclusive; i++) {
    r.push(i);
  }
  return r;
}

function GenerateTraining(dataset, length, errset = [], errPower = 5) {
  if (dataset.symbol === undefined) {
    return (container.innerHTML =
      "An error occured while fetching the symbols");
  }
  let shuffleList = GetArrayOfRangedNumber(0, dataset.symbol.length);
  if (errset.length > 0) {
    for (let i = 0; i < errPower; i++) {
      shuffleList.push(errset);
    }
  }

  let list = [];
  let symbolContainerList = [];

  for (let i = 0; i < length; i++) {
    let c = Math.floor(Math.random() * shuffleList.length);

    list.push(shuffleList[c]);
    symbolContainerList.push(InstanciateSymbol(dataset.symbol[shuffleList[c]]));

    shuffleList.splice(c, 1);

    if (shuffleList.length < 1) {
      shuffleList = GetArrayOfRangedNumber(0, dataset.symbol.length);
    }
  }

  let trainingSet = [dataset, list, symbolContainerList, 0];

  return trainingSet;
}

function StartListening(trainingSet) {
  document.getElementById("training-input").trainingSet = trainingSet;
  document.getElementById("training-input").errList = [];
  document
    .getElementById("training-input")
    .addEventListener("input", TrainingListener);
}

function UpdateCounter() {
  document.getElementById("correct-counter").innerHTML = `Correct : ${correct}`;
  document.getElementById("bad-counter").innerHTML = `Bad : ${bad}`;
}

function TrainingListener(evt) {
  let trainingSet = document.getElementById("training-input").trainingSet;
  let errList = document.getElementById("training-input").errList;
  let value = evt.srcElement.value;
  let currentIndex = trainingSet[1][trainingSet[3]];
  let symbolList = trainingSet[0].symbol;
  let romajiList = trainingSet[0].romaji;

  if (evt.data === " ") {
    if (value.slice(0, -1) === romajiList[currentIndex]) {
      setSymbolCorrectness(trainingSet[2][trainingSet[3]], true);
      correct++;
    } else {
      setSymbolCorrectness(trainingSet[2][trainingSet[3]], false);
      errList.push(currentIndex);
      bad++;
    }
    evt.srcElement.value = "";
    trainingSet[3]++;

    document.getElementById("last-symbol").innerHTML = symbolList[currentIndex];
    document.getElementById("last-transcription").innerHTML =
      romajiList[currentIndex];

    UpdateCounter();
  }

  if (trainingSet[3] >= trainingSet[2].length) {
    document
      .getElementById("training-input")
      .removeEventListener("input", TrainingListener);
    clearAndLoadData();
  }
}

function ClearTrainingContext(symbolContainerList) {
  for (symbol of symbolContainerList) {
    symbol.remove();
  }
}

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

function InstanciateSymbol(symbol) {
  let container = document.getElementById("training-container");
  let symbolContainer = document.createElement("div");
  let symbolElement = document.createElement("h1");

  symbolContainer.classList.add("training-symbol-container");
  symbolElement.classList.add("training-symbol");
  symbolElement.appendChild(document.createTextNode(symbol));
  symbolContainer.appendChild(symbolElement);
  container.appendChild(symbolContainer);

  return symbolContainer;
}

function setSymbolCorrectness(symbolContainer, correctness) {
  return correctness
    ? symbolContainer.classList.add("correct-answer")
    : symbolContainer.classList.add("wrong-answer");
}

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
