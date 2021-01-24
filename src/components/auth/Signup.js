import React, {useRef, useState} from 'react';
import {Card, Form, Button, Alert} from 'react-bootstrap'
import { useAuth } from '../contexts/AuthContext';
import {Link, useHistory} from "react-router-dom";
import { db } from '../../services/firebase';

const Signup = () => {
  const emailRef = useRef()
  const passwordRef = useRef()
  const passwordConfirmRef = useRef()
  const firstNameRef = useRef()
  const lastNameRef = useRef()
  const {signup, currentUser} = useAuth()
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const [verified, setVerified] = useState(false)
  const history = useHistory()

  async function handleSubmit(e){
    e.preventDefault()

    if(passwordRef.current.value !== passwordConfirmRef.current.value){
      return setError("Passwords do not match")
      //set the error only 1 time
    }

    try{
      setError("")
      setLoading(true)
      let result = await signup(emailRef.current.value, passwordRef.current.value)
      await result.user.updateProfile({
        displayName: firstNameRef.current.value + " " + lastNameRef.current.value
      })
      // await result.user.sendEmailVerification()
      await db.collection("users").add({
        email: emailRef.current.value,
        firstName: firstNameRef.current.value,
        lastName: lastNameRef.current.value,
        uid: result.user.uid,
        createdAt: new Date(),
        isOnline: true,
        profileImage: "https://i.pinimg.com/originals/e0/7a/22/e07a22eafdb803f1f26bf60de2143f7b.png",
        friendList: [],
        pendingFriends: [],
      })
      const loggedInUser = {
        firstName: firstNameRef.current.value,
        lastName: lastNameRef.current.value,
        uid: result.user.uid,
        email: result.user.email
      }
      await localStorage.setItem("user", JSON.stringify(loggedInUser))
      // console.log("log in successfully")
      setVerified(true)
      history.push("/")
    }
    catch{
      setError("Failed to create an account. Password must be at least 6 characters or username already existed")
    }
    // console.log(currentUser)
    setLoading(false)
  }
  return (
    <div className="loginWrap">
      <Card style={{width: 500, height: 600}}>
        <Card.Body>
        <h2 className="text-center mb-4">Sign Up</h2>
        {currentUser && currentUser.email}
        {error && <Alert variant="danger">{error}</Alert>}
        {verified && <Alert variant="success">A verification has been sent</Alert>}

        <Form onSubmit={handleSubmit}>
          <Form.Group id="email">
            <Form.Label>Email</Form.Label>
            <Form.Control type="email" ref={emailRef} required></Form.Control>
          </Form.Group>

          <Form.Group id="password">
            <Form.Label>Password</Form.Label>
            <Form.Control type="password" ref={passwordRef} required></Form.Control>
          </Form.Group>

          <Form.Group id="password-confirm">
            <Form.Label>Password Confirmation</Form.Label>
            <Form.Control type="password" ref={passwordConfirmRef} required></Form.Control>
          </Form.Group>

          <Form.Group id="first-name">
            <Form.Label>First Name</Form.Label>
            <Form.Control type="first-name" ref={firstNameRef} required></Form.Control>
          </Form.Group>

          <Form.Group id="last-name">
            <Form.Label>Last Name</Form.Label>
            <Form.Control type="last-name" ref={lastNameRef} required></Form.Control>
          </Form.Group>
          <Button disabled={loading} className="w-100" type="submit">
            Sign Up
          </Button>
        </Form>

        <div className="w-100 text-center mt-2">
          Already have an account? <Link to="/login">Log in</Link>
        </div>
        </Card.Body>
      </Card>
    </div>
  );
}

export default Signup;
