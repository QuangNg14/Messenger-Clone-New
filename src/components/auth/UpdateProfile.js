import React, {useRef, useState, useEffect} from 'react';
import {Card, Form, Button, Alert} from 'react-bootstrap'
import { useAuth } from '../contexts/AuthContext';
import {Link, useHistory} from "react-router-dom";
import { db, storage } from '../../services/firebase';

const UpdateProfile = () => {
  const emailRef = useRef()
  const passwordRef = useRef()
  const passwordConfirmRef = useRef()
  const firstNameRef = useRef()
  const lastNameRef = useRef()
  const {updatePassword, updateEmail, currentUser} = useAuth()
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const [verified, setVerified] = useState(false)
  const [invalidate, setInvalidate] = useState(true)
  const [docId, setDocId] = useState("")
  const history = useHistory()

  useEffect(() => {
    if (invalidate) {
      db.collection("users").where("uid", "==", currentUser.uid)
        .onSnapshot((snapShot) => {
          snapShot.docs.map((doc) => setDocId(doc.id))
          setInvalidate(false)
        })
    }
  }, [invalidate]);

  //luôn set loading trước async function 
  function handleSubmit(e){
    e.preventDefault()
    setError("")
    if(passwordRef.current.value !== passwordConfirmRef.current.value){
      return setError("Passwords do not match")
      //set the error only 1 time
    }

    const promises = [] //async
    setLoading(true)
    if(emailRef.current.value !== currentUser.email){
      promises.push(updateEmail(emailRef.current.value))
    }

    if(passwordRef.current.value){
      promises.push(updatePassword(passwordRef.current.value))
    }

    if(firstNameRef.current.value && docId){
      promises.push(
        db.collection("users").doc(docId).update({
          firstName: firstNameRef.current.value 
        })
      )
    }

    if(lastNameRef.current.value && docId){
      promises.push(db.collection("users").doc(docId).update({
        lastName: lastNameRef.current.value 
      })
      )
    }

    //promise all chỉ run .then() nếu all promises đã run xong và success
    Promise.all(promises).then(()=>{
      history.push('/')
    }).catch(() => {
      setError("Failed to update account")
    }).finally(() => { //run khi success or fail
      setLoading(false)
    })
  }
  return (
    <div className="loginWrap">
      <Card style={{width: 400, height: 600}}>
        <Card.Body>
        <h2 className="text-center mb-4">Update Profile</h2>
        {/* {currentUser && currentUser.email} */}
        {error && <Alert variant="danger">{error}</Alert>}
        {verified && <Alert variant="success">A verification has been sent</Alert>}

        <Form onSubmit={handleSubmit}>
          <Form.Group id="email">
            <Form.Label>Email</Form.Label>
            <Form.Control type="email" ref={emailRef} defaultValue={currentUser.email}></Form.Control>
          </Form.Group>

          <Form.Group id="password">
            <Form.Label>Password</Form.Label>
            <Form.Control type="password" ref={passwordRef} placeholder="leave blank to keep the same"></Form.Control>
          </Form.Group>

          <Form.Group id="password-confirm">
            <Form.Label>Password Confirmation</Form.Label>
            <Form.Control type="password" ref={passwordConfirmRef} placeholder="leave blank to keep the same"></Form.Control>
          </Form.Group>

          <Form.Group id="firstname">
            <Form.Label>First Name</Form.Label>
            <Form.Control type="text" ref={firstNameRef} placeholder="leave blank to keep the same"></Form.Control>
          </Form.Group>

          <Form.Group id="lastname">
            <Form.Label>Last Name</Form.Label>
            <Form.Control type="text" ref={lastNameRef} placeholder="leave blank to keep the same"></Form.Control>
          </Form.Group>
          <Button disabled={loading} className="w-100" type="submit">
            Update Profile
          </Button>
        </Form>

        </Card.Body>
      </Card>
      <div className="w-100 text-center mt-2">
        <Link to="/">Cancel</Link>
      </div>
    </div>
  );
}

export default UpdateProfile;
