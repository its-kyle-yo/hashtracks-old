import React, { Component } from "react";
import Banner from "./Banner";
import Firebase from "./Firebase";

export default class Page extends Component {
  render() {
    return (
      <Firebase>
        <Banner />
        <hr />
        {this.props.children}
      </Firebase>
    );
  }
}
