var df = require("distfitjs/lib/distfit");
var ss = require("simple-statistics");
var sqlite = require("sqlite-sync");

var scoutItems = {
  rb: 5,
  g: 8,
  a: 5,
  sg: 5,
  fs: 0.5,
  ff: 0.8,
  fd: 1.2,
  ft: 3,
  dd: 3,
  dp: 7,
  gc: -5,
  cv: -5,
  ca: -2,
  gs: -2,
  pp: -4,
  fc: -0.5,
  i: -0.5,
  pe: -0.3
};

var tacticItems = {
  t1: 343,
  t2: 352,
  t3: 433,
  t4: 442,
  t5: 451,
  t6: 532,
  t7: 541
};

//Connecting
sqlite.connect("cartola.db");
recommendedPlayersForTeam("Corinthians", 3);

function evaluateWinnerTactics() {
  // Return which cartola squad tactics returns the highly probable, high scoring players
  Object.keys(tacticItems).forEach(tc => {
    evaluateTactics(tc).score;
  });
}

function evaluateTactics(tactic) {
  // Return the squad score with the tactic selected, using the highest probable, highest scoring players
}

function recommendedPlayersForTeam(team, quantity) {
  // Return the players from estimateScoutItemsForTeam(team), that are highly probable
  // of high scores
  var teamData = estimateScoutItemsForTeam(team);
  // console.log(teamData.nome + " | " + teamData.next.score);
  var teamData = teamData.sort(function(a, b) {
    if (a.next.probability < b.next.probability) {
      return 1;
    }
    if (a.next.probability > b.next.probability) {
      return -1;
    }
    return 0;
  });

  var teamData = teamData.filter(i => ((i.next.probability !== 1) ));

  teamData.forEach(i => {
    console.log(
      (i.next.probability * 100).toFixed(22) +
        " | " +
        i.next.score.toFixed(22) +
        " | " +
        i.nome
    );
  });
}

function estimateScoutItemsForTeam(team) {
  //TODO: It's repeating over and over by the length of all the players in the championship
  var uniquePlayersSql =
    "select nome, clube, count(nome) from scouts where clube = '" +
    team +
    "' AND nome not like '%(TEC)' AND rodada = 10 group by nome;";
  var uniquePlayersData = sqlite.run(uniquePlayersSql);

  Object.keys(scoutItems).forEach(k => {
    uniquePlayersData = estimateScoutItemForPlayers(k, uniquePlayersData);
  });

  uniquePlayersData = calculateProbableScore(uniquePlayersData);

  // uniquePlayersData.forEach(i => {
  //   console.log(i.next.score.toFixed(8) + " || " + i.next.probability.toFixed(8) + ' || ' + i.nome );
  // });
  return uniquePlayersData;
}

function calculateProbableScore(finePlayersData) {
  for (var i = 0; i < finePlayersData.length; i++) {
    var nextScore = 0,
      nextScoreProbability = 1;
    Object.keys(scoutItems).forEach(k => {
      nextScore +=
        zeroIfNullOrNaNOrUndefined(finePlayersData[i]["prob" + k]) *
        scoutItems[k];
      nextScoreProbability *= oneIfNullOrNaNOrUndefined(
        finePlayersData[i]["prob" + k]
      );
    });
    finePlayersData[i].next = {
      score: nextScore,
      probability: nextScoreProbability
    };
  }
  return finePlayersData;
}

function estimateScoutItemForAllTeams() {
  var fulldata = [];
  var uniqueTeamsSql = "select distinct clube from scouts where ano = 2018;";
  var uniqueTeamsData = sqlite.run(uniqueTeamsSql);

  for (var i = 0; i < uniqueTeamsData.length; i++) {
    tempdata = estimateScoutItemsForTeam(uniqueTeamsData[i].clube);
    // console.log("======================================");
    // console.log(uniqueTeamsData[i].clube + " || Jogadores: " + tempdata.length);
    // console.log("======================================");
    fulldata += tempdata;
  }
  console.log(fulldata.length);
}

function estimateScoutItemForPlayers(sItem, playersData) {
  for (var i = 0; i < playersData.length; i++) {
    var playerScoutsSql =
      "select " +
      sItem +
      " from scouts where nome ='" +
      playersData[i].nome +
      "' and " +
      sItem +
      " is not null;";
    var data = convertObject2Array(sqlite.run(playerScoutsSql), sItem);
    playersData[i][sItem + "dataPlusStats"] = extractDescriptiveStats(data);
    playersData[i]["prob" + sItem] = getMaxProbableValue(
      calculateProbabilitiesForRange(playersData[i][sItem + "dataPlusStats"])
    );
  }
  return playersData;
}

function getMaxProbableValue(probsData) {
  var maxProb = undefined;
  if (probsData.length !== 0) {
    maxProb = probsData.reduce(function(prev, current) {
      return prev.nextProbability > current.nextProbability ? prev : current;
    });
  }
  return maxProb;
}

function calculateProbabilitiesForRange(dataAndStats) {
  var poisson = new df.Poisson();
  poisson.fitData(dataAndStats.data);
  var probs = new Array();
  if (dataAndStats.count != 0) {
    for (var j = dataAndStats.min - 10; j < dataAndStats.max + 10; j++) {
      probs.push({ value: j, nextProbability: poisson.pmf(j) });
    }
  }
  return probs;
}

function extractDescriptiveStats(valueArray) {
  if (valueArray.length === 0) {
    return {
      data: valueArray,
      max: null,
      min: null,
      count: valueArray.length,
      unique: null
    };
  } else {
    return {
      data: valueArray,
      max: ss.max(valueArray),
      min: ss.min(valueArray),
      count: valueArray.length,
      unique: new Set(valueArray)
    };
  }
}

function convertObject2Array(valueObjects, columnName) {
  var valueArray = new Array();
  for (var i = 0; i < valueObjects.length; i++) {
    valueArray.push(valueObjects[i][columnName]);
  }
  return valueArray;
}

function zeroIfNullOrNaNOrUndefined(data) {
  if (data === null || data === NaN || data === undefined) {
    return 0;
  } else {
    return data.value;
  }
}
function oneIfNullOrNaNOrUndefined(data) {
  if (data === null || data === NaN || data === undefined) {
    return 1;
  } else {
    return data.nextProbability;
  }
}

function evaluateForecastPerformance() {}
