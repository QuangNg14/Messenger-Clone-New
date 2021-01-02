import React, {useRef, useState} from 'react';
import {Card, Form, Button, Alert} from 'react-bootstrap';
import { useAuth } from '../contexts/AuthContext';
import {Link, useHistory} from "react-router-dom";

const ForgotPassword = () => {
  const emailRef = useRef()
  const {resetPassword} = useAuth()
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const [verified, setVerified] = useState(false)
  const [message, setMessage] = useState("")

  async function handleSubmit(e){
    e.preventDefault()

    try{
      setMessage("")
      setError("")
      setLoading(true)
      await resetPassword(emailRef.current.value)
      setMessage("Check your email for further instructions")
    }
    catch{
      setError("Failed to reset password")
    }
    setLoading(false)
  }
  
  return (
    <div className="loginWrap">
      <Card style={{width: 400, height: 300}}>
        <Card.Body>
        <h2 className="text-center mb-4">Password Reset</h2>
        {error && <Alert variant="danger">{error}</Alert>}
        {message && <Alert variant="success">{message}t</Alert>}

        <Form onSubmit={handleSubmit}>
          <Form.Group id="email">
            <Form.Label>Email</Form.Label>
            <Form.Control type="email" ref={emailRef} required></Form.Control>
          </Form.Group>

          <Button disabled={loading} className="w-100" type="submit">
            Reset Password
          </Button>
        </Form>
        <div className="w-100 text-center mt-3">
          <Link to="/login">Login</Link>
        </div>

        </Card.Body>
      </Card>
      <div className="w-100 text-center mt-2">
        Need an account? <Link to="/signup">Sign up</Link>
      </div>
    </div>
  );
}

export default ForgotPassword;
