import React, { Component } from "react";

class EmptyDay extends Component {
  render() {
    return (
      <li className="day">
        <div className="overlay">
          <div className="date">{this.props.date}</div>
          <div className="content" />
        </div>
      </li>
    );
  }
}

export default EmptyDay;
