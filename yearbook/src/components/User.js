import React, { Component } from "react";

class User extends Component {
  render() {
    const { user } = this.props;
    return (
      <div className="user">
        <h2>@{user.screen_name}</h2>
        <div>
          <img src={user.profile_image_url} alt={user.screen_name + " img"} />
        </div>
      </div>
    );
  }
}

export default User;
