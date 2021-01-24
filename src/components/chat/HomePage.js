import React, { useEffect, useState, useRef } from 'react';
import { Button, Dropdown, DropdownButton } from 'react-bootstrap';
import { useDispatch, useSelector } from 'react-redux';
import { getRealTimeConversations, getRealTimeUsers, createMessage, getRealTimeConversationsGroups, createMessageGroup } from '../../actions';
import { useAuth } from '../contexts/AuthContext';
import Header from './header/header';
import Picker from 'emoji-picker-react';
import { makeStyles } from '@material-ui/core';
import Modal from '@material-ui/core/Modal';
import { db, storage } from '../../services/firebase';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCoffee, faReply, faSmile, faPaperPlane, faTimesCircle, faPlus, faInfoCircle } from '@fortawesome/free-solid-svg-icons'
import './HomePage.css';
import firebase from "firebase";
import emoji from "emoji-dictionary";
import { Link, useHistory } from 'react-router-dom';
import  { encrypt , decrypt } from 'react-crypt-gsm';

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
  root3: {
    flexGrow: 1,
    minWidth: 300,
  },
  modal3: {
    display: 'flex',
    padding: theme.spacing(1),
    alignItems: 'center',
    justifyContent: 'center',

  },
  paper3: {
    width: 500,
    height: 500,
    alignItems: "center",
    backgroundColor: theme.palette.background.paper,
    border: '2px solid #000',
    boxShadow: theme.shadows[5],
    padding: theme.spacing(2, 4, 3),
  },
  modal2: {
    display: 'flex',
    padding: theme.spacing(1),
    alignItems: 'center',
    justifyContent: 'center',
  },
  paper2: {
    width: 500,
    height: 500,
    alignItems: "center",
    backgroundColor: theme.palette.background.paper,
    border: '2px solid #000',
    boxShadow: theme.shadows[5],
    padding: theme.spacing(2, 4, 3),
  },
  paper4: {
    width: 500,
    height: 500,
    // alignItems: "center",
    backgroundColor: theme.palette.background.paper,
    border: '2px solid #000',
    boxShadow: theme.shadows[5],
    padding: theme.spacing(2, 4, 3),
  },
  paper5: {
    width: "100%",
    height: "70%",
    alignItems: "center",
    backgroundColor: theme.palette.background.paper,
    border: '2px solid #000',
    boxShadow: theme.shadows[5],
    padding: theme.spacing(2, 4, 3),
  },
  paper6: {
    height: 70,
    width: 150,
    backgroundColor: theme.palette.background.paper,
    border: '2px solid #000',
    boxShadow: theme.shadows[5],
    padding: theme.spacing(2, 4, 3),
    position: "relative"
  }
}));


const User = (props) => {
  const [profileImageUrl, setProfileImageUrl] = useState("")
  const [invalidate5, setInvalidate5] = useState(true)
  const { user, onClick, id, currentChatId, chatGroup } = props

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
    <div style={{backgroundColor: (currentChatId == id && !chatGroup) ? "rgb(49, 63, 160)": ""}} onClick={() => onClick(user)} className="displayName">
      <div className="displayPic">
        <img src={profileImageUrl} alt="" />
      </div>
      <div style={{ display: "flex", flex: 1, justifyContent: 'space-between', margin: '0 10px' }}>
        <span style={{color: (currentChatId == id && !chatGroup) ? "white" : "",fontWeight: 500 }}>{user.data.firstName} {user.data.lastName}</span>
        <span className={user.data.isOnline ? "onlineStatus" : "onlineStatus off"}>
        </span>
      </div>
    </div>
  )
}


const UserGroups = (props) => {
  const { groupImageUrl, group, userGroups, onClick, userDocIds, id, chatGroup, currentGroupId } = props
  const [profileImageUrl, setProfileImageUrl] = useState("")
  const [invalidate5, setInvalidate5] = useState(true)

  return (
    <div style={{backgroundColor: (currentGroupId == id && chatGroup) ? "rgb(49, 63, 160)": ""}} onClick={() => onClick(group)} className="displayName">
      <div className="displayPic">
        <img src={groupImageUrl} alt="" />
      </div>
      <div style={{ display: "flex", flex: 1, justifyContent: 'space-between', margin: '0 10px' }}>
        <span style={{color: (currentGroupId == id && chatGroup) ? "white" : "", fontWeight: 500 }}>{userGroups.conversationName}</span>
      </div>
    </div>
  )
}


