import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";

const firebaseConfig = {
  apiKey: "AIzaSyDnn-6MJg1X1CLfxRt2MHtGQ_uf2-v3w_Y",
  authDomain: "smart-leads-dashboard.firebaseapp.com",
  projectId: "smart-leads-dashboard",
  storageBucket: "smart-leads-dashboard.firebasestorage.app",
  messagingSenderId: "299611798656",
  appId: "1:299611798656:web:baa0314c8ed54f36fc3a65",
  measurementId: "G-TS9X6XE969",
};

const app = initializeApp(firebaseConfig);

let analytics: ReturnType<typeof getAnalytics> | undefined;
try {
  if (typeof window !== "undefined") {
    analytics = getAnalytics(app);
  }
} catch (e) {
  analytics = undefined;
}

export { app, analytics };
