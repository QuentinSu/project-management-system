import { Link, NavLink } from 'react-router-dom';
import React, {Component} from 'react';
import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';
import axios from 'axios';
import MenuItem from '@material-ui/core/MenuItem';
import Select from '@material-ui/core/Select';
import Card from '@material-ui/core/Card';
import SaveIcon from '@material-ui/icons/Save';
import DeleteIcon from '@material-ui/icons/Delete';
import AddIcon from '@material-ui/icons/Add';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';
import Typography from '@material-ui/core/Typography';
import InputLabel from '@material-ui/core/InputLabel';
import { MuiThemeProvider, createMuiTheme } from 'material-ui/styles';
import {CopyToClipboard} from 'react-copy-to-clipboard';
import FormControl from '@material-ui/core/FormControl';
import Paper from '@material-ui/core/Paper';


var config = require('./config.json');

const apiBaseUrl = config.apiBaseUrl;
const greenTheme = createMuiTheme({ palette: { primary: {main: '#00984C',contrastText: '#fff'} } })

// CLASS TO RENDER ALL THE TESTIMONIALS

class MailsManagement extends Component {
    constructor(props){
      super(props);
      this.state={
          mails: [],
          trigger: true,
          open: false,
          newName: null,
          newContent: null,
          newType: 'custom',
      }
    };

    updateMails() {
        var self = this;
        axios({
            method: 'get', //you can set what request you want to be
            url: apiBaseUrl+'mailpreformat',
            headers: {
              Authorization: 'Bearer ' + localStorage.getItem('session'),
              'Content-Type': 'application/json; charset=utf-8'
            }
          })
            .then(function (response) {
              if(response.status === 200){
                self.setState({mails:response.data});
                this.forceUpdate();
              }
            })
            .catch(function (error) {
            });
    }

    componentDidMount() {
        var self = this;
        axios({
            method: 'get', //you can set what request you want to be
            url: apiBaseUrl+'mailpreformat',
            headers: {
              Authorization: 'Bearer ' + localStorage.getItem('session'),
              'Content-Type': 'application/json; charset=utf-8'
            }
          })
            .then(function (response) {
              if(response.status === 200){
                self.setState({mails:response.data});
              }
            })
            .catch(function (error) {
            });
    }

    saveNewMail() {
        var self = this;
        console.log(this.state.newType);
        axios({
            method: 'post', //you can set what request you want to be
            url: apiBaseUrl+'mailpreformat',
            headers: {
              Authorization: 'Bearer ' + localStorage.getItem('session'),
              'Content-Type': 'application/json; charset=utf-8'
            },
            data: {
                "name": this.state.newName,
                "type": this.state.newType,
                "content": this.state.newContent
                
            }
          })
            .then(function (response) {
              if(response.status === 200){
                self.setState({ open: false });
                self.updateMails();
                console.log(response);
              }
            })
            .catch(function (error) {
            });
    }

