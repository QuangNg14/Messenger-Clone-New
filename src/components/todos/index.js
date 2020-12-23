import React, { useEffect, useRef, useState } from 'react';
import { Button, Card, Form } from 'react-bootstrap';
import { makeStyles } from '@material-ui/core';
import Todo from './Todo';
import {db} from "../../services/firebase"
import firebase from "firebase"
const useStyles = makeStyles(() => ({
  form:{
    display:'flex',
    marginBot: 10
  },
  button:{
    width: "50%",
    height:"50%"
  }
}));

const TodoList = () => {
  //when the app loads, we need to listen to the database and fetch new todos as they get added
  const itemRef = useRef()
  const classes = useStyles()
  const [todolist, setTodoList] = useState([])
  const [invalidate, setInvalidate] = useState(true)

  const addTodo = (e) =>{
    e.preventDefault()
    // setTodoList([...todolist, itemRef.current.value])
    db.collection("todos").add({
      todo: itemRef.current.value,
      timestamp: firebase.firestore.FieldValue.serverTimestamp()
    })
    itemRef.current.value = ""
  }

  const removeTodo = (id) =>{
    db.collection("todos").doc(id).delete()
  }

  useEffect(() => {
    if(invalidate){
      db.collection("todos").orderBy("timestamp", "desc").onSnapshot((snapshot)=>{
          setTodoList(snapshot.docs.map((doc) => ({id: doc.id, todo: doc.data().todo})))
          setInvalidate(false)
        })
    }

  }, [invalidate]);

  return (
    <>
    <h2>TodoList</h2>
    <Form className={classes.form} onSubmit={addTodo}>
      <Form.Group style={{marginBot: 10}} id="email">
        <Form.Control type="newitem" required ref={itemRef}/>
      </Form.Group>
      <Button className={classes.button} type="submit">Add Item</Button>
    </Form>

    <Card>
      <Card.Body>
        <ul>
          {todolist && todolist.map((todo)=>{
            return <Todo id={todo.id} removeTodo={removeTodo} text={todo.todo}/>
          })}
        </ul>
      </Card.Body>
    </Card>
    </>
  );
}

export default TodoList;
