import { getApp, getApps, initializeApp } from "firebase/app";
import { publicEnv } from "@/_lib/env";

const firebaseConfig = {
  apiKey: publicEnv.firebase.apiKey,
  authDomain: publicEnv.firebase.authDomain,
  projectId: publicEnv.firebase.projectId,
  storageBucket: publicEnv.firebase.storageBucket,
  messagingSenderId: publicEnv.firebase.messagingSenderId,
  appId: publicEnv.firebase.appId
};

export const firebaseApp = getApps().length
  ? getApp()
  : initializeApp(firebaseConfig);
