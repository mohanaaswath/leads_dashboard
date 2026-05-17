import fs from "fs";
import path from "path";
import admin from "firebase-admin";
import dotenv from "dotenv";

dotenv.config();

const serviceAccountPath =
  process.env.FIREBASE_SERVICE_ACCOUNT_PATH ||
  path.resolve(
    process.cwd(),
    "../smart-leads-dashboard-firebase-adminsdk-fbsvc-0db5936430.json",
  );

const loadServiceAccount = (): admin.ServiceAccount => {
  if (fs.existsSync(serviceAccountPath)) {
    return JSON.parse(
      fs.readFileSync(serviceAccountPath, "utf8"),
    ) as admin.ServiceAccount;
  }

  const projectId = process.env.FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n");

  if (!projectId || !clientEmail || !privateKey) {
    throw new Error(
      "Firebase credentials are not configured. Set FIREBASE_SERVICE_ACCOUNT_PATH or FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, and FIREBASE_PRIVATE_KEY.",
    );
  }

  return { projectId, clientEmail, privateKey };
};

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(loadServiceAccount()),
  });
}

export const db = admin.firestore();
