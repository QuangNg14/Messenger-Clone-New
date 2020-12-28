import {userConstants} from "./constants";
import {db} from "../services/firebase"

export const getRealTimeUsers = (uid) => {
  return async (dispatch) => {
    
    dispatch({type: `${userConstants.GET_REALTIME_USERS}_REQUEST`})
    const unsubscribe = db.collection("users")
    .onSnapshot((snapShot) => {
      const users = []
      snapShot.docs.map((doc) => {
        if(doc.data().uid != uid){
          users.push(doc.data())
        }
      })
      dispatch({
        type: `${userConstants.GET_REALTIME_USERS}_SUCCESS`,
        payload: {users: users}        
      })
    })
    return unsubscribe
  }
}

export const createMessage = (messageObject) =>{
  return async (dispatch) => {
    db.collection("conversations").add({
      ...messageObject,
      isView: false,
      createdAt: new Date()
    })
    .then((data) => {
      // console.log(data)
      //success
    })
    .catch((err) => {
      console.log(err)
    })
  }
}

export const createMessageGroup = (messageObject) =>{
  return async (dispatch) => {
    db.collection("conversationsGroup").add({
      ...messageObject,
      isView: false,
      createdAt: new Date()
    })
    .then((data) => {
      // console.log(data)
      //success
    })
    .catch((err) => {
      console.log(err)
    })
  }
}

export const getRealTimeConversations = (user) =>{
  return async (dispatch) => {
    db.collection("conversations")
    .where('user_uid_1', 'in', [user.uid_1, user.uid_2])
    .orderBy("createdAt", "asc")
    .onSnapshot((snapShot) => {
      const conversations = []
      //doc.data() -> vao 1 document
      snapShot.docs.map((doc) => {
        //nếu như conversation của 2 người match, 1 người là ng gửi và ng kia nhận được 
        // thì mới push vào conversation
        if((doc.data().user_uid_1 == user.uid_1 && doc.data().user_uid_2 == user.uid_2)
        ||
        (doc.data().user_uid_1 == user.uid_2 && doc.data().user_uid_2 == user.uid_1)){
          conversations.push({id: doc.id, conver: doc.data()})
        }

        if(conversations.length > 0){
          dispatch({
            type: userConstants.GET_REALTIME_MESSAGES,
            payload: { conversations }
          })
        }
        else{
          dispatch({
            type: `${userConstants.GET_REALTIME_MESSAGES}_FAILURE`,
            payload: { conversations }
          })
        }
      })
    })
  }
}

export const getRealTimeConversationsGroups = (userGroups) => {
  return async (dispatch) => {
    db.collection("conversationsGroup")
      .where("conversationName", "==", userGroups.conversationName)
      .orderBy("createdAt", "asc")
      .onSnapshot((snapShot)=>{
        const conversationsGroup = []
        snapShot.docs.map((doc) => {
          // console.log(doc.data())
          if(userGroups.user_uids.includes(doc.data().sender)){
            conversationsGroup.push({id: doc.id, conver: doc.data()})
          }
          if(conversationsGroup.length > 0){
            dispatch({
              type: userConstants.GET_REALTIME_MESSAGES_GROUP,
              payload: { conversationsGroup }
            })
          }
          else{
            dispatch({
              type: `${userConstants.GET_REALTIME_MESSAGES_GROUP}_FAILURE`,
              payload: { conversationsGroup }
            })
          }
        })
        // console.log(userGroups.user_uids)
        // console.log(conversationsGroup)
      })
  }
}

function arrayEquals(a, b) {
  return Array.isArray(a) &&
    Array.isArray(b) &&
    a.length === b.length &&
    a.every((val, index) => val === b[index]);
}