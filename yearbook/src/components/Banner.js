import React, { Component } from "react";
import User from "./User";
import Auth from "./Auth";
import { FireStore } from "./Firebase";
import NavControls from "./NavControls";
import { If, Then, Else, When } from "react-if";
class Banner extends Component {
  static contextType = FireStore;

  render() {
    const { user, posts } = this.context;

    return (
      <header
        role="banner"
        style={{
          backgroundColor: false && !!user ? `#${user.profile_link_color}` : ""
        }}
      >
        <div className="controls">
          <div>Welcome to the Twitter Yearbook!</div>
          <If condition={!!user}>
            <Then>
              <When condition={!!posts}>
                <div>
                  <NavControls />
                </div>
              </When>
              <User user={user} />
            </Then>
            <Else>
              <Auth />
            </Else>
          </If>
        </div>
      </header>
    );
  }
}

export default Banner;
