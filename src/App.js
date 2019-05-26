import React, {Component} from 'react';
import { withAuthenticator } from 'aws-amplify-react';
import {API, graphqlOperation} from "aws-amplify";
import { createNote, updateNote, deleteNote } from './graphql/mutations';
import { listNotes }  from './graphql/queries';
import {onCreateNote, onDeleteNote, onUpdateNote} from './graphql/subscriptions';
class App extends Component {
  state = {
    id: "",
    note: "",
    notes: [
  ]
  };
  componentDidMount(){
      this.getNotes();
      this.createNoteListner = API.graphql(graphqlOperation(onCreateNote)).subscribe({
        next: noteData => {
          const newNote = noteData.value.data.onCreateNote;
          const prevNotes = this.state.notes.filter(
            note => note.id !== newNote.id
          );
          const updatedNotes = [...prevNotes, newNote];
          this.setState({ notes: updatedNotes });
        }
      });
      this.deleteNoteListener = API.graphql(graphqlOperation(onDeleteNote)).subscribe({
        next: noteData => {
          const deletedNote = noteData.value.data.onDeleteNote;
          const updatedNotes = this.state.notes.filter(note => note.id !== 
            deletedNote.id)
            this.setState({notes: updatedNotes});
        }
      });
      this.updateNoteListner = API.graphql(graphqlOperation(onUpdateNote)).subscribe({
        next: noteData => {
          const { notes } = this.state;
          const updatedNote = noteData.value.data.onUpdateNote;
          const index = this.state.notes.findIndex(note => note.id === updatedNote.id);
          const updatedNotes = [
            ...notes.slice(0, index),
            updatedNote,
            ...notes.slice(index + 1)
          ];
          this.setState({notes: updatedNotes, note: "", id: ""});
        }
      }
      );
  }
  componentWillUnmount(){
    this.createNoteListner.unsubscribe();
    this.deleteNoteListener.unsubscribe();
    this.updateNoteListner.unsubscribe();
  }
  
  getNotes = async() =>{
    const result = await API.graphql(graphqlOperation(listNotes));
    this.setState({notes: result.data.listNotes.items});
  }

  handleChangeNote = event => this.setState({
      note: event.target.value
    })
  
    hasExistingNote = () => {
     const {notes, id} = this.state;
     if(id){
        const isNote = notes.findIndex(note => note.id === id) > -1;
        return isNote;
     }
     return false;
    }
    
    handleUpdateNote = async () => {
      const { notes, id, note } = this.state;
      const input = {id, note};
      await API.graphql(graphqlOperation(updateNote, {input: input}));
      //const result = await API.graphql(graphqlOperation(updateNote, {input: input}));
      //console.log("result" +result.data.updateNote);
      //const updateExistingNote = result.data.updateNote;
      //const index = notes.findIndex(note => note.id === updateExistingNote.id);
      //const updatedNotes = [
      //  ...notes.slice(0, index),
      //  updateExistingNote,
      //  ...notes.slice(index + 1)
      //];
      //this.setState({notes: updatedNotes, note: "", id: ""});
    };

  handleAddNote = async event => {
    const { note, notes } = this.state;
    event.preventDefault()    
    if(this.hasExistingNote()) {
      this.handleUpdateNote();
    }
    else{
      const input= {
        note : note
      };
      
      await API.graphql(graphqlOperation(createNote, {input:input}));
      //const result = await API.graphql(graphqlOperation(createNote, {input:input}));
      //const newNote = result.data.createNote;
      //const updatedNotes = [newNote, ...notes];
      this.setState({ note: ""});
    }
  }

  handleDeleteNote = async noteId => {
    //const { notes } = this.state;
    const input = {id: noteId};
    await API.graphql(graphqlOperation(deleteNote, {input}));
    //const result = await API.graphql(graphqlOperation(deleteNote, {input}));
    //const deletedNoteId = result.data.deleteNote.id;
    //const updatedNotes = notes.filter(note => note.id !== deletedNoteId);
    //this.setState({notes: updatedNotes});
  }

  handleSetNode = ({note, id}) => {
    this.setState({note, id});
  };

  render(){
    const {id, notes, note} = this.state;
  return    (
    
  <div className="flex
    flex-column
    items-center justify-center pa3
    bg-washed-red">
      <h1 className="code.f2-l">Amplify Notetaker</h1>
      <form onSubmit={this.handleAddNote} className="mb5">
        <input type="text"
        className="pa2 f4"
        placeholder="write your note"
        onChange={this.handleChangeNote}
        value = {note} ></input>
        <button className="pa2 f4" type="submit">
          {id ? "Update Note" : "Add Note"}
        </button>
      </form>
      <div>
        {notes.map(item => (
          <div key={item.id}
            className="flex items-center">
              <li onClick = {() => this.handleSetNode(item)} className="list pa1 f3">
                {item.note}</li>
                <button className="bg-transparent
                        bn f4"
                        onClick={() => this.handleDeleteNote(item.id)}>
                      <span>&times;</span>                          
                </button>              
            </div>
        ))}
      </div>
      
    </div>

  )}


}


export default withAuthenticator(App, { includeGreetings: true});
