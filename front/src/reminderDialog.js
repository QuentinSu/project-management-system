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
import { checkPropTypes } from 'prop-types';

var config = require('./config.json');
const apiBaseUrl = config.apiBaseUrl;

export class NewReminderDialog extends React.Component {
    state = {
      open: false,
      type: 'custom',
      deadline: '',
    };
  
    handleClickOpen = () => {
      this.setState({ open: true });
    };
  
  
    saveRemind = () => {
        var self = this;
        console.log('type : '+this.state.type+' | deadline : '+this.state.deadline+' | projectId : '+self.props.projectId);
        axios({
            method: 'post', //you can set what request you want to be
            url: apiBaseUrl+'reminder',
            data: {
                type: this.state.type,
                deadline: this.state.deadline,
                projectId: self.props.projectId
            },
            headers: {
              Authorization: 'Bearer ' + localStorage.getItem('session'),
              'Content-Type': 'application/json; charset=utf-8'
            }
        }).then(function (response) {
            if(response.status === 200){
                self.setState({ open: false });
                var data = {type:self.state.type, deadline:self.state.deadline}
                self.props.handleReminderChange('addRemind', data);
                  //this.props.handleProjectsChange();
                
                //self.setState({reminders: newTickets});
                //this.forceUpdate();
            }
        }).catch(function (error) {
            alert("Bad request : the custom "+this.state.type+" for this project may be already exist");
        });
    }
  
    render() {
      return (
        <div>
          <Button onClick={this.handleClickOpen} color="primary" className='new-button'>
                <AddIcon /> Custom reminder
          </Button>
          <Dialog
            open={this.state.open}
            onClose={this.handleClose}
            aria-labelledby="form-dialog-title"
          >
            <DialogTitle id="new-project-dialog-title">New Custom Reminder</DialogTitle>
            <DialogContent>
              <DialogContentText>
                To create a new reminder, please fill all fields
              </DialogContentText>
              <TextField
                autoFocus
                margin="dense"
                id="type"
                label="type"
                required
                onChange = {(event) => this.setState({type:event.target.value})}
                fullWidth
              />
              <TextField
                type='date'
                value={this.state.deadline}
                variant="outlined"
                required
                onChange= {(event) => this.setState({deadline:event.target.value})}
                fullWidth
              />
            </DialogContent>
            <DialogActions>
              <Button onClick={() => this.setState({ open: false })} color="primary">
                Cancel
              </Button>
              <Button 
                onClick={this.saveRemind}
                color="primary">
                Save
              </Button>
            </DialogActions>
          </Dialog>
        </div>
      );
    }
  }
    