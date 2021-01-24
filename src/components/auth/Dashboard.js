import React, { useState, useEffect, useRef } from 'react';
import { Alert, Button, Card } from "react-bootstrap"
import { useAuth } from "../contexts/AuthContext"
import { Link, useHistory } from "react-router-dom"
import Header from '../chat/header/header';
import Modal from '@material-ui/core/Modal';
import { db, storage } from '../../services/firebase';
import { makeStyles } from '@material-ui/core';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCoffee, faReply, faTimesCircle, faUserPlus, faCheck, faTimes } from '@fortawesome/free-solid-svg-icons'
import firebase from "firebase"
import "./Dashboard.css"


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
    minWidth: 300,
    // height: 300
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
    alignItems: "center",
    backgroundColor: theme.palette.background.paper,
    border: '2px solid #000',
    boxShadow: theme.shadows[5],
    padding: theme.spacing(2, 4, 3),
  },
}));

const User = (props) => {
  const { id, user, docId } = props
  const [pendingFriends, setPendingFriends] = useState([])
  const [sentFriendRequests, setSentFriendRequests] = useState([])
  const [pending, setPending] = useState()

  useEffect(() => {
    db.collection("users").doc(docId).onSnapshot((doc) => {
      if (doc.data().pendingFriends) {
        setPendingFriends(doc.data().pendingFriends)
      }
    })
  }, []);

  useEffect(() => {
    db.collection("users").doc(docId).onSnapshot((doc) => {
      if (doc.data().sentFriendRequests) {
        setSentFriendRequests(doc.data().sentFriendRequests)
      }
    })
  }, []);

  const handleAddFriend = async (id) => {
    setPending(true)
    await db.collection("users").doc(id).update({
      pendingFriends: firebase.firestore.FieldValue.arrayUnion(docId)
    })
    await db.collection("users").doc(docId).update({
      sentFriendRequests: firebase.firestore.FieldValue.arrayUnion(id)
    })
  }

  const handleAcceptFriend = async (id) => {
    await db.collection("users").doc(docId).update({
      friendList: firebase.firestore.FieldValue.arrayUnion(id)
    })

    await db.collection("users").doc(id).update({
      friendList: firebase.firestore.FieldValue.arrayUnion(docId)
    })

    await db.collection("users").doc(id).update({
      pendingFriends: pendingFriends.filter((friendId) => friendId != id && friendId != docId)
    })

    await db.collection("users").doc(docId).update({
      pendingFriends: pendingFriends.filter((friendId) => friendId != id && friendId != docId)
    })

    await db.collection("users").doc(id).update({
      sentFriendRequests: sentFriendRequests.filter((friendId) => friendId != docId)
    })

    await db.collection("users").doc(docId).update({
      sentFriendRequests: sentFriendRequests.filter((friendId) => friendId != id)
    })
    setPendingFriends([])
    setSentFriendRequests([])
    // console.log("Accepted", id)
  }

  const handleDeclineFriend = async (id) => {
    await db.collection("users").doc(id).update({
      pendingFriends: pendingFriends.filter((friendId) => friendId != id && friendId != docId)
    })

    await db.collection("users").doc(docId).update({
      pendingFriends: pendingFriends.filter((friendId) => friendId != id && friendId != docId)
    })
  }

  return (
    <Card>
      <Card.Body style={{width: "50%"}}>
        <div className="user-card">
          <div className="profile-image">
          <img
              src={user.profileImage}
              style={{
                width: 70,
                height: 70,
                objectFit: "cover",
                borderRadius: 35,
                position: "relative",
                top: "20%"
              }}
            />
          </div>
          <div style={{marginLeft: 30, marginRight: 30}}>
            <div className="name">
              <strong>Name: {user.firstName} {user.lastName}</strong>
            </div>
       {/* <div className="email">
              <strong>Email: {user.email}</strong>
            </div>
      */}
          </div>

          {/* <FontAwesomeIcon icon={faReply} /> */}
          {
            sentFriendRequests && sentFriendRequests.includes(id) ?
              (
                <Button onClick={() => handleAddFriend(id)} disabled={true}>Pending</Button>
              )
              :
              (
                <div>
                  {pendingFriends && pendingFriends.includes(id) ?
                    (
                      <div style={{display: "flex", flexDirection:"row"}}>
                        <Button style={{marginRight: 20}} onClick={() => handleAcceptFriend(id)}>
                          <FontAwesomeIcon style={{fontSize: 16}} icon={faCheck}/>
                        </Button>
                        <Button onClick={() => handleDeclineFriend(id)}>
                          <FontAwesomeIcon style={{fontSize: 20}} icon={faTimes}/>
                        </Button>
                      </div>
                    )
                    :
                    (
                      <>
                        <Button onClick={() => handleAddFriend(id)} disabled={pending}>{pending ? "Pending" : (
                          <FontAwesomeIcon icon={faUserPlus}/>
                        )}</Button>
                      </>
                    )
                  }
                </div>
              )
          }
        </div>
      </Card.Body>
    </Card>
  )
}