    render(){
        let mappedMails = this.state.mails.map((mail)=>{
          return <MailManagement   key={mail.id}
                            id={mail.id}
                            name={mail.name}
                            content={mail.content}
                            type={mail.type}
                            updateMails={this.updateMails.bind(this)}
                />     
        })
        
            var button = 
            <Button onClick={() => this.setState({ open: true })} color="primary" className='new-button'>
                <AddIcon />
                Mail preformatted
            </Button>
        return(
            <div>
                {button}
                <Dialog
                    open={this.state.open}
                    maxWidth="lg"
                    aria-labelledby="form-dialog-title"
                    fullWidth
                >
                    <DialogTitle id="new-project-dialog-title">New Testimonial</DialogTitle>
                    <DialogContent>
                    <DialogContentText>
                        To create a new preformatted mail, please fill all fields<br></br>
                        <small>You can go <a href="https://unicode-table.com/en/sets/" target="_blank">there</a> to pick emotes and symbols for your content!</small>
                    </DialogContentText>
                    <Select
                        className="type-select"
                        onChange={(event) => this.setState({newType:event.target.value})}
                        name="type"
                        value={this.state.newType}
                        label="Type"
                        inputProps={{  
                            id: "newTsype",
                        }}
                        fullWidth
                    >
                        <MenuItem value='3m'>3 months to go</MenuItem>
                        <MenuItem value='6m'>6 months to go</MenuItem>
                        <MenuItem value='custom'>Custom template</MenuItem>
                    </Select>
                    <TextField
                        fullWidth
                        autoFocus
                        margin="dense"
                        id="name"
                        label="Name"
                        required
                        onChange = {(event) => this.setState({newName:event.target.value})}
                    />
                    <TextField
                        margin="dense"
                        id="content"
                        label="Content"
                        required
                        multiline
                        rows="15"
                        onChange = {(event) => this.setState({newContent:event.target.value})}
                        fullWidth
                    />
                    </DialogContent>
                    <DialogActions>
                    <Button onClick={() => this.setState({ open: false })} color="primary">
                        Cancel
                    </Button>
                    <Button 
                        onClick={() => this.saveNewMail()}
                        color="primary">
                        Save
                    </Button>
                    </DialogActions>
                </Dialog>
                <Paper  color="primary" className='company-stats' square={false}>💡 You can go <a href="https://unicode-table.com/en/sets/" target="_blank">there</a> to pick emots and symbols for you content!</Paper>
                <p></p>
                {mappedMails}
            </div>
        );
    }
  }

  class MailManagement extends Component {
    constructor(props){
        super(props);
        this.state={
            id: props.id,
            content: props.content,
            name: props.name,
            type: props.type,
            copied: false,
            openDelete: false
        }
    }

    saveMail() {
        var self = this;
        axios({
            method: 'put', //you can set what request you want to be
            url: apiBaseUrl+'mailpreformat/'+this.state.id,
            headers: {
              Authorization: 'Bearer ' + localStorage.getItem('session'),
              'Content-Type': 'application/json; charset=utf-8'
            },
            data: {
                "content": this.state.content,
                "name": this.state.name,
                "type": this.state.type
            }
          })
            .then(function (response) {
              if(response.status === 200){
                self.props.updateMails();
              }
            })
            .catch(function (error) {
              console.log(error.response)
            });
    }

    deleteMail() {
        var self = this;
        axios({
            method: 'delete', //you can set what request you want to be
            url: apiBaseUrl+'mailpreformat/'+this.state.id,
            headers: {
              Authorization: 'Bearer ' + localStorage.getItem('session'),
              'Content-Type': 'application/json; charset=utf-8'
            }
          })
            .then(function (response) {
              if(response.status === 200){
                self.setState({ openDelete: false });
                self.props.updateMails();
              }
            })
            .catch(function (error) {
            });
    }

    render() {
        return (
            <Card className='mail-card'>
        <div>
            <TextField
                disabled
                defaultValue={this.state.id}
                label='ID'
            />&nbsp;
            <FormControl>
              <InputLabel htmlFor="type">Type</InputLabel>
              <Select
                  className="type-select"
                  value={this.state.type}
                  onChange={(event) => {this.setState({type:event.target.value})}}
                  name="type"
                  label="Type"
                  inputProps={{  
                      id: "type",
                  }}
                  >
                  <MenuItem value='3m'>3 months to go</MenuItem>
                  <MenuItem value='6m'>6 months to go</MenuItem>
                  <MenuItem value='custom'>Custom template</MenuItem>
              </Select>
            </FormControl>
            <TextField fullWidth
                onChange={event => this.setState({name:event.target.value})}
                defaultValue={this.state.name}
                label='Name'
            />
            <TextField fullWidth
                onChange={event => this.setState({content:event.target.value})}
                multiline
                rows="15"
                defaultValue={this.state.content}
                label='Content'
            />
            </div>
            <div className='mail-buttons'>
              {this.state.copied ? <span style={{color: 'red'}}>Copied.</span> : null}
              <CopyToClipboard text={this.state.name+"\n\n"+this.state.content}
                onCopy={() => this.setState({copied: true})}>
                <Button variant="outlined">Copy name + content</Button>
              </CopyToClipboard>
                <Button 
                    className="save-button"
                    size="small"
                    color="primary" 
                    onClick={() => this.saveMail()}>
                    <SaveIcon/> Save
                </Button>
                <Button 
                    onClick={() => this.setState({ openDelete: true })} 
                    size="small"
                    color="secondary" 
                    className='delete-button'>
                    <DeleteIcon /> Delete

                    
                </Button>
                <Dialog
                    open={this.state.openDelete}
                    aria-labelledby="form-dialog-title"
                >
                <DialogTitle id="new-project-dialog-title">Delete</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                    Are you really sure you want to delete this preformatted mail ? This operation can't be reverted
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => this.setState({ openDelete: false })} color="primary">
                    Cancel
                    </Button>
                    <Button 
                    onClick={() => this.deleteMail()}
                    color="secondary"
                    variant="contained">
                    Delete
                    </Button>
                </DialogActions>
                </Dialog>
            </div>
        </Card>
        );
    }

}

export default MailsManagement;