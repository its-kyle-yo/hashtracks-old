import React, { Component } from "react";
import { getUser, registerUser } from "../helpers/api";
import { sortAsc } from "../helpers/utils";

const FireStore = React.createContext();
class Firebase extends Component {
  state = {
    user: null,
    posts: null,
    year: null
  };

  componentWillMount() {
    // Check if user is already loged in
    if (localStorage.hasOwnProperty("twitter-user-id")) {
      const twitterUserId = localStorage.getItem("twitter-user-id");
      // Update state with returned user
      this.setUser({ id: twitterUserId });
    }
  }

  setUser = async user => {
    try {
      const response = await getUser(user);
      if (response.status === 200) {
        const { info, posts } = response.data;
        this.setLocalStorageId(info);
        this.initState(info, posts);
      }

      if (response.status === 204) {
        const response = await registerUser(user);
        const { info } = response.data;
        this.setLocalStorageId(info);
        this.initState(info);
      }
    } catch (error) {
      console.error(error);
    }
  };

  setLocalStorageId = info => {
    if (info.id) {
      localStorage.setItem("twitter-user-id", info.id);
    }
  };

  initState = (info, posts) => {
    if (!!info) {
      let stateObj = {
        user: {
          id: info.id_str,
          ...info
        }
      };
      // Keys of posts are set of years  [2019, 2018, 2016, 2017, ...]
      // Sorts years in ascending order
      if (!!posts) {
        const yearList = sortAsc(Object.keys(posts));
        stateObj.posts = posts;
        stateObj.yearList = yearList;
        stateObj.year = parseFloat(yearList[0]);
      }

      this.setState(stateObj);
    }
  };

  updateSelectedYear = selectedYear => {
    const year = parseFloat(selectedYear);
    this.setState({ year });
  };

  updateSelectedHashtag = () => {
    console.log("called");
  };

  getPost = (year, month, day) => {
    const { posts } = this.state;
    if (!posts[year] || !posts[year][month]) {
      return;
    }
    const post = posts[year][month][day];
    return post;
  };

  render() {
    return (
      <FireStore.Provider
        value={{
          ...this.state,
          setUser: this.setUser,
          updateSelectedYear: this.updateSelectedYear,
          getPost: this.getPost
        }}
      >
        {this.props.children}
      </FireStore.Provider>
    );
  }
}

export default Firebase;
export { FireStore };
