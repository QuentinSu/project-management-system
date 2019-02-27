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
import { MuiThemeProvider, createMuiTheme } from 'material-ui/styles'


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
          newType: null
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
        console.log('je suis passé par ici :)');
        var self = this;
        axios({
            method: 'post', //you can set what request you want to be
            url: apiBaseUrl+'mailpreformat',
            headers: {
              Authorization: 'Bearer ' + localStorage.getItem('session'),
              'Content-Type': 'application/json; charset=utf-8'
            },
            data: {
                "name": this.state.newName,
                "content": this.state.newContent,
                "type": this.state.newType
            }
          })
            .then(function (response) {
              if(response.status === 200){
                self.setState({ open: false });
                self.updateMailsManagement();
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
                    aria-labelledby="form-dialog-title"
                    fullWidth
                >
                    <DialogTitle id="new-project-dialog-title">New Testimonial</DialogTitle>
                    <DialogContent>
                    <DialogContentText>
                        To create a new preformatted mail, please fill all fields
                    </DialogContentText>
                    <TextField
                        style={{height:'175px'}}
                        multiline
                        autoFocus
                        margin="dense"
                        id="name"
                        label="Name"
                        required
                        onChange = {(event) => this.setState({newName:event.target.value})}
                        fullWidth
                    />
                    <TextField
                        margin="dense"
                        id="content"
                        label="Content"
                        required
                        onChange = {(event) => this.setState({newContent:event.target.value})}
                        fullWidth
                    />
                    <Select
                        className="status-select"
                        onChange={(event) => {this.setState({newType:event.target.value})}}
                        name="type"
                        inputProps={{  
                            id: 'type',
                        }}
                        >
                        <MenuItem value='3m'>3 months to go</MenuItem>
                        <MenuItem value='6m'>6 months to go</MenuItem>
                        <MenuItem value='custom'>Custom template</MenuItem>
                        </Select>
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
            openDelete: false
        }
    }

    saveMail() {
        var self = this;
        axios({
            method: 'put', //you can set what request you want to be
            url: apiBaseUrl+'mailpreformated/'+this.state.id,
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
            });
    }

    deleteMail() {
        var self = this;
        axios({
            method: 'delete', //you can set what request you want to be
            url: apiBaseUrl+'mailpreformated/'+this.state.id,
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
            />
            <TextField fullWidth
                onChange={event => this.setState({name:event.target.value})}
                defaultValue={this.state.name}
                label='Name'
            />
            <TextField fullWidth
                onChange={event => this.setState({content:event.target.value})}
                multiline
                defaultValue={this.state.content}
                label='Content'
            />
            {this.props.isClient && 
            <div>
                <Typography>
                {this.state.content}
                </Typography>
                <Typography color="textSecondary">
                    Name: {this.state.name}
                </Typography>
            </div>     
            }
            </div>
            {!this.props.isClient &&
            <div className='ticket-buttons'>
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
            }
        </Card>
        );
    }

}

export default MailsManagement;