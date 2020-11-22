import React, { Component } from 'react';
import logo from '@images/logo.svg';
import '@styles/App.css';
import Auth from "../Auth/index";

class App extends Component {
  render() {
    return (
      <div className="App" >
        <header className="App-header">
          <img src={logo} className="App-logo" alt="logo" />
          <Auth />
        </header>
      </div>
    );
  }
}

export default App;
