import React from 'react';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';
import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';
import AddIcon from '@material-ui/icons/Add';
import DeleteIcon from '@material-ui/icons/Delete';
import axios from 'axios';
import { MuiThemeProvider, createMuiTheme } from 'material-ui/styles'
import MenuItem from '@material-ui/core/MenuItem';
import Select from '@material-ui/core/Select';
import InputLabel from '@material-ui/core/InputLabel';
import FormHelperText from '@material-ui/core/FormHelperText';
import FormControl from '@material-ui/core/FormControl';

var config = require('./config.json');

const apiBaseUrl = config.apiBaseUrl;
const blueTheme = createMuiTheme({ palette: { primary: {main: '#007CBA'} } })

// TICKET DIALOG

export class DeleteFileDialog extends React.Component {
  state = {
    open: false,
  };

  handleClickOpen = () => {
    this.setState({ open: true });
  };

  render() {
    return (
      <div>
        <Button 
          onClick={this.handleClickOpen} 
          size="small"
          color="secondary" 
          className='delete-button'>
              <DeleteIcon />
        </Button>
        <Dialog
          open={this.state.open}
          onClose={this.handleClose}
          aria-labelledby="form-dialog-title"
        >
          <DialogTitle id="new-project-dialog-title">Delete</DialogTitle>
          <DialogContent>
            <DialogContentText>
              Are you really sure you want to delete this file ? This operation can't be reverted
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => this.setState({ open: false })} color="primary">
              Cancel
            </Button>
            <Button 
              onClick={this.props.deleteFile}
              color="secondary"
              variant="contained">
              Delete
            </Button>
          </DialogActions>
        </Dialog>
      </div>
    );
  }
}

export class DeleteTicketDialog extends React.Component {
    state = {
      open: false,
    };
  
    handleClickOpen = () => {
      this.setState({ open: true });
    };

    deleteTicket = () => {
        var self = this;
        axios({
            method: 'delete', //you can set what request you want to be
            url: apiBaseUrl+'project/'+self.props.projectId+'/ticket/'+self.props.ticketId,
            headers: {
              Authorization: 'Bearer ' + localStorage.getItem('session'),
              'Content-Type': 'application/json; charset=utf-8'
            }
        }).then(function (response) {
            if(response.status === 200){
                self.setState({ open: false });
                self.props.handleProjectChange('deleteTicket', self.props.ticketId);
            }
        }).catch(function (error) {
        });
    }
  