const Friend = (props) => {
  const { friendId, docId, friendList, sentFriendRequests } = props
  const [friendProfile, setFriendProfile] = useState({})

  useEffect(() => {
    db.collection("users").doc(friendId).get().then((doc) => {
      if (doc) {
        // console.log(doc.data())
        setFriendProfile(doc.data())
      }
    })
  }, []);


  const handleRemoveFriend = (e) => {
    e.preventDefault()
    // console.log(friendList)
    db.collection("users").doc(docId).update({
      friendList: friendList.filter((friend) => friend != friendId && friend != docId)
    })

    db.collection("users").doc(friendId).update({
      friendList: friendList.filter((friend) => friend != docId && friend != friendId)
    })

    // db.collection("users").doc(docId).update({
    //   sentFriendRequests: sentFriendRequests.filter((friend) => friend != friendId)
    // })
    
  }

  return (
    <div className="friend-info">
      <img
        src={friendProfile.profileImage}
        style={{
          width: 40,
          height: 40,
          borderRadius: 20,
        }}
      />
      <div style={{ marginLeft: 15 }} className="name">
        {friendProfile.firstName} {friendProfile.lastName}
      </div>
      <div onClick={(e) => handleRemoveFriend(e)}>
        <FontAwesomeIcon icon={faTimesCircle} />
      </div>
    </div>
  )
}

