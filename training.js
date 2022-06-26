var correct = 0;
var bad = 0;

function GetArrayOfRangedNumber(mininclusive, maxexclusive) {
    let r = [];
    for (let i = mininclusive; i < maxexclusive; i++) {
        r.push(i);
    }
    return r;
}

function GenerateTraining(dataset, length, errset = [], errPower = 5) {
    let shuffleList = GetArrayOfRangedNumber(0, dataset.symbol.length);

    if (errset.length > 0) {
        for (let i = 0; i < errPower; i++) {
            shuffleList.push(errset)
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

function StartListening(trainingSet, callback) {
    document.getElementById("training-input").trainingSet = trainingSet;
    document.getElementById("training-input").errList = [];
    document.getElementById("training-input").callback = callback;
    document.getElementById("training-input").addEventListener("input", TrainingListener);
}

function UpdateCounter() {
    document.getElementById("correct-counter").innerHTML = `Correct : ${correct}`;
    document.getElementById("bad-counter").innerHTML = `Bad : ${bad}`;
}

function TrainingListener(evt) {
    let trainingSet = document.getElementById("training-input").trainingSet;
    let errList = document.getElementById("training-input").errList;
    let value = evt.path[0].value;
    let currentIndex = trainingSet[1][trainingSet[3]];
    let symbolList = trainingSet[0].symbol;
    let romajiList = trainingSet[0].romaji;
    
    if (evt.data == " ") {
        if (value.slice(0, -1) == romajiList[currentIndex]) {
            SetSymbolToGreat(trainingSet[2][trainingSet[3]]);
            evt.path[0].value = "";
            correct++;
            trainingSet[3]++;
        }else {
            SetSymbolToBad(trainingSet[2][trainingSet[3]]);
            errList.push(currentIndex);
            evt.path[0].value = "";
            bad++;
            trainingSet[3]++;
        }
        
        document.getElementById("last-symbol").innerHTML = symbolList[currentIndex];
        document.getElementById("last-transcription").innerHTML = romajiList[currentIndex];

        UpdateCounter();
    }

    if (trainingSet[3] >= trainingSet[2].length) {
        document.getElementById("training-input").removeEventListener("input", TrainingListener);
        document.getElementById("training-input").callback(errList);
        document.getElementById("training-input").trainingSet = undefined;
        document.getElementById("training-input").errList = undefined;
        document.getElementById("training-input").callback = undefined;
    }
}

function ClearTrainingContext(symbolContainerList) {
    for(let i = 0; i < symbolContainerList.length; i++) {
        symbolContainerList[i].remove();
    }
}

function LoadTrainingData(type) {
    return new Promise((resolve, reject) => {
        $.get(`content/${type}.json`, (data) => {
            resolve(data);
        });
    });
}

function InstanciateSymbol(symbol) {
    let container = document.getElementById("training-container");
    let symbolContainer = document.createElement("div");
    let symbolElement = document.createElement("h1");

    symbolContainer.setAttribute("class", "training-symbol-container");
    symbolContainer.setAttribute("style", "border-bottom-color: var(--symbol-container-neutral-outline-color); background-color: var(--symbol-container-neutral-color);");

    symbolElement.setAttribute("class", "training-symbol");
    symbolElement.appendChild(document.createTextNode(symbol));

    symbolContainer.appendChild(symbolElement);
    
    container.appendChild(symbolContainer);

    return symbolContainer;
}

function SetSymbolToGreat(symbolContainer) {
    symbolContainer.setAttribute("style", "border-bottom-color: var(--symbol-container-great-outline-color); background-color: var(--symbol-container-great-color)");
}

function SetSymbolToBad(symbolContainer) {
    symbolContainer.setAttribute("style", "border-bottom-color: var(--symbol-container-bad-outline-color); background-color: var(--symbol-container-bad-color)");
}