import { ApolloClient, ApolloProvider, InMemoryCache } from "@apollo/client";
import React from "react";
import { ThemeSwitcherProvider } from "react-css-theme-switcher";
import { BrowserRouter } from "react-router-dom";
import { getFirestore } from 'firebase/firestore';
import { FirebaseAppProvider, FirestoreProvider, useFirebaseApp } from 'reactfire';
import firebaseConfig from "./api/firebaseConfig";
import ReactDOM from "react-dom";
import App from "./App";
import 'firebase/firestore';
import "./index.css";

const themes = {
  dark: `${process.env.PUBLIC_URL}/dark-theme.css`,
  light: `${process.env.PUBLIC_URL}/light-theme.css`,
};

const prevTheme = window.localStorage.getItem("theme");

const subgraphUri = "http://localhost:8000/subgraphs/name/scaffold-eth/your-contract";

const client = new ApolloClient({
  uri: subgraphUri,
  cache: new InMemoryCache(),
});

const AppWrapper = () => {
  const firestoreInstance = getFirestore(useFirebaseApp());
  return (
    <FirestoreProvider sdk={firestoreInstance}>
      <ApolloProvider client={client}>
      <ThemeSwitcherProvider themeMap={themes} defaultTheme={prevTheme || "light"}>
        <BrowserRouter>
          <App subgraphUri={subgraphUri} />
        </BrowserRouter>
      </ThemeSwitcherProvider>
    </ApolloProvider>
    </FirestoreProvider>
  );
}

ReactDOM.render(
  <FirebaseAppProvider firebaseConfig={ firebaseConfig }>
    <AppWrapper />
  </FirebaseAppProvider>,
  document.getElementById("root"),
);
