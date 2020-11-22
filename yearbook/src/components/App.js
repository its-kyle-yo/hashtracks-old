import React, { Component } from "react";

import * as firebase from "firebase/app";
import config from "../config/firebase.json";

import Page from "./Page";
import Calendar from "./Calendar";
class App extends Component {
  componentWillMount() {
    !firebase.apps.length ? firebase.initializeApp(config) : firebase.app();
  }

  render() {
    return (
      <Page>
        <Calendar />
      </Page>
    );
  }
}

export default App;