    render() {
      return (
        <div>
          <Button 
            onClick={this.handleClickOpen}
            disabled={this.props.disabled} 
            size="small"
            color="secondary" 
            className='delete-button'>
                <DeleteIcon /> Delete
          </Button>
          <Dialog
            open={this.state.open}
            onClose={this.handleClose}
            aria-labelledby="form-dialog-title"
          >
            <DialogTitle id="new-project-dialog-title">Delete</DialogTitle>
            <DialogContent>
              <DialogContentText>
                Are you really sure you want to delete this ticket ? This operation can't be reverted
              </DialogContentText>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => this.setState({ open: false })} color="primary">
                Cancel
              </Button>
              <Button 
                onClick={this.deleteTicket}
                color="secondary"
                variant="contained">
                Delete
              </Button>
            </DialogActions>
          </Dialog>
        </div>
      );
    }
  }

 export class NewTicketDialog extends React.Component {
    state = {
      open: false,
      description: '',
      status: '',
      type: '',
      priority: '',
      openRequired:false
    };
  
    handleClickOpen = () => {
      this.setState({ open: true });
    };

    saveTicket = () => {
        if (this.state.description === '' || this.state.priority === '' || this.state.type === '') {
          this.setState({openRequired:true})
          return;
        } else {
          var finalDescription = 'Type: ' + this.state.type
          finalDescription += '\n\nPriority level: ' + this.state.priority
          finalDescription += '\n\nDescription: ' + this.state.description;
        }

        var self = this;
        axios({
            method: 'post', //you can set what request you want to be
            url: apiBaseUrl+'project/'+self.props.projectId+'/ticket',
            data: {description:finalDescription, status:this.state.status},
            headers: {
              Authorization: 'Bearer ' + localStorage.getItem('session'),
              'Content-Type': 'application/json; charset=utf-8'
            }
        }).then(function (response) {
            if(response.status === 200){
                self.setState({ open: false });
                var data = {description:self.state.description, status:self.state.status}
                self.props.handleProjectChange('addTicket', data);
            }
        }).catch(function (error) {
        });
    }
  
    render() {
      var button;
      var status = null;
      if (this.props.buttonStyle === 'client') {
         button = 
          <div className='new-ticket'>
            <MuiThemeProvider theme={blueTheme}>
            <Button onClick={this.handleClickOpen} 
              color="primary"
              variant="contained">
                  <AddIcon /> Add a new support ticket
            </Button>
            </MuiThemeProvider>
          </div>
      } else {
        button = 
            <Button onClick={this.handleClickOpen} color="primary" className='new-button' size='small'>
                  <AddIcon /> Ticket
            </Button>
        status = 
          <TextField
            margin="dense"
            id="status"
            label="Status"
            onChange = {(event) => this.setState({status:event.target.value})}
            fullWidth
          />
      }
      return (
        <React.Fragment>
          <Dialog open={this.state.openRequired}>
            <DialogTitle>Please fill the required fields</DialogTitle>
            <DialogActions>
                <Button onClick={() => {this.setState({openRequired:false})}} color="primary">
                    OK
                </Button>
            </DialogActions>
          </Dialog>
          {button}
          <Dialog
            open={this.state.open}
            onClose={this.handleClose}
            aria-labelledby="form-dialog-title"
            fullWidth
            contentStyle={{width: "100%", maxWidth: "none"}}
          >
            <DialogTitle id="new-project-dialog-title">New Ticket</DialogTitle>
            <DialogContent>
              <DialogContentText>
                To create a new ticket, please fill the fields
              </DialogContentText>
              <FormControl required fullWidth>
                <InputLabel>Support type</InputLabel>
                <Select
                  autoFocus
                  fullWidth
                  required
                  value={this.state.type}
                  onChange={(event) => {this.setState({type:event.target.value})}}
                  name="type"
                  inputProps={{
                    id: 'type',
                  }}
                >
                  <MenuItem value='General'>General</MenuItem>
                  <MenuItem value='Website'>Website</MenuItem>
                  <MenuItem value='Graphics'>Graphics</MenuItem>
                  <MenuItem value='Marketing'>Marketing</MenuItem>
                  <MenuItem value='Other'>Other</MenuItem>
                </Select>
                <FormHelperText>Required</FormHelperText>
              </FormControl>
              <FormControl required fullWidth>
                <InputLabel>Priority level</InputLabel>
                <Select
                  fullWidth
                  required
                  value={this.state.priority}
                  onChange={(event) => {this.setState({priority:event.target.value})}}
                  name="priority"
                  inputProps={{
                    id: 'priority',
                  }}
                >
                  <MenuItem value='Normal'>Normal</MenuItem>
                  <MenuItem value='High'>High</MenuItem>
                  <MenuItem value='Critical'>Critical</MenuItem>
                </Select>
                <FormHelperText>Required</FormHelperText>
              </FormControl>
              <TextField
                style={{height:'175px'}}
                margin="dense"
                id="description"
                label="Description"
                multiline
                required
                onChange = {(event) => this.setState({description:event.target.value})}
                fullWidth
              />
              {status}
            </DialogContent>
            <DialogActions>
              <Button onClick={() => this.setState({ open: false })} color="primary">
                Cancel
              </Button>
              <Button 
                onClick={this.saveTicket}
                color="primary">
                Save
              </Button>
            </DialogActions>
          </Dialog>
        </React.Fragment>
      );
    }
  }


  export class NewTicketMessageDialog extends React.Component {
    state = {
      open: false,
      message: '',
      openRequired:false
    };
  
    handleClickOpen = () => {
      this.setState({ open: true });
    };

    saveTicket = () => {
        if (this.state.message === '') {
          this.setState({openRequired:true})
          return;
        } else {
          var finalDescription = this.props.description;
          finalDescription += '\n\n' + localStorage.getItem('username') + ': ' + this.state.message
        }

        var self = this;
        axios({
            method: 'put', //you can set what request you want to be
            url: apiBaseUrl+'project/'+this.props.projectId+'/ticket/'+self.props.ticketId,
            data: {description:finalDescription},
            headers: {
              Authorization: 'Bearer ' + localStorage.getItem('session'),
              'Content-Type': 'application/json; charset=utf-8'
            }
        }).then(function (response) {
            if(response.status === 200){
                self.props.handleProjectChange();
                self.props.updateDescription(finalDescription);
                self.setState({ open: false });
            }
        }).catch(function (error) {
        });
    }
  
    render() {
      return (
        <div>
          <Dialog open={this.state.openRequired}>
            <DialogTitle>Please fill the required fields</DialogTitle>
            <DialogActions>
                <Button onClick={() => {this.setState({openRequired:false})}} color="primary">
                    OK
                </Button>
            </DialogActions>
          </Dialog>
          <Button onClick={this.handleClickOpen} color="primary" className='new-button'>
              <AddIcon /> Message
          </Button>
          <Dialog
            open={this.state.open}
            onClose={this.handleClose}
            aria-labelledby="form-dialog-title"
          >
            <DialogTitle id="new-project-dialog-title">New Ticket Message</DialogTitle>
            <DialogContent>
              <TextField
                margin="dense"
                id="message"
                label="message"
                required
                onChange = {(event) => this.setState({message:event.target.value})}
                fullWidth
              />
            </DialogContent>
            <DialogActions>
              <Button onClick={() => this.setState({ open: false })} color="primary">
                Cancel
              </Button>
              <Button 
                onClick={this.saveTicket}
                color="primary">
                Save
              </Button>
            </DialogActions>
          </Dialog>
        </div>
      );
    }
  }