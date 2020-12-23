import React, { useState, useEffect, useRef } from 'react';
import { Alert, Button, Card } from "react-bootstrap"
import { useAuth } from "../contexts/AuthContext"
import { Link, useHistory } from "react-router-dom"
import Header from '../chat/header/header';
import { db, storage } from '../../services/firebase';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCoffee, faReply } from '@fortawesome/free-solid-svg-icons'
import firebase from "firebase"
import "./Dashboard.css"

const User = (props) => {
  const { id, user, docId } = props
  const [pendingFriends, setPendingFriends] = useState([])
  const [sentFriendRequests, setSentFriendRequests] = useState([])
  const [pending, setPending] = useState()

  useEffect(() => {
    db.collection("users").doc(docId).get().then((doc) => {
      if (doc) {
        setPendingFriends(doc.data().pendingFriends)
      }
    })
  }, []);

  useEffect(() => {
    db.collection("users").doc(docId).get().then((doc) => {
      if (doc) {
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
      pendingFriends: pendingFriends.filter((friendId) => friendId != docId)
    })

    await db.collection("users").doc(docId).update({
      pendingFriends: pendingFriends.filter((friendId) => friendId != id)
    })
    console.log("Accepted", id)
  }

  const handleDeclineFriend = async (id) => {
    await db.collection("users").doc(id).update({
      pendingFriends: pendingFriends.filter((friendId) => friendId != docId)
    })

    await db.collection("users").doc(docId).update({
      pendingFriends: pendingFriends.filter((friendId) => friendId != id)
    })
  }

  return (
    <Card>
      <Card.Body>
        <div className="user-card">
          <div className="profile-image">
          </div>
          <div className="name">
            Name: {user.firstName} {user.lastName}
          </div>

          <div className="email">
            Email: {user.email}
          </div>

          <FontAwesomeIcon icon={faReply} />
          {
            sentFriendRequests && sentFriendRequests.includes(id) ?
              (
                <button onClick={() => handleAddFriend(id)} disabled={true}>Pending</button>
              )
              :
              (
                <div>
                  {pendingFriends && pendingFriends.includes(id) ?
                    (
                      <>
                        <button onClick={() => handleAcceptFriend(id)}>Accept</button>
                        <button onClick={() => handleDeclineFriend(id)}>Decline</button>
                      </>
                    )
                    :
                    (
                      <>
                        <button onClick={() => handleAddFriend(id)} disabled={pending}>{pending ? "Pending" : "Add Friend"}</button>
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
  const { friendId } = props
  const [friendProfile, setFriendProfile] = useState({})
  useEffect(() => {
    db.collection("users").doc(friendId).get().then((doc) => {
      if (doc) {
        console.log(doc.data())
        setFriendProfile(doc.data())
      }
    })
  }, []);

  return (
    <Card>
      <Card.Body>
        <div className="user-card">
          <div className="profile-image">
          </div>
          <div className="name">
            Name: {friendProfile.firstName} {friendProfile.lastName}
          </div>

          <div className="email">
            Email: {friendProfile.email}
          </div>
        </div>
      </Card.Body>
    </Card>
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

  const allInputs = { imgUrl: '' }
  const [imageAsFile, setImageAsFile] = useState('')
  const [imageAsUrl, setImageAsUrl] = useState(allInputs)
  const [profileImageUrl, setProfileImageUrl] = useState("") 
  const [invalidate5, setInvalidate5] = useState(true) 

  useEffect(() => {
    if(docId){
        db.collection("users").doc(docId).get().then((doc)=>{
          if(doc.data().profileImage){
            console.log(doc.data().profileImage)
            setProfileImageUrl(doc.data().profileImage)
          }
        })
        setInvalidate5(false)
      }
  }, [docId, invalidate5, imageAsUrl]);

  useEffect(() => {
    if (docId) {
      db.collection("users").doc(docId).get().then((doc) => {
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
          setInvalidate(false)
        })
    }
  }, [invalidate]);

  useEffect(() => {
    db.collection("users").doc(docId).update({
      isOnline: true
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
        console.log(newUserList)
        setUserList(newUserList)
      })
      setInvalidate2(false)
    }
  }, [listPendingFriends]);

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

  const handleImageAsFile = (e) => {
    const image = e.target.files[0]
    setImageAsFile(imageAsFile => image)
  }

  const handleFirebaseUpload = (e) => {
    e.preventDefault()
    console.log("Start to upload")
    if (imageAsFile === '') {
      console.log(`not an image, the image file is type of ${typeof (imageAsFile)}`)
    }
    const uploadTask = storage.ref(`/images/${imageAsFile.name}`).put(imageAsFile)
    uploadTask.on("state_changed", (snapShot) => {
      console.log(snapShot)
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
  }

  return (
    <>
      <Header />
      <Card>
        <Card.Body>
          <h2 className="text-center mb-4">Profile</h2>
          <strong>Profile Image: </strong>
          <div style={{display:"flex", flexDirection:"row", justifyContent:"space-around"}}>
            <div>
              <input type="file" onChange={handleImageAsFile} />
              <button onClick={handleFirebaseUpload}>Upload</button>
            </div>
            <div>
              <img
                  src={profileImageUrl}
                  style={{
                    width: 100,
                    height: 100,
                    borderRadius: 50,
                    position: "absolute"
                  }}
                />
            </div>
          </div> 

          <br></br>
          <br></br>
          {error && <Alert variant="danger">{error}</Alert>}
          <strong>Email: </strong> {currentUser.email}
          <br></br>
          <strong>DisplayName: </strong> {currentUser.displayName}
          <br></br>
          <strong>FriendList: </strong>
          <div className="pending-friend-list">
            {friendList && friendList.map((friendId) => {
              return (
                <Friend friendId={friendId} />
              )
            })}
          </div>
          {/* <strong>Friends List: {currentUser && currentUser.friendList.map((friend) => {
            return (
              <b>{friend.displayName}</b>
            )
          })}</strong>  */}
          <Link to="/update-profile" className="btn btn-primary w-100 my-3">Update Profile</Link>
          <Link to="/chat" className="btn btn-primary w-100 my-3">Go to Messenger</Link>
          <Link to="/todolist" className="btn btn-primary w-100 my-3">Go to TodoList</Link>
        </Card.Body>
      </Card>

      <div className="userlist">
        {userList && userList.map((user) => {
          if (!friendList.includes(user.id)) {
            return (
              <User id={user.id} docId={docId} user={user.user} />
            )
          }
        })}
      </div>
      {/* <div className="w-100 text-center mt-2"> 
        <Button variant="link" onClick={handleLogout}>Log Out</Button>
      </div> */}
    </>
  );
}

export default Dashboard;
