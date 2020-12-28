import React, { useEffect, useState, useRef } from 'react';
import { Button, Dropdown, DropdownButton } from 'react-bootstrap';
import { useDispatch, useSelector } from 'react-redux';
import { getRealTimeConversations, getRealTimeUsers, createMessage, getRealTimeConversationsGroups, createMessageGroup } from '../../actions';
import { useAuth } from '../contexts/AuthContext';
import Header from './header/header';
import Picker from 'emoji-picker-react';
import { makeStyles } from '@material-ui/core';
import Modal from '@material-ui/core/Modal';
import { db } from '../../services/firebase';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCoffee, faReply } from '@fortawesome/free-solid-svg-icons'
import './HomePage.css';
import firebase from "firebase"

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
          // console.log(doc.data().profileImage)
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

const UserGroups = (props) => {
  const { group, userGroups, onClick, userDocIds, id } = props
  const [profileImageUrl, setProfileImageUrl] = useState("")
  const [invalidate5, setInvalidate5] = useState(true)

  // useEffect(() => {
  //   if (id) {
  //     db.collection("users").doc(id).get().then((doc) => {
  //       if (doc.data().profileImage) {
  //         console.log(doc.data().profileImage)
  //         setProfileImageUrl(doc.data().profileImage)
  //       }
  //     })
  //     setInvalidate5(false)
  //   }  
  // }, [id, invalidate5]);
  return (
    <div onClick={() => onClick(group)} className="displayName">
      <div className="displayPic">
        <img src={profileImageUrl} alt="" />
      </div>
      <div style={{ display: "flex", flex: 1, justifyContent: 'space-between', margin: '0 10px' }}>
        <span style={{ fontWeight: 500 }}>{userGroups.conversationName}</span>
        {/* <span className={user.isOnline ? "onlineStatus" : "onlineStatus off"}>
        </span> */}
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
  const [invalidate5, setInvalidate5] = useState(true)
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
  const [tagsId, setTagsId] = useState([docId])
  const [selectedValue, setSelectedValue] = useState("")
  const [groups, setGroups] = useState([])
  const [chatGroup, setChatGroup] = useState(false)
  const [userDocIds, setUserDocIds] = useState([])
  const [currentConversationName, setCurrentConversationName] = useState("")
  const [currentConversationUsernames, setCurrentConversationUsernames] = useState([])
  const [currentGroupId, setCurrentGroupId] = useState("")
  const [profileImageUrl, setProfileImageUrl] = useState("")
  const [invalidate6, setInvalidate6] = useState(true)
  const [open3, setOpen3] = useState(false)
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

  useEffect(() => {
    const newGroups = []
    db.collection("groups").get().then((data) => {
      data.docs.map((doc) => {
        newGroups.push({ id: doc.id, data: doc.data() })
      })
    })
    setGroups(newGroups)
    setInvalidate5(false)
  }, [invalidate5]);

  useEffect(() => {
    if (docId && invalidate6) {
      db.collection("users").doc(docId).get().then((doc) => {
        if (doc.data().profileImage) {
          // console.log(doc.data().profileImage)
          setProfileImageUrl(doc.data().profileImage)
        }
      })
      setInvalidate6(false)
    }
  }, [docId, invalidate6]);

  const initChat = (user) => {
    setChatStarted(true)
    setChatGroup(false)
    setChatUser(`${user.firstName} ${user.lastName}`)
    setUserUid(user.uid)
    dispatch(getRealTimeConversations({ uid_1: currentUser.uid, uid_2: user.uid }))
    console.log(user)
  }

  const initGroup = (group) => {
    setCurrentConversationName(group.data.conversationName)
    setCurrentConversationUsernames(group.data.conversationMembers)
    setChatUser(`${group.data.conversationName}: ${group.data.conversationMembers.map((name) => { return name })}`)
    setUserDocIds(group.data.user_uids)
    setCurrentGroupId(group.id)
    setChatStarted(true)
    dispatch(getRealTimeConversationsGroups(group.data))
    setChatGroup(true)
  }

  const sendMessage = (e) => {
    e.preventDefault()
    const messageObject = {
      user_uid_1: currentUser.uid, //dùng uid
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

  const sendMessageConversation = (e) => {
    e.preventDefault()
    const messageObject = {
      user_uids: userDocIds,
      message: message,
      sender: docId, // dùng docId
      haveReply: replyMessage ? true : false,
      replyMessage: replyMessage,
      conversationName: currentConversationName,
      currentConversationUsernames: currentConversationUsernames,
      profileImage: profileImageUrl,
      senderName: currentUser.displayName
    }
    console.log(messageObject)
    if (message) {
      dispatch(createMessageGroup(messageObject))
        .then(() => {
          setMessage('')
        })
    }
    setReplyMessage("")
  }

  const handleOnKeyDown = (e) => {
    if (e.key === 'Enter' && !chatGroup) {
      sendMessage(e)
    }
    else if (e.key === 'Enter' && chatGroup) {
      sendMessageConversation(e)
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

  const handleReplyMessGroup = (id) => {
    db.collection("conversationsGroup").doc(id).get().then((doc) => {
      setReplyMessage(doc.data().message)
    })
  }

  const handleExitReply = () => {
    setReplyMessage("")
  }

  const handleCreateGroupModal = (e) => {
    e.preventDefault()
    setOpen2(true)
    setConverName("")
    setTagsId([docId])
    setTags([currentUser.displayName])
  }

  const removeTag = (i) => {
    const newTags = [...tags]
    newTags.splice(i, 1)
    const newTagsData = newCurrentFriendList.filter((friend) => newTags.includes(friend.data.firstName + friend.data.lastName))
    let newTagsId = newTagsData.map((tag) => tag.id)
    if (!newTagsId.includes(docId)) {
      newTagsId.push(docId)
    }
    setTagsId(newTagsId)
    setTags(newTags)
  }

  const handleSelect = (e) => {
    const val = e.target.value
    if (e.key === "Enter" && val) {
      if (tags.find(tag => tag.toLowerCase() === val.toLowerCase())) {
        return;
      }
      setTags([...tags, val]);
      const idOfNewMember = newCurrentFriendList.find((friend) => friend.data.firstName + friend.data.lastName === val).id
      if (!tagsId.includes(docId)) {
        setTagsId([...tagsId, docId])
      }
      if (!tagsId.includes(idOfNewMember)) {
        setTagsId([...tagsId, idOfNewMember])
      }
      setTagInput("");
    } else if (e.key === 'Backspace' && !val) {
      removeTag(tags.length - 1);
      //remove id from tagsId
    }
  }

  const createNewConversationGroup = async (e) => {
    if (!tags.includes(currentUser.displayName)) {
      setTags([...tags, currentUser.displayName])
    }
    await db.collection("groups").add({
      user_uids: tagsId,
      conversationName: converName,
      createdAt: new Date(),
      conversationMembers: tags
    })
    setOpen2(false)
  }

  const handleOpenModal = (e) => {
    e.preventDefault()
    setOpen3(true)
    setTagsId([])
    setTags([])
  }

  const addMemberToGroups = async () => {
    await db.collection("groups").doc(currentGroupId).update({
      conversationMembers: currentConversationUsernames && currentConversationUsernames.concat(tags)
    })

    await db.collection("groups").doc(currentGroupId).update({
      user_uids: userDocIds && userDocIds.concat(tagsId)
    })
  }

  return (
    <>
      <Header />
      <div className="containers">
        <div className="listOfUsers">
          <h3>Conversations</h3>
          <div>
            {
              newCurrentFriendList && newCurrentFriendList.map((user) => {
                return (
                  <User id={user.id} key={user.data.uid} user={user.data} onClick={initChat} />
                )
              })
            }
          </div>
          <h3>Groups</h3>
          <div>
            {
              groups && groups.map((group) => {
                if (group.data.user_uids.includes(docId)) {
                  return (
                    <UserGroups group={group} userDocIds={group.data.user_uids} id={group.id} userGroups={group.data} onClick={initGroup} />
                  )
                }
              })
            }
          </div>
          <button onClick={(e) => handleCreateGroupModal(e)} style={{ height: 50 }}>Create a new group</button>

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
                onSelect={(e) => handleSelect(e)}
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
              <Button onClick={createNewConversationGroup}>Create</Button>
            </div>
          </Modal>

        </div>
        <div className="chatArea">
          <div className="chatHeader">
            {
              chatGroup ?
                chatStarted ?
                  (<div className="chatHeaderGroup">
                    <div>{chatUser}</div>
                    <Button onClick={handleOpenModal}>Add member</Button>
                    <Modal
                      open={open3}
                      onClose={() => setOpen3(false)}
                    >
                      <div>
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
                          onSelect={(e) => handleSelect(e)}
                        >
                          {friendListName
                            .filter((friend) => friend.toLowerCase().includes(tagInput.toLowerCase()))
                            .map((friend) => {
                              if (currentConversationUsernames && !currentConversationUsernames.includes(friend)){
                                return (
                                  <option value={friend}>{friend}</option>
                                )
                              }
                            })
                          }
                        </datalist>
                        <Button onClick={addMemberToGroups}>Add</Button>
                      </div>
                    </Modal>
                  </div>)
                  : ""
                : chatStarted ? chatUser : ""
            }
          </div>

          <div className="messageSections" ref={messageEl}>
            {
              (chatStarted && !chatGroup) ?
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
                              <div className={conver.conver.user_uid_1 == currentUser.uid ? "messageStyle" : "messageStyleWhite"} >
                                {conver.conver.haveReply ? (
                                  <div className="chatReplyMessage">
                                    {conver.conver.replyMessage}
                                  </div>
                                ) : null}
                                {conver.conver.message}
                              </div>
                              <FontAwesomeIcon onClick={() => handleReplyMess(conver.id)} icon={faReply} />
                            </div>
                          )
                      }
                    </div>
                  )
                })
                : (
                  user.conversationsGroup && user.conversationsGroup.map((conver) => {
                    return (
                      <div style={{ textAlign: conver.conver.sender == docId ? 'right' : "left" }}>
                        {
                          conver.conver.sender == docId ?
                            (
                              <div className="messageWrapper">
                                <div className="messageSenderRight">{conver.conver.senderName}</div>
                                <div className="messageContainerCurrent">
                                  <FontAwesomeIcon onClick={() => handleReplyMessGroup(conver.id)} icon={faReply} />
                                  <div className={conver.conver.sender == docId ? "messageStyle" : "messageStyleWhite"} >
                                    {conver.conver.haveReply ? (
                                      <div className="chatReplyMessage">
                                        {conver.conver.replyMessage}
                                      </div>
                                    ) : null}
                                    {conver.conver.message}
                                  </div>
                                  <div className="displayPicSmall">
                                    <img src={conver.conver.profileImage} alt="" />
                                  </div>
                                </div>
                              </div>
                            )
                            :
                            (
                              <div className="messageWrapper">
                                <div className="messageSenderLeft">{conver.conver.senderName}</div>
                                <div className="messageContainer">
                                  <div className="displayPicSmall">
                                    <img src={conver.conver.profileImage} alt="" />
                                  </div>

                                  <div className={conver.conver.sender == docId ? "messageStyle" : "messageStyleWhite"} >
                                    {conver.conver.haveReply ? (
                                      <div className="chatReplyMessage">
                                        {conver.conver.replyMessage}
                                      </div>
                                    ) : null}
                                    {conver.conver.message}
                                  </div>

                                  <FontAwesomeIcon onClick={() => handleReplyMessGroup(conver.id)} icon={faReply} />
                                </div>
                              </div>
                            )
                        }
                      </div>
                    )
                  })
                )
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
                  <Button className="button" onClick={chatGroup ? sendMessageConversation : sendMessage}>Send</Button>
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
