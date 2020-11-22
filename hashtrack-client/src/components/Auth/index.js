import React, { Component } from 'react'
import axios from 'axios';
import * as firebase from "firebase/app";
import "firebase/auth";
import { FirebaseContext } from "@components/Firebase";

export default class Auth extends Component {
  static contextType = FirebaseContext;
  auth = async () => {
    try {
      const provider = new firebase.auth.TwitterAuthProvider();
      const {
        credential,
        additionalUserInfo
      } = await firebase.auth().signInWithPopup(provider);
      const { profile, username } = additionalUserInfo;
      const user = {
        id: profile.id,
        id_str: profile.id_str,
        profile_image_url: profile.profile_image_url,
        name: profile.name,
        username,
      }
      const credentials = { accessToken: credential.accessToken, accessTokenSecret: credential.secret };
      const data = await axios.post("https://the-yearbook-api-staging.herokuapp.com/api/v1/users/login", { credentials, user })
      console.log({ data })
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
    return (
      <button onClick={this.auth}>Sign In</button>
    )
  }
}
