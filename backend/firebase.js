const admin = require("firebase-admin");

// Verificar variable
if (!process.env.FIREBASE_SERVICE_ACCOUNT) {
  throw new Error("Falta FIREBASE_SERVICE_ACCOUNT");
}

// Convertir JSON string a objeto
const serviceAccount = JSON.parse(
  process.env.FIREBASE_SERVICE_ACCOUNT
);

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}

const db = admin.firestore();
const auth = admin.auth();

module.exports = {
  db,
  auth,
};