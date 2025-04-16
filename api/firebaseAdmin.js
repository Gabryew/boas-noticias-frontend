import admin from "firebase-admin";

let serviceAccount = process.env.FIREBASE_SERVICE_ACCOUNT;

if (!serviceAccount) {
  throw new Error("FIREBASE_SERVICE_ACCOUNT não está definido.");
}

const parsedAccount = JSON.parse(serviceAccount);

// Corrigir as quebras de linha da chave privada
parsedAccount.private_key = parsedAccount.private_key.replace(/\\n/g, '\n');

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(parsedAccount),
  });
  console.log("Firebase Admin SDK inicializado com sucesso.");
}

const db = admin.firestore();

export { db };
