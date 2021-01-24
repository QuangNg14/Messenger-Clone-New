import React, { useRef, useState, useEffect } from 'react';
import { Card, Form, Button, Alert } from 'react-bootstrap';
import { useAuth } from '../contexts/AuthContext';
import { Link, useHistory } from "react-router-dom";
import { db } from '../../services/firebase';

const Login = () => {
  const emailRef = useRef()
  const passwordRef = useRef()
  const { login, currentUser } = useAuth()
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const [verified, setVerified] = useState(false)
  const history = useHistory()
  async function handleSubmit(e) {
    e.preventDefault()

    try {
      setError("")
      setLoading(true)
      await login(emailRef.current.value, passwordRef.current.value)
      .then((data) => {
        const name = data.user.displayName.split(" ");
        const firstName = name[0];
        const lastName = name[1];

        const loggedInUser = {
            firstName,
            lastName,
            uid: data.user.uid,
            email: data.user.email
        }

        localStorage.setItem('user', JSON.stringify(loggedInUser));
      })

      history.push("/")
    }
    catch {
      setError("Failed to login. Please check your password or username and try again")
    }
    setLoading(false)
  }

  return (
    <div className="loginWrap">
      <h2 style={{marginBottom: 50}}>Welcome to Messenger Clone</h2> 
      <h4 style={{marginBottom: 40}}>Product by Quang Nguyen</h4> 

      <Card style={{width: 400, height: 400}}>
        <Card.Body>
          <h2 className="text-center mb-4">Log in</h2>
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

            <Button disabled={loading} className="w-100" type="submit">
              Log in
          </Button>
          </Form>
          <div className="w-100 text-center mt-3">
            <Link to="/forgot-password">Forgot Password</Link>
          </div>

          <div className="w-100 text-center mt-2">
            Need an account? <Link to="/signup">Sign up</Link>
          </div>
        </Card.Body>
      </Card>
    </div>
  );
}

export default Login;
