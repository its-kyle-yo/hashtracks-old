import React, { Component } from "react";
import * as firebase from "firebase/app";
import "firebase/auth";
import { FireStore } from "./Firebase";

class Auth extends Component {
  static contextType = FireStore;

  auth = async () => {
    try {
      const { setUser } = this.context;
      const provider = new firebase.auth.TwitterAuthProvider();
      const {
        credential,
        additionalUserInfo
      } = await firebase.auth().signInWithPopup(provider);
      const { accessToken, secret } = credential;
      const user = {
        ...additionalUserInfo.profile,
        credentials: { accessToken, secret }
      };
      await setUser(user);
    } catch (error) {
      //TODO: Handle Errors
      const errorCode = error.code;
      const errorMessage = error.message;
      // The email of the user's account used.
      const email = error.email;
      // The firebase.auth.AuthCredential type that was used.
      const credential = error.credential;
      console.error({ errorCode, errorMessage, email, credential });
    }
  };

  render() {
    return <button onClick={this.auth}>Sign in</button>;
  }
}

export default Auth;
