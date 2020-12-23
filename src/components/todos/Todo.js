import React from 'react';
import { useState } from 'react';
import { Button } from 'react-bootstrap';
import {db} from "../../services/firebase";
import { makeStyles } from '@material-ui/core';
import Modal from '@material-ui/core/Modal';


const useStyles = makeStyles((theme) => ({
  form:{
    display:'flex',
    marginBot: 10
  },
  button:{
    width: "50%",
    height:"25%"
  },
  paper: {
    position: 'absolute',
    width: 400,
    backgroundColor: theme.palette.background.paper,
    border: '2px solid #000',
    boxShadow: theme.shadows[5],
    padding: theme.spacing(2, 4, 3),
  },
}));
const Todo = (props) => {
  const {text, removeTodo, id} = props
  const [input, setInput] = useState("")
  const [open, setOpen] = useState(false)
  const classes = useStyles()

  const updateTodo = () =>{
    db.collection("todos").doc(id).update({
      todo: input
    })
  }

  return (
    <>
    <Modal
      open={open}
      onClose={() => setOpen(false)}
    >
      <div className={classes.paper}>
        <input value={input} onChange={(e) => setInput(e.target.value)}/>
        {/* <Button className={classes.button} onClick={() => setOpen(true)}>Update todo</Button> */}
        <Button onClick={updateTodo}>Update Todo</Button>
      </div>
    </Modal>
    <div style={{display:"flex", flexDirection:"row", width:"75%"}}>
      <li style={{marginBottom: 20}}>{text}</li>
      <Button className={classes.button} onClick={() => setOpen(true)}>Edit</Button>
      <Button className={classes.button} onClick={() => removeTodo(id)}>Delete</Button>
    </div>
    </>
  );
}

export default Todo;
