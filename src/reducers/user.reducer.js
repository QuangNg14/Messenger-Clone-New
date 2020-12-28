import { userConstants } from "../actions/constants"

const initState = {
  users: []
}

export default (state = initState, action) => {
  switch (action.type) {
    case `${userConstants.GET_REALTIME_USERS}_REQUEST`:
      break;
    case `${userConstants.GET_REALTIME_USERS}_SUCCESS`:
      state = {
        ...state,
        users: action.payload.users
      }
      break;

    case userConstants.GET_REALTIME_MESSAGES:
      state = {
        ...state,
        conversations: action.payload.conversations
      }
      break;
    case `${userConstants.GET_REALTIME_MESSAGES}_FAILURE`:
      state = {
        ...state,
        conversations: []
      }
      break;
    case userConstants.GET_REALTIME_MESSAGES_GROUP:
      // console.log("have sent message group")
      state = {
        ...state,
        conversationsGroup: action.payload.conversationsGroup
      }
      break;
    case `${userConstants.GET_REALTIME_MESSAGES_GROUP}_FAILURE`:
      state = {
        ...state,
        conversationsGroup: []
      }
      break;
  }
  return state;

} 