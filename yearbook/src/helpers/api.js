import config from "../config/firebase.json";
import axios from "axios";

const url =
  process.env.NODE_ENV === "development"
    ? "http://localhost:5000/twitter-yearbook/us-central1/api"
    : config.api.baseURL;

export const getUser = async user => {
  try {
    const { id } = user;
    const response = await axios.get(`${url}/users/${id}`);
    return response;
  } catch (e) {
    return { e };
  }
};

export const registerUser = async user => {
  try {
    const { id } = user;
    const response = await axios.post(`${url}/users/${id}`, { user });
    return response;
  } catch (e) {
    return { e };
  }
};
