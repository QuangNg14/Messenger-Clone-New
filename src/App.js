import React, { useState } from 'react';
import { AuthProvider } from './components/contexts/AuthContext';
import {Container} from 'react-bootstrap'
import Signup from './components/auth/Signup';
import Dashboard from './components/auth/Dashboard';
import Login from './components/auth/Login';
import PrivateRoute from './components/auth/PrivateRoute';
import ForgotPassword from './components/auth/ForgotPassword';
import UpdateProfile from './components/auth/UpdateProfile';
import TodoList from './components/todos';
import Header from "./components/chat/header/header"
import HomePage from './components/chat/HomePage';
import { Route, Switch } from 'react-router-dom';
const App = () => {
  return (
    <div 
      className="d-flex"
      style = {{minHeight:"100vh", height:"auto"}}
    >
      <div className="w-100">
        <AuthProvider>
          <Switch>
            <PrivateRoute exact path = "/" component={Dashboard}/>
            <PrivateRoute path = "/update-profile" component={UpdateProfile}/>
            <PrivateRoute path = "/chat" component={HomePage}/>
            <Route path="/signup" component={Signup}/>
            <Route path="/login" component={Login}/>
            <Route path="/todolist" component={TodoList}/>
            <Route path="/forgot-password" component={ForgotPassword}/>
          </Switch>
        </AuthProvider>
      </div>
    </div>

  )
}

export default App;
