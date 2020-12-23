import React,{useState, useEffect} from 'react';
import './header.css'
import { useAuth } from '../../contexts/AuthContext';
import { Link, useHistory } from 'react-router-dom';
import { Alert, Button } from 'react-bootstrap';
import {db} from "../../../services/firebase"

const Header = () => {
  const [error, setError] = useState("")
  const {currentUser, logout} = useAuth()
  const history = useHistory()
  
  const [docId, setDocId] = useState()
  const [invalidate, setInvalidate] = useState(true)
  
  useEffect(() => {
    if(invalidate){
      db.collection("users").where("uid", "==", currentUser.uid)
      .onSnapshot((snapShot)=>{
        snapShot.docs.map((doc)=>setDocId(doc.id))
        setInvalidate(false)
      })
    }
  }, [invalidate]);

  useEffect(() => {
      db.collection("users").doc(docId).update({
        isOnline:true
      })
  }, [docId]);
  
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
    <header className="header">
        <div style={{display: 'flex'}}>
          <div className="logo">Web Messenger</div>
          {error && <Alert variant="danger">{error}</Alert>}
            {
              !currentUser ? 
              <ul className="leftMenu">
                <li><Link to='/login'>Login</Link></li>
                <li><Link to='/signup'>Sign up</Link></li>
              </ul> : null
            }     
        </div>
          <div style={{margin: '20px 0', color: '#fff', fontWeight: 'bold'}}>
            {currentUser ? `Hi ${currentUser.displayName}` : ''}
          </div>
        <ul className="menu">
            {
              currentUser ?
              <li>
                <Button onClick={handleLogout}>Logout</Button>
            </li> : null
            } 
        </ul>
    </header>
  );
}

export default Header;
