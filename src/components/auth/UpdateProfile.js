import React, {useRef, useState} from 'react';
import {Card, Form, Button, Alert} from 'react-bootstrap'
import { useAuth } from '../contexts/AuthContext';
import {Link, useHistory} from "react-router-dom";

const UpdateProfile = () => {
  const emailRef = useRef()
  const passwordRef = useRef()
  const passwordConfirmRef = useRef()
  const {updatePassword, updateEmail, currentUser} = useAuth()
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const [verified, setVerified] = useState(false)
  const history = useHistory()

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
    <>
      <Card>
        <Card.Body>
        <h2 className="text-center mb-4">Update Profile</h2>
        {currentUser && currentUser.email}
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
          <Button disabled={loading} className="w-100" type="submit">
            Update Profile
          </Button>
        </Form>

        </Card.Body>
      </Card>
      <div className="w-100 text-center mt-2">
        <Link to="/">Cancel</Link>
      </div>
    </>
  );
}

export default UpdateProfile;
