/*
  Redux middleware that gates every request on authentication unless an action
  has been whitelisted.
*/
import { isLoggedIn } from "app/selectors";

const actionWhitelist = [
  "STORE_BAKERY",
  "STORE_CONFIG",
  "STORE_USER_PASS",
  "UPDATE_CONTROLLER_CONNECTION",
  "UPDATE_JUJU_API_INSTANCE",
  "UPDATE_PINGER_INTERVAL_ID",
  "LOG_OUT",
  "CLEAR_MODEL_DATA",
  "STORE_VISIT_URL",
  "TOGGLE_COLLAPSIBLE_SIDEBAR",
];

// When updating this list be sure to update the mangle.reserved list in
// craco.config.js so that the name doesn't get mangled by CRA.
const thunkWhitelist = ["connectAndStartPolling", "logOut"];

function error(name) {
  console.log("unable to perform action:", name, "user not authenticated");
}

export default ({ getState }) => (next) => async (action) => {
  const loggedIn = isLoggedIn(getState());
  // If the action is a function then it's probably a thunk.
  if (typeof action === "function") {
    if (thunkWhitelist.includes(action.name) || loggedIn) {
      // Await the next to support async thunks
      await next(action);
      return;
    } else {
      error(action.name);
    }
  } else {
    if (actionWhitelist.includes(action.type) || loggedIn) {
      next(action);
      return;
    } else {
      error(action.type);
    }
  }
};