const HomePage = (props) => {
  const dispatch = useDispatch()
  const { currentUser, logout } = useAuth()
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
  const [open3, setOpen3] = useState(false) //add member to groups
  const [groupInfo, setGroupInfo] = useState([])
  const [invalidate7, setInvalidate7] = useState(false)
  const [open4, setOpen4] = useState(false) //remove member from groups
  const [open5, setOpen5] = useState(false)
  const allInputs = { imgUrl: '' }
  const [imageAsFile, setImageAsFile] = useState('')
  const [imageAsUrl, setImageAsUrl] = useState(allInputs)
  const [groupImageUrl, setGroupProfileImageUrl] = useState("")
  const [invalidate8, setInvalidate8] = useState(true)
  const [open6, setOpen6] = useState(false)
  const [currentMessageEmoji, setCurrentMessageEmoji] = useState(false)
  const [selectedEmoji, setSelectedEmoji] = useState("")
  const [selectedEmojiOnDatabase, setSelectedEmojiOnDatabase] = useState("")
  const [selectedEmojis, setSelectedEmojis] = useState({}) //get the emoji object on database
  const [currentMessageEmojiGroup, setCurrentMessageEmojiGroup] = useState("")
  const [currentKey, setCurrentKey] = useState("")
  const [invalidate9, setInvalidate9] = useState(false)
  const [selectedMember, setSelectedMember] = useState(false)
  const [error, setError] = useState("")
  const [open9, setOpen9] = useState(false) //function modal
  const [open10, setOpen10] = useState(false) //info modal
  const [currentChatId, setCurrentChatId] = useState("")
  const [currentUserInfo, setCurrentUserInfo] = useState({})
  const [groupFromTagsId, setGroupFromTagsId] = useState("")

  let unsubscribe;
  const history = useHistory()
  const classes = useStyles()
  const classesModal = useStyles()

  const messageEl = useRef(null);
  const user = useSelector(state => state.user)

  function removeDuplicates(array) {
    array.splice(0, array.length, ...(new Set(array)))
  };

  useEffect(() => {
    db.collection("users").doc(docId).onSnapshot((doc)=>{
      if(doc.data()){
        setCurrentUserInfo(doc.data())
      }
    })
  }, [docId]);

  useEffect(() => {
    return () => {
      //cleanup
      unsubscribe.then(f => f()).catch(error => console.log(error));
    }
  }, []);
  // console.log(user.conversations)
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
    unsubscribe = dispatch(getRealTimeUsers(currentUser.uid))
        .then((unsubscribe) => {
          setInvalidate(false)
          return unsubscribe
        })
        .catch((err) => {
          console.log(err)
        })
  }, []);

  useEffect(() => {
    db.collection("groups").onSnapshot((data) => {
      setGroups(data.docs.map((doc) => ({ id: doc.id, data: doc.data() })))
    })
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

  useEffect(() => {
    removeDuplicates(groups)
  }, [groups])

  useEffect(() => {
    if (currentGroupId) {
      db.collection("groups").doc(currentGroupId).get().then((doc) => {
        if (doc.data().groupImage) {
          setGroupProfileImageUrl(doc.data().groupImage)
        }
      })
      setInvalidate8(false)
    }
  }, [currentGroupId, invalidate8, imageAsUrl]);

  const initChat = (user) => {
    setCurrentChatId(user.id)
    setChatStarted(true)
    setChatGroup(false)
    setChatUser(`${user.data.firstName} ${user.data.lastName}`)
    dispatch(getRealTimeConversations({ uid_1: docId, uid_2: user.id }))
    // setUserUid(user.data.uid)
    // console.log(user)
  }
  // console.log(user.conversations[user.conversations.length - 1])
  const initGroup = (group) => {
    setGroupFromTagsId(group.data.groupId)
    dispatch(getRealTimeConversationsGroups(group.data))
    setCurrentConversationName(group.data.conversationName)
    setCurrentConversationUsernames(group.data.conversationMembers)
    setChatUser(`${group.data.conversationName}`)
    setUserDocIds(group.data.user_uids)
    setCurrentGroupId(group.id)
    setChatStarted(true)
    setChatGroup(true)
  }

  const sendMessage = async (e) => {
    e.preventDefault()
    const messageObject = {
      user_uid_1: docId, //dùng uid
      user_uid_2: currentChatId,
      message: message,
      haveReply: replyMessage ? true : false,
      replyMessage: replyMessage
    }
    console.log(messageObject)
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
      senderName: currentUser.displayName,
      groupId: groupFromTagsId
    }
    // console.log(messageObject)
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

  const handleReplyMess = (e, id) => {
    // console.log("reply")
    e.preventDefault()
    db.collection("conversations").doc(id).get().then((doc) => {
      setReplyMessage(doc.data().message)
    })
  }

  const handleReplyMessGroup = (e, id) => {
    e.preventDefault()
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

  const removeTagGroup = (i) => {
    const newTags = [...tags]
    newTags.splice(i, 1)
    const newTagsData = newCurrentFriendList.filter((friend) => newTags.includes(friend.data.firstName + friend.data.lastName))
    let newTagsId = newTagsData.map((tag) => tag.id)
    setTagsId(newTagsId)
    setTags(newTags)
  }

  const handleSelect = (e) => {
    const val = e.target.value
    if (e.key === "Enter" && val && friendListName.includes(val)) {
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
    }
    if (e.key === 'Backspace' && !val) {
      if (tags[tags.length - 1] != currentUser.displayName) {
        removeTag(tags.length - 1);
      }
      //remove id from tagsId
    }
  }

  const handleSelectFromDataList = (e) => {
    // console.log("selected")
    setSelectedMember(true)
  }

  const createNewConversationGroup = async (e) => {
    if (!tags.includes(currentUser.displayName)) {
      setTags([...tags, currentUser.displayName])
    }
    await db.collection("groups").add({
      user_uids: tagsId,
      conversationName: converName,
      createdAt: new Date(),
      conversationMembers: tags,
      adminGroup: docId,
      groupId: tagsId.join(""),
      groupImage: "https://ddo0fzhfvians.cloudfront.net/uploads/icons/png/3492900171545197272-512.png"
    })
    setOpen2(false)
  }

  const handleOpenModalAdd = (e) => {
    e.preventDefault()
    setOpen3(true)
    setTagsId([])
    setTags([])
  }

  const handleOpenModalRemove = (e) => {
    e.preventDefault()
    setOpen4(true)
  }

  const addMemberToGroups = async (group) => {
    await db.collection("groups").doc(currentGroupId).update({
      conversationMembers: currentConversationUsernames && currentConversationUsernames.concat(tags)
    })

    await db.collection("groups").doc(currentGroupId).update({
      user_uids: userDocIds && userDocIds.concat(tagsId)
    })
    // await initGroup(group)
    setOpen3(false)
    setInvalidate7(true)
  }

  const handleRemoveMember = async (member) => {
    const idRemoveMember = newCurrentFriendList && newCurrentFriendList.find((friend) => (friend.data.firstName + friend.data.lastName) === member).id
    await db.collection("groups").doc(currentGroupId).update({
      conversationMembers: currentConversationUsernames && currentConversationUsernames.filter((groupUser) => groupUser != member)
    })

    await db.collection("groups").doc(currentGroupId).update({
      user_uids: userDocIds && userDocIds.filter((userDocId) => userDocId != idRemoveMember)
    })
    setOpen4(false)
  }

  const handleAddGroupImage = (e) => {
    e.preventDefault()
    setOpen5(true)
  }

  const handleImageAsFile = (e) => {
    e.preventDefault()
    const image = e.target.files[0]
    setImageAsFile(imageAsFile => image)
  }

  const handleFirebaseUploadGroup = (e) => {
    e.preventDefault()
    // console.log("Start to upload")
    if (imageAsFile === '') {
      // console.log(`not an image, the image file is type of ${typeof (imageAsFile)}`)
    }
    const uploadTask = storage.ref(`/images/${imageAsFile.name}`).put(imageAsFile)
    uploadTask.on("state_changed", (snapShot) => {
    }, (err) => {
      console.log(err)
    }, () => {
      storage.ref('images').child(imageAsFile.name).getDownloadURL()
        .then(fireBaseUrl => {
          setImageAsUrl(prevObject => ({ ...prevObject, imgUrl: fireBaseUrl }))
          db.collection("groups").doc(currentGroupId).update({
            groupImage: fireBaseUrl
          })
        })
    })
    setOpen5(false)
  }

  const handleShowEmojis = (e, id) => {
    e.preventDefault()
    setOpen6(!open6)
    setCurrentMessageEmoji(e.currentTarget.id)

    if (chatGroup) {
      db.collection("conversationsGroup").doc(id).onSnapshot((doc) => {
        if (doc.data().emojiMultiple) {
          // console.log(doc.data().emojiMultiple)
          setSelectedEmojis(doc.data().emojiMultiple)
        }
      })
    }
  }

  const handleReaction = async (e, id) => {
    e.preventDefault()
    setSelectedEmoji(e.currentTarget.textContent)
    const emojiSelected = e.currentTarget.textContent
    await db.collection("conversations").doc(id).update({
      emojiSingle: emojiSelected == selectedEmojiOnDatabase ? "" : emojiSelected
    })
    await db.collection("conversations").doc(id).onSnapshot((doc) => {
      if (doc) {
        setSelectedEmojiOnDatabase(doc.data().emojiSingle)
      }
    })
    setOpen6(false)
  }

  const handleReactionGroup = async (e, id) => { //id là id conver
    e.preventDefault()
    const emojiSelected = e.currentTarget.textContent
    setCurrentMessageEmojiGroup(id)
    let check = false
    db.collection("conversationsGroup").doc(id).onSnapshot((doc) => {
      if (doc.data().emojiMultiple) {
        // console.log(doc.data().emojiMultiple)
        setSelectedEmojis(doc.data().emojiMultiple)
      }
    })

    if (!selectedEmojis.hasOwnProperty(emojiSelected)) {
      // setInvalidate9(!invalidate9)
      let newEmojiMultiple2 = Object.assign({}, selectedEmojis)
      Object.keys(newEmojiMultiple2).map(function (key, index) {
        if (newEmojiMultiple2[key].includes(docId)) {
          const newCurrentEmoji = newEmojiMultiple2[key].filter((id) => id != docId)
          newEmojiMultiple2[key] = newCurrentEmoji
        }
      })

      let newArray = []
      newArray.push(docId)
      newEmojiMultiple2[emojiSelected] = newArray
      await db.collection("conversationsGroup").doc(id).update({
        emojiMultiple: newEmojiMultiple2
      })
    }
    else {
      // console.log("contained emoji")
      let newEmojiMultiple = Object.assign({}, selectedEmojis)

      Object.keys(newEmojiMultiple).map(function (key, index) {
        if (newEmojiMultiple[key].includes(docId)) {
          if (key == emojiSelected) {
            check = true
          }
          const newCurrentEmoji = newEmojiMultiple[key].filter((id) => id != docId)
          newEmojiMultiple[key] = newCurrentEmoji
        }
      })

      // console.log(newEmojiMultiple)
      if (!newEmojiMultiple[emojiSelected].includes(docId) && !check) {
        // console.log("not have yet")
        newEmojiMultiple[emojiSelected].push(docId)
      }

      await db.collection("conversationsGroup").doc(id).update({
        emojiMultiple: newEmojiMultiple
      })
    }
    setOpen6(false)
  }

  async function handleLogout(e) {
    setError('')

    try {
      await logout()
        .then(() => {
          db.collection("users").doc(docId).update({
            isOnline: false
          })
        })
      await localStorage.clear()
      history.push('/login')
    }
    catch {
      setError("Failed to log out")
    }
  }

  const openFunctionModal = (e) => {
    setOpen9(true)
  }

  const openInfoModal = (e) => {
    setOpen10(true)
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
                if(user.id != docId){
                  return (
                    <User chatGroup={chatGroup} currentChatId={currentChatId} id={user.id} key={user.data.uid} user={user} onClick={initChat} />
                  )
                }
              })
            }
          </div>
          <h3>Groups</h3>
          <div>
            {
              groups && groups.map((group) => {
                if (group.data.user_uids.includes(docId)) {
                  return (
                    <div>
                      <UserGroups currentGroupId={currentGroupId} chatGroup={chatGroup} groupImageUrl={group.data.groupImage} group={group} userDocIds={group.data.user_uids} id={group.id} userGroups={group.data} onClick={initGroup} />
                      <div className={classes.root3}>
                        <Modal
                          open={open3}
                          onClose={() => setOpen3(false)}
                          className={classes.modal3}
                        >
                          <div className={classes.paper3}>
                            <h3>Add new members</h3>
                            (Enter to choose)
                            <div className="input-tag">
                              <ul className="input-tag__tags">
                                {tags.map((tag, i) => (
                                  <li key={tag}>
                                    {tag}
                                    <button type="button" onClick={() => removeTagGroup(i)}>x</button>
                                  </li>
                                ))}
                                <li className="input-tag__tags__input">
                                  <input style={{ width: "100%" }} onKeyDown={(e) => handleSelect(e)} list="friendlist" type="text" placeholder="Enter new member's name" value={tagInput} onChange={(e) => setTagInput(e.target.value)} />
                                </li>
                              </ul>
                            </div>

                            <datalist
                              id="friendlist"
                              value={selectedValue}
                              // onChange={(e) => handleSelectFromDataList(e)}
                              onChange={(e) => handleSelect(e)}
                              onSelect={(e) => handleSelect(e)}
                            >
                              {friendListName
                                .filter((friend) => friend.toLowerCase().includes(tagInput.toLowerCase()))
                                .filter((friend) => !tags.includes(friend))
                                .map((friend) => {
                                  if (currentConversationUsernames && !currentConversationUsernames.includes(friend)) {
                                    return (
                                      <option onSelect={(e) => setSelectedValue(e.target.value)} value={friend}>{friend}</option>
                                    )
                                  }
                                })
                              }
                            </datalist>
                            <Button styles={{ marginTop: 200 }} onClick={(e) => addMemberToGroups(e, group)}>Add Members to Group</Button>
                          </div>
                        </Modal>
                      </div>

                      <div className={classes.root3}>
                        <Modal
                          open={open4}
                          onClose={() => setOpen4(false)}
                          className={classes.modal3}
                        >
                          <ul className={classes.paper4}>
                            <h3>Remove members</h3>
                            {currentConversationUsernames && currentConversationUsernames.map((member) => {
                              if (member != currentUser.displayName) {
                                return (
                                  <li style={{ display: "flex", flexDirection: "row", justifyContent: "space-around", marginBottom: 20 }} >
                                    <div>{member}</div>
                                    <Button onClick={() => handleRemoveMember(member)}>Remove</Button>
                                  </li>
                                )
                              }
                            })}
                          </ul>
                        </Modal>
                      </div>

                      <div className={classes.root3}>
                        <Modal
                          open={open5}
                          onClose={() => setOpen5(false)}
                          className={classes.modal3}
                        >
                          <ul className={classes.paper4}>
                            <h3>Change Group Image</h3>
                            <div>
                              <input type="file" onChange={handleImageAsFile} />
                              <button onClick={handleFirebaseUploadGroup}>Upload</button>
                            </div>
                          </ul>
                        </Modal>
                      </div>
                    </div>
                  )
                }
              })
            }
          </div>
          <Button onClick={(e) => handleCreateGroupModal(e)} style={{ backgroundColor: "#446fd1", height: 50 }}>Create a new group</Button>

          <div className={classes.root3}>
            <Modal
              open={open2}
              onClose={() => setOpen2(false)}
              className={classes.modal3}
            >
              <div className={classes.paper2}>
                <h3>Create new conversation group </h3>
                <div>
                  <input style={{ width: "100%" }} type="text" placeholder="Enter conversation's name" value={converName} onChange={(e) => setConverName(e.target.value)} />
                </div>
                <div className="input-tag">
                  <ul className="input-tag__tags">
                    {tags.map((tag, i) => (
                      <li key={tag}>
                        {tag}
                        <button type="button" onClick={() => removeTag(i)}>x</button>
                      </li>
                    ))}
                    <li className="input-tag__tags__input">
                      <input style={{ width: "100%" }} onKeyDown={(e) => handleSelect(e)} list="friendlist" type="text" placeholder="Enter new member's name" value={tagInput} onChange={(e) => setTagInput(e.target.value)} />
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
                    .filter((friend) => !tags.includes(friend))
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
        </div>
        <div className="chatArea">
          <div className="chatHeader">
            {
              chatGroup ?
                chatStarted ?
                  (<div className="chatHeaderGroup">
                    <div style={{ width: "90%" }}>{chatUser}</div>
                    <div style={{ width: "10%", display: "flex", flexDirection: "row", justifyContent: "space-around", alignItems:"center" }}>
                      <FontAwesomeIcon style={{fontSize: 35}} onClick={openFunctionModal} icon={faPlus} />
                      <FontAwesomeIcon style={{fontSize: 35}} onClick={openInfoModal} icon={faInfoCircle} />

                      <Modal
                        open={open9}
                        onClose={() => setOpen9(false)}
                        className={classes.modal3}
                      >
                        <div className={classes.paper4}>
                          <h3>Group Functions</h3>
                          <div style={{display: "flex", justifyContent: 'space-around',}}>
                            <Button style={{marginBot: 20}} onClick={handleOpenModalAdd}>Add</Button>
                            <Button style={{marginBot: 20}} onClick={handleOpenModalRemove}>Remove</Button>
                            <Button style={{marginBot: 20}} onClick={handleAddGroupImage}>Change Group Image</Button>
                          </div>
                        </div>
                      </Modal>

                      <Modal
                        open={open10}
                        onClose={() => setOpen10(false)}
                        className={classes.modal3}
                      >
                        <ul className={classes.paper4}>
                          <h3>Group members</h3>
                          {currentConversationUsernames && currentConversationUsernames.map((member) => {
                            return (
                              <li style={{ display: "flex", flexDirection: "row", justifyContent: "space-around", marginBottom: 20 }} >
                                <div>{member}</div>
                              </li>
                            )
                          })}
                        </ul>
                      </Modal>

                    </div>
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
                    <div style={{ textAlign: conver.conver.user_uid_1 == docId ? 'right' : "left" }}>
                      {
                        conver.conver.user_uid_1 == docId ?
                          (<div className="maindiv" style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", zIndex: 9999 }}>
                            {(open6 && (currentMessageEmoji && currentMessageEmoji == conver.id)) ? (
                              <div className="emojiContainer">
                                <div onClick={(e) => handleReaction(e, conver.id)} className="emoji-li">{emoji.getUnicode("heart")}</div>
                                <div onClick={(e) => handleReaction(e, conver.id)} className="emoji-li">{emoji.getUnicode(emoji.names[11])}</div>
                                <div onClick={(e) => handleReaction(e, conver.id)} className="emoji-li">{emoji.getUnicode(emoji.names[70])}</div>
                                <div onClick={(e) => handleReaction(e, conver.id)} className="emoji-li">{emoji.getUnicode(emoji.names[73])}</div>
                                <div onClick={(e) => handleReaction(e, conver.id)} className="emoji-li">{emoji.getUnicode(emoji.names[55])}</div>
                                <div onClick={(e) => handleReaction(e, conver.id)} className="emoji-li">{emoji.getUnicode(emoji.names[116])}</div>
                                <div onClick={(e) => handleReaction(e, conver.id)} className="emoji-li">{emoji.getUnicode(emoji.names[117])}</div>
                              </div>
                            ) : null}
                            <div>
                              <div className="maindiv" key={conver.id} className="messageContainerCurrent">
                                <div className="hide" id={conver.id} onClick={(e) => handleShowEmojis(e, conver.id)}>{emoji.getUnicode("grinning")}</div>
                                <FontAwesomeIcon className="hide" onClick={(e) => handleReplyMess(e, conver.id)} icon={faReply} />
                                <div className={conver.conver.user_uid_1 == docId ? "messageStyle" : "messageStyleWhite"} >
                                  {conver.conver.haveReply ? (
                                    <div className="chatReplyMessage">
                                      {conver.conver.replyMessage}
                                    </div>
                                  ) : null}
                                  {conver.conver.message}
                                </div>
                              </div>
                              <div className="emojiMessage" style={{ position: "absolute", right: "1%", marginTop: -16 }}>{conver.conver.emojiSingle}</div>
                            </div>
                          </div>
                          )
                          :
                          (
                            <div className="maindiv" style={{ display: "flex", flexDirection: "column", alignItems: "flex-start", marginBottom: currentMessageEmoji ? 10 : 0 }}>
                              {(open6 && (currentMessageEmoji && currentMessageEmoji == conver.id)) ? (
                                <div className="emojiContainer">
                                  <div onClick={(e) => handleReaction(e, conver.id)} className="emoji-li">{emoji.getUnicode("heart")}</div>
                                  <div onClick={(e) => handleReaction(e, conver.id)} className="emoji-li">{emoji.getUnicode(emoji.names[11])}</div>
                                  <div onClick={(e) => handleReaction(e, conver.id)} className="emoji-li">{emoji.getUnicode(emoji.names[70])}</div>
                                  <div onClick={(e) => handleReaction(e, conver.id)} className="emoji-li">{emoji.getUnicode(emoji.names[73])}</div>
                                  <div onClick={(e) => handleReaction(e, conver.id)} className="emoji-li">{emoji.getUnicode(emoji.names[55])}</div>
                                  <div onClick={(e) => handleReaction(e, conver.id)} className="emoji-li">{emoji.getUnicode(emoji.names[116])}</div>
                                  <div onClick={(e) => handleReaction(e, conver.id)} className="emoji-li">{emoji.getUnicode(emoji.names[117])}</div>
                                </div>
                              ) : null}
                              <div>
                                <div className="maindiv" className="messageContainer">
                                  <div className={conver.conver.user_uid_1 == docId ? "messageStyle" : "messageStyleWhite"} >
                                    {conver.conver.haveReply ? (
                                      <div className="chatReplyMessage">
                                        {conver.conver.replyMessage}
                                      </div>
                                    ) : null}
                                    {conver.conver.message}
                                  </div>
                                  <FontAwesomeIcon className="hide" onClick={(e) => handleReplyMess(e, conver.id)} icon={faReply} />
                                  <div className="hide" id={conver.id} onClick={(e) => handleShowEmojis(e, conver.id)}>{emoji.getUnicode("grinning")}</div>
                                </div>
                                <div className="emojiMessage" style={{ position: "absolute", left: "1%", marginTop: -16 }}>{conver.conver.emojiSingle}</div>
                              </div>
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
                            (<div className="maindiv" style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", zIndex: 9999 }}>
                              {(open6 && (currentMessageEmoji && currentMessageEmoji == conver.id)) ? (
                                <div className="emojiContainer">
                                  <div onClick={(e) => handleReactionGroup(e, conver.id)} className="emoji-li">{emoji.getUnicode("heart")}</div>
                                  <div onClick={(e) => handleReactionGroup(e, conver.id)} className="emoji-li">{emoji.getUnicode(emoji.names[11])}</div>
                                  <div onClick={(e) => handleReactionGroup(e, conver.id)} className="emoji-li">{emoji.getUnicode(emoji.names[70])}</div>
                                  <div onClick={(e) => handleReactionGroup(e, conver.id)} className="emoji-li">{emoji.getUnicode(emoji.names[73])}</div>
                                  <div onClick={(e) => handleReactionGroup(e, conver.id)} className="emoji-li">{emoji.getUnicode(emoji.names[55])}</div>
                                  <div onClick={(e) => handleReactionGroup(e, conver.id)} className="emoji-li">{emoji.getUnicode(emoji.names[116])}</div>
                                  <div onClick={(e) => handleReactionGroup(e, conver.id)} className="emoji-li">{emoji.getUnicode(emoji.names[117])}</div>
                                </div>
                              ) : null}
                              <div className="messageWrapper">
                                <div className="messageSenderRight">{conver.conver.senderName}</div>
                                <div className="messageContainerCurrent">
                                  <div className="hide" id={conver.id} onClick={(e) => handleShowEmojis(e, conver.id)}>{emoji.getUnicode("grinning")}</div>
                                  <FontAwesomeIcon className="hide" onClick={(e) => handleReplyMessGroup(e, conver.id)} icon={faReply} />
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
                                <div className="emojiWrapper" style={{ display: "flex", flexDirection: "row", position: "absolute", right: "3%", marginTop: conver.conver.replyMessage ? 100 : 70 }}>
                                  {conver.conver.emojiMultiple && Object.keys(conver.conver.emojiMultiple).map(function (key, index) {
                                    return (
                                      <div style={{ display: "flex", flexDirection: "row" }}>
                                        <p>{conver.conver.emojiMultiple[key].length > 0 ? key : ""}</p>
                                        <p>{conver.conver.emojiMultiple[key].length > 0 ? conver.conver.emojiMultiple[key].length : ""}</p>
                                      </div>
                                    )
                                  })}
                                </div>
                              </div>
                            </div>
                            )
                            :
                            (
                              <div className="maindiv" style={{ display: "flex", flexDirection: "column", alignItems: "flex-start" }}>
                                {(open6 && (currentMessageEmoji && currentMessageEmoji == conver.id)) ? (
                                  <div className="emojiContainer">
                                    <div onClick={(e) => handleReactionGroup(e, conver.id)} className="emoji-li">{emoji.getUnicode("heart")}</div>
                                    <div onClick={(e) => handleReactionGroup(e, conver.id)} className="emoji-li">{emoji.getUnicode(emoji.names[11])}</div>
                                    <div onClick={(e) => handleReactionGroup(e, conver.id)} className="emoji-li">{emoji.getUnicode(emoji.names[70])}</div>
                                    <div onClick={(e) => handleReactionGroup(e, conver.id)} className="emoji-li">{emoji.getUnicode(emoji.names[73])}</div>
                                    <div onClick={(e) => handleReactionGroup(e, conver.id)} className="emoji-li">{emoji.getUnicode(emoji.names[55])}</div>
                                    <div onClick={(e) => handleReactionGroup(e, conver.id)} className="emoji-li">{emoji.getUnicode(emoji.names[116])}</div>
                                    <div onClick={(e) => handleReactionGroup(e, conver.id)} className="emoji-li">{emoji.getUnicode(emoji.names[117])}</div>
                                  </div>
                                ) : null}
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
                                    <FontAwesomeIcon className="hide" onClick={(e) => handleReplyMessGroup(e, conver.id)} icon={faReply} />
                                    <div className="hide" id={conver.id} onClick={(e) => handleShowEmojis(e, conver.id)}>{emoji.getUnicode("grinning")}</div>
                                  </div>
                                  <div className="emojiWrapper" style={{ display: "flex", flexDirection: "row", position: "absolute", left: "3%", marginTop: conver.conver.replyMessage ? 100 : 70 }}>
                                    {conver.conver.emojiMultiple && Object.keys(conver.conver.emojiMultiple).map(function (key, index) {
                                      return (
                                        <div style={{ display: "flex", flexDirection: "row" }}>
                                          <p>{conver.conver.emojiMultiple[key].length > 0 ? key : ""}</p>
                                          <p style={{ color: "#7d7a7a" }}>{conver.conver.emojiMultiple[key].length > 0 ? conver.conver.emojiMultiple[key].length : ""}</p>
                                        </div>
                                      )
                                    })}
                                  </div>
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
                      <div onClick={handleExitReply} className="exit">
                        <FontAwesomeIcon icon={faTimesCircle} />
                      </div>
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
                  <div>
                    <FontAwesomeIcon className="icon" onClick={() => setOpen(true)} icon={faSmile} />
                    <FontAwesomeIcon className="icon" onClick={chatGroup ? (e) => sendMessageConversation(e) : (e) => sendMessage(e)} icon={faPaperPlane} />
                  </div>
                  {/* <Button className="button" onClick={() => setOpen(true)}>Emo</Button>
                  <Button className="button" onClick={chatGroup ? sendMessageConversation : sendMessage}>Send</Button> */}
                </div>
              </div>
              : null
          }
        </div>
        <div className="side-dashboard">
          <div className="upper">
            <div style={{ position: "relative", top: "10%" }}>
              <div style={{ color: "white", fontSize: 25 }}><strong>{`${currentUserInfo.firstName} ${currentUserInfo.lastName}`}</strong></div>
              <div style={{ color: "grey", fontSize: 15 }}><strong>{currentUserInfo.email}</strong></div>
            </div>
            <img
              src={profileImageUrl}
              style={{
                width: 100,
                height: 100,
                borderRadius: 50,
                position: "relative",
                top: "20%"
              }}
            />
          </div>
          <div className="lower">
            {/* <div onClick={changeProfilePic} className="profile-pic hover">
              <strong style={{ marginLeft: 20 }}>Change Profile Picture</strong>
            </div> */}
            <div className="chat2 hover">
              <strong style={{ marginLeft: 20 }}>
                <Link to="/" style={{ color: 'inherit', textDecoration: 'inherit' }}>Go to Dash Board</Link>
              </strong>
            </div>
            <div className="friend-list">
              <div style={{ display: "flex", alignItems: "center" }}>
                <strong style={{ marginLeft: 20, marginTop: 10, marginBottom: 10 }}>Friend List</strong>
              </div>
              <div>
                {newCurrentFriendList && newCurrentFriendList.map((friend) => {
                  if(friend.id != docId){
                    return (
                      <div>
                        <div className="friend-info">
                          <img
                            src={friend.data.profileImage}
                            style={{
                              width: 40,
                              height: 40,
                              borderRadius: 20,
                            }}
                          />
                          <div style={{ marginLeft: 15 }} className="name">
                            {friend.data.firstName} {friend.data.lastName}
                          </div>
                          {/* <div onClick={(e) => handleRemoveFriend(e)}>
                            <FontAwesomeIcon icon={faTimesCircle} />
                          </div> */}
                        </div>
                      </div>
                    )
                  }
                })}
              </div>
            </div>
            {/* <div className="update-profile hover">
              <span style={{ marginLeft: 20 }}>
                <Link to="/update-profile" style={{ color: 'inherit', textDecoration: 'inherit' }}>Update Profile</Link>
              </span>
            </div> */}

            <div onClick={(e) => handleLogout(e)} className="logout hover">
              <strong onClick={(e) => handleLogout(e)} style={{ marginLeft: 20 }}>Logout</strong>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default HomePage;