const Dashboard = () => {
  const [error, setError] = useState("")
  const { currentUser, logout } = useAuth()
  const [docId, setDocId] = useState() //current User Firebase document id
  const [invalidate, setInvalidate] = useState(true)
  const [userList, setUserList] = useState([])
  const [invalidate2, setInvalidate2] = useState(true)
  const [invalidate3, setInvalidate3] = useState(true)
  const [invalidate4, setInvalidate4] = useState(true)
  const [listPendingFriends, setListPendingFriends] = useState([])
  const [friendList, setFriendList] = useState([])
  const [selectedFile, setSelectedFile] = useState(null)
  const [currentUserInfo, setCurrentUserInfo] = useState({})
  const allInputs = { imgUrl: '' }
  const [imageAsFile, setImageAsFile] = useState('')
  const [imageAsUrl, setImageAsUrl] = useState(allInputs)
  const [profileImageUrl, setProfileImageUrl] = useState("")
  const [invalidate5, setInvalidate5] = useState(true)
  const [open, setOpen] = useState(false)
  const [sentFriendRequests, setSentFriendRequests] = useState([])

  const classes = useStyles()
  const history = useHistory()

  useEffect(() => {
  if(docId){
    db.collection("users").doc(docId).onSnapshot((doc) => {
      if (doc.data().sentFriendRequests) {
        setSentFriendRequests(doc.data().sentFriendRequests)
      }
    })
  }
  }, [docId]);

  useEffect(() => {
    if (docId) {
      db.collection("users").doc(docId).get().then((doc) => {
        if (doc.data().profileImage) {
          // console.log(doc.data().profileImage)
          setProfileImageUrl(doc.data().profileImage)
        }
      })
      setInvalidate5(false)
    }
  }, [docId, invalidate5, imageAsUrl]);

  useEffect(() => {
    if (docId) {
      db.collection("users").doc(docId).onSnapshot((doc) => {
        if (doc.data().pendingFriends) {
          setListPendingFriends(doc.data().pendingFriends)
        }
      })
    }
  }, [docId]);

  useEffect(() => {
    if (invalidate) {
      db.collection("users").where("uid", "==", currentUser.uid)
        .onSnapshot((snapShot) => {
          snapShot.docs.map((doc) => setDocId(doc.id))
        })
      setInvalidate(false)
    }
  }, [invalidate]);

  useEffect(() => {
    db.collection("users").doc(docId).update({
      isOnline: true
    })
  }, [docId]);

  useEffect(() => {
    db.collection("users").doc(docId).onSnapshot((doc)=>{
      if(doc.data()){
        setCurrentUserInfo(doc.data())
      }
    })
  }, [docId]);
  

  useEffect(() => {
    if (listPendingFriends) {
      let newUserList = []
      db.collection("users").get().then((data) => {
        data.docs.map((doc) => {
          if (doc.data().uid != currentUser.uid && listPendingFriends.includes(doc.id)) {
            newUserList.push({ id: doc.id, user: doc.data(), pending: true })
          }
          else if (doc.data().uid != currentUser.uid) {
            newUserList.push({ id: doc.id, user: doc.data(), pending: false })
          }
        })
        // console.log(newUserList)
        setUserList(newUserList)
      })
      setInvalidate2(false)
    }
  }, [listPendingFriends]);

  useEffect(() => {
    if (docId) {
      db.collection("users").doc(docId).onSnapshot((doc) => {
        if (doc.data().friendList) {
          const filteredFriendList = doc.data().friendList.filter((friend) => friend != docId)
          setFriendList(filteredFriendList)
        }
      })
      setInvalidate4(false)
    }
  }, [docId, invalidate4]);

  const handleImageAsFile = (e) => {
    const image = e.target.files[0]
    setImageAsFile(imageAsFile => image)
  }

  const handleFirebaseUpload = (e) => {
    e.preventDefault()
    // console.log("Start to upload")
    if (imageAsFile === '') {
      // console.log(`not an image, the image file is type of ${typeof (imageAsFile)}`)
    }
    const uploadTask = storage.ref(`/images/${imageAsFile.name}`).put(imageAsFile)
    uploadTask.on("state_changed", (snapShot) => {
      // console.log(snapShot)
    }, (err) => {
      console.log(err)
    }, () => {
      storage.ref('images').child(imageAsFile.name).getDownloadURL()
        .then(fireBaseUrl => {
          setImageAsUrl(prevObject => ({ ...prevObject, imgUrl: fireBaseUrl }))
          db.collection("users").doc(docId).update({
            profileImage: fireBaseUrl
          })
        })
    })
    setOpen(false)
  }

  const changeProfilePic = (e) => {
    setOpen(true)
  }

  async function handleLogout(e){
    setError('')

    try{
      await logout()
      .then(() => {
        db.collection("users").doc(docId).update({
          isOnline: false
        })
      })
      await localStorage.clear()
      history.push('/login')
    }
    catch{
      setError("Failed to log out")
    }
  }

  return (
    <>
      {/* <Header /> */}
      <div className="card-container">
        <div className="side-dashboard">
          <div className="upper">
            <div style={{ position: "relative", top: "10%" }}>
              <div style={{ color: "white", fontSize: 25 }}><strong>{currentUserInfo && (`${currentUserInfo.firstName} ${currentUserInfo.lastName}`)}</strong></div>
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
                <Modal
                  open={open}
                  onClose={() => setOpen(false)}
                  className={classes.modal3}
                >
                  <div className={classes.paper4}>
                    <input type="file" onChange={handleImageAsFile} />
                    <button onClick={handleFirebaseUpload}>Upload</button>
                  </div>
                </Modal>
            <div onClick={changeProfilePic} className="profile-pic hover">
              <strong style={{ marginLeft: 20 }}>Change Profile Picture</strong>
            </div>
            <div className="chat hover">
              <strong style={{ marginLeft: 20 }}>
                <Link to="/chat" style={{ color: 'inherit', textDecoration: 'inherit' }}>Go to Messenger</Link>
              </strong>
            </div>
            <div className="friend-list">
              <strong style={{ marginLeft: 20, marginTop: 10, marginBottom: 10 }}>Friend List</strong>
              <div>
                {friendList && friendList.map((friendId) => {
                  return (
                    <Friend sentFriendRequests={sentFriendRequests} friendList={friendList} docId={docId} friendId={friendId} />
                  )
                })}
              </div>
            </div>
            <div className="update-profile hover">
              <span style={{ marginLeft: 20 }}>
                <Link to="/update-profile" style={{ color: 'inherit', textDecoration: 'inherit' }}>Update Profile</Link>
              </span>
            </div>
            
            <div onClick={(e) => handleLogout(e)} className="logout hover">
              <span onClick={(e) => handleLogout(e)} style={{ marginLeft: 20 }}>Logout</span>
            </div>
          </div>
        </div>
        <div className="main-page">
          <div className="heading">
            <span style={{fontSize: 60}}>Welcome to Messenger</span>
          </div>
          <div className="userlist">
            <div style={{height: 70, display:"flex", alignItems:"center"}}>
              <strong style={{marginLeft: 30, fontSize: 40}}>List of all current users</strong>
            </div>
            {userList && userList.map((user) => {
              if (!friendList.includes(user.id)) {
                return (
                  <User id={user.id} docId={docId} user={user.user} />
                )
              }
            })}
          </div>
        </div>
      </div>
      {/* <div className="w-100 text-center mt-2"> 
        <Button variant="link" onClick={handleLogout}>Log Out</Button>
      </div> */}
    </>
  );
}

export default Dashboard;
