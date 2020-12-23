import React, { useEffect, useState, useRef } from 'react';
import { Button, Dropdown, DropdownButton } from 'react-bootstrap';
import { useDispatch, useSelector } from 'react-redux';
import { getRealTimeConversations, getRealTimeUsers, createMessage } from '../../actions';
import { useAuth } from '../contexts/AuthContext';
import Header from './header/header';
import Picker from 'emoji-picker-react';
import { makeStyles } from '@material-ui/core';
import Modal from '@material-ui/core/Modal';
import { db } from '../../services/firebase';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCoffee, faReply } from '@fortawesome/free-solid-svg-icons'
import './HomePage.css';

const useStyles = makeStyles((theme) => ({
  paper: {
    position: "absolute",
    bottom: "10%",
    right: 250,
    width: "auto",
    backgroundColor: theme.palette.background.paper,
    border: '2px solid #000',
    padding: theme.spacing(2, 4, 3),
  },
}));


const User = (props) => {
  const [profileImageUrl, setProfileImageUrl] = useState("")
  const [invalidate5, setInvalidate5] = useState(true)
  const { user, onClick, id } = props

  useEffect(() => {
    if (id) {
      db.collection("users").doc(id).get().then((doc) => {
        if (doc.data().profileImage) {
          console.log(doc.data().profileImage)
          setProfileImageUrl(doc.data().profileImage)
        }
      })
      setInvalidate5(false)
    }
  }, [id, invalidate5]);
  return (
    <div onClick={() => onClick(user)} className="displayName">
      <div className="displayPic">
        <img src={profileImageUrl} alt="" />
      </div>
      <div style={{ display: "flex", flex: 1, justifyContent: 'space-between', margin: '0 10px' }}>
        <span style={{ fontWeight: 500 }}>{user.firstName} {user.lastName}</span>
        <span className={user.isOnline ? "onlineStatus" : "onlineStatus off"}>
        </span>
      </div>
    </div>
  )
}

