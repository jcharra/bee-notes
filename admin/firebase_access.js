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

var ref = db.ref("/users/");
ref.once("value", function (snapshot) {
  console.log(snapshot.val());
});
