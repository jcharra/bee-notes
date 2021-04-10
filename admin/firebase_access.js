var admin = require("firebase-admin");

var serviceAccount = require("/Users/johannescharra/Wichtiges/beenotes-firebase.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://beetracker-6865b.firebaseio.com",
  databaseAuthVariableOverride: {
    uid: "readonly-admin",
  },
});

var db = admin.database();
console.log("Established");

var ref = db.ref("/users");

const populationStats = {};
const journalEntries = {};

const printStats = (stats) => {
  for (let i = 1; i < 100; i++) {
    if (stats[i]) {
      console.log(`${i} ${i === 1 ? "Volk" : "Völker"}: ${stats[i]} User`);
    }
  }
};

const dumpData = (snapshot) => {
  snapshot.forEach((child) => {
    const user = child.val();

    const swarms = user.swarms ? Object.entries(user.swarms) : [];
    console.log("Test", Object.entries(swarms[0]).activityStatus);
    populationStats[swarms.length] = populationStats[swarms.length]
      ? populationStats[swarms.length] + 1
      : 1;
  });

  printStats(populationStats);
};

ref.once("value").then(dumpData);