const HomePage = (props) => {
  const dispatch = useDispatch()
  const { currentUser } = useAuth()
  const [invalidate, setInvalidate] = useState(true)
  const [invalidate2, setInvalidate2] = useState(true)
  const [invalidate4, setInvalidate4] = useState(true)
  const [chatStarted, setChatStarted] = useState(false)
  const [chatUser, setChatUser] = useState('')
  const [message, setMessage] = useState('')
  const [userUid, setUserUid] = useState('')
  const [chosenEmoji, setChosenEmoji] = useState(null);
  const [open, setOpen] = useState(false)
  const [docId, setDocId] = useState() //current User Firebase document id
  const [friendList, setFriendList] = useState([]) //friendlist in client side
  const [newCurrentFriendList, setNewCurrentFriendList] = useState([]) //get all friends from firebase
  const [replyMessage, setReplyMessage] = useState("")
  const [open2, setOpen2] = useState(false) //create new Group
  const [converName, setConverName] = useState("")
  const [friendListName, setFriendListName] = useState([])
  const [tagInput, setTagInput] = useState("")
  const [tags, setTags] = useState([])
  const [selectedValue, setSelectedValue] = useState("")

  const classes = useStyles()

  const messageEl = useRef(null);
  const user = useSelector(state => state.user)

  useEffect(() => {
    if (invalidate2) {
      db.collection("users").where("uid", "==", currentUser.uid)
        .onSnapshot((snapShot) => {
          snapShot.docs.map((doc) => setDocId(doc.id))
          setInvalidate2(false)
        })
    }
  }, [invalidate2]);

  useEffect(() => {
    if (docId) {
      db.collection("users").doc(docId).get().then((doc) => {
        if (doc.data().friendList) {
          console.log(doc.data().friendList)
          setFriendList(doc.data().friendList)
        }
      })
      setInvalidate4(false)
    }
  }, [docId, invalidate4]);

  useEffect(() => {
    let newFriendLists = []
    let newFriendListName = []
    db.collection("users").get().then((data) => {
      data.docs.map((doc) => {
        if (friendList.includes(doc.id)) {
          newFriendLists.push({ id: doc.id, data: doc.data() })
          newFriendListName.push(`${doc.data().firstName + doc.data().lastName}`)
        }
      })
      console.log(newFriendLists)
      setNewCurrentFriendList(newFriendLists)
      setFriendListName(newFriendListName)
    })
  }, [friendList]);

  useEffect(() => {
    if (messageEl) {
      messageEl.current.addEventListener('DOMNodeInserted', event => {
        const { currentTarget: target } = event;
        target.scroll({ top: target.scrollHeight, behavior: 'smooth' });
      });
    }
  }, [])

  useEffect(() => {
    if (invalidate) {
      dispatch(getRealTimeUsers(currentUser.uid))
        .then((unsubscribe) => {
          setInvalidate(false)
          return unsubscribe
        })
        .catch((err) => {
          console.log(err)
        })
    }
  }, [invalidate]);

  const initChat = (user) => {
    setChatStarted(true)
    setChatUser(`${user.firstName} ${user.lastName}`)
    setUserUid(user.uid)
    dispatch(getRealTimeConversations({ uid_1: currentUser.uid, uid_2: user.uid }))
    console.log(user)
  }

  const sendMessage = (e) => {
    e.preventDefault()
    const messageObject = {
      user_uid_1: currentUser.uid,
      user_uid_2: userUid,
      message: message,
      haveReply: replyMessage ? true : false,
      replyMessage: replyMessage
    }
    if (message) {
      dispatch(createMessage(messageObject))
        .then(() => {
          setMessage('')
        })
    }
    setReplyMessage("")
  }

  const handleOnKeyDown = (e) => {
    if (e.key === 'Enter') {
      sendMessage(e)
    }
  }

  const onEmojiClick = (event, emojiObject) => {
    setChosenEmoji(emojiObject);
    setMessage(message + emojiObject.emoji)
  };

  const handleReplyMess = (id) => {
    console.log("reply")
    db.collection("conversations").doc(id).get().then((doc) => {
      setReplyMessage(doc.data().message)
    })
  }

  const handleExitReply = () => {
    setReplyMessage("")
  }

  const handleCreateGroupModal = (e) => {
    e.preventDefault()
    setOpen2(true)
  }

  const removeTag = (i) => {
    const newTags = [...tags]
    newTags.splice(i, 1)
    setTags(newTags)
  }

  const handleSelect = (e) => {
    const val = e.target.value
    if (e.key === "Enter" && val) {
      if (tags.find(tag => tag.toLowerCase() === val.toLowerCase())) {
        return;
      }
      setTags([...tags, val]);
      setTagInput("");
    } else if (e.key === 'Backspace' && !val) {
      removeTag(tags.length - 1);
    }
  }

  return (
    <>
      <Header />
      <div className="containers">
        <div className="listOfUsers">
          <div>
            {
              newCurrentFriendList && newCurrentFriendList.map((user) => {
                return (
                  <User id={user.id} key={user.data.uid} user={user.data} onClick={initChat} />
                )
              })
            }
          </div>
          <button onClick={handleCreateGroupModal} style={{ height: 50 }}>Create a new group</button>

          <Modal
            open={open2}
            onClose={() => setOpen2(false)}
          >
            <div>
            <input style={{ width: 500 }} list="friendlist" type="text" placeholder="Enter conversation's name" value={converName} onChange={(e) => setConverName(e.target.value)} />
              <div className="input-tag">
                <ul className="input-tag__tags">
                  {tags.map((tag, i) => (
                    <li key={tag}>
                      {tag}
                      <button type="button" onClick={() => removeTag(i)}>x</button>
                    </li>
                  ))}
                  <li className="input-tag__tags__input">
                    <input style={{ width: 500 }} onKeyDown={(e) => handleSelect(e)} list="friendlist" type="text" placeholder="Enter new member's name" value={tagInput} onChange={(e) => setTagInput(e.target.value)} />
                  </li>
                </ul>
              </div>

              <datalist
                id="friendlist"
                value={selectedValue}
                onChange={(e) => handleSelect(e)}
              >
                {friendListName
                  .filter((friend) => friend.toLowerCase().includes(tagInput.toLowerCase()))
                  .map((friend) => {
                    return (
                      <option value={friend}>{friend}</option>
                    )
                  })
                }
              </datalist>
            </div>
          </Modal>

        </div>
        <div className="chatArea">
          <div className="chatHeader">
            {
              chatStarted ? chatUser : ""
            }
          </div>

          <div className="messageSections" ref={messageEl}>
            {
              chatStarted ?
                user.conversations && user.conversations.map((conver) => {
                  return (
                    <div style={{ textAlign: conver.conver.user_uid_1 == currentUser.uid ? 'right' : "left" }}>
                      {
                        conver.conver.user_uid_1 == currentUser.uid ?
                          (
                            <div>
                              <FontAwesomeIcon onClick={() => handleReplyMess(conver.id)} icon={faReply} />
                              <div className={conver.conver.user_uid_1 == currentUser.uid ? "messageStyle" : "messageStyleWhite"} >
                                {conver.conver.haveReply ? (
                                  <div className="chatReplyMessage">
                                    {conver.conver.replyMessage}
                                  </div>
                                ) : null}
                                {conver.conver.message}
                              </div>
                            </div>
                          )
                          :
                          (
                            <div>
                              <div className={conver.conver.user_uid_1 == currentUser.uid ? "messageStyle" : "messageStyleWhite"} >{conver.conver.message}</div>
                              <FontAwesomeIcon onClick={() => handleReplyMess(conver.id)} icon={faReply} />
                            </div>
                          )
                      }
                    </div>
                  )
                })
                : null
            }
          </div>

          {
            chatStarted ?
              <div className="chatReply">
                {replyMessage ?
                  (
                    <div className="reply">
                      <div>
                        <div>
                          <FontAwesomeIcon icon={faReply} />
                      Replying to {chatUser}
                        </div>
                        <span className="replyMessage">{replyMessage}</span>
                      </div>
                      <div onClick={handleExitReply} className="exit">X</div>
                    </div>
                  ) : null
                }
                <div className="chatControls">
                  <input className="input" value={message} onChange={(e) => setMessage(e.target.value)}
                    onKeyDown={handleOnKeyDown}
                    placeholder="Write a message"
                  />
                  <Modal
                    open={open}
                    onClose={() => setOpen(false)}
                  >
                    <div className={classes.paper}>
                      <Picker onEmojiClick={onEmojiClick} />
                    </div>
                  </Modal>
                  <Button className="button" onClick={() => setOpen(true)}>Emo</Button>
                  <Button className="button" onClick={sendMessage}>Send</Button>
                </div>
              </div>
              : null
          }
        </div>
      </div>
    </>
  );
}

export default HomePage;
