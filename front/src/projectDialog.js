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
import MenuItem from '@material-ui/core/MenuItem';
import Select from '@material-ui/core/Select';
import InputLabel from '@material-ui/core/InputLabel';
import FormControl from '@material-ui/core/FormControl';
import axios from 'axios';
import { MuiThemeProvider, createMuiTheme } from 'material-ui/styles';
import NotificationIcon from '@material-ui/icons/Notifications';
import ProjectSaveNotification from './saveNotification.js';

const blueTheme = createMuiTheme({ palette: { primary: {main: '#009688'} } })

var config = require('./config.json');

const apiBaseUrl = config.apiBaseUrl;

// PROJECT DIALOG

export class DeleteProjectDialog extends React.Component {
    state = {
      open: false,
    };
  
    handleClickOpen = () => {
      this.setState({ open: true });
    };

    deleteProject = () => {
        var self = this;
        axios({
            method: 'delete', //you can set what request you want to be
            url: apiBaseUrl+'project/'+self.props.id,
            headers: {
              Authorization: 'Bearer ' + localStorage.getItem('session'),
              'Content-Type': 'application/json; charset=utf-8'
            }
        }).then(function (response) {
            if(response.status === 200){
                self.props.handleProjectChange('deleteProject');
                self.setState({ open: false });
            }
        }).catch(function (error) {
        });
    }
  
    render() {
      return (
        <React.Fragment>
          <Button 
            onClick={this.handleClickOpen} 
            size="small"
            color="secondary" 
            className='delete-button'>
                <DeleteIcon /> Project
          </Button>
          <Dialog
            open={this.state.open}
            onClose={this.handleClose}
            aria-labelledby="form-dialog-title"
          >
            <DialogTitle id="new-project-dialog-title">Delete</DialogTitle>
            <DialogContent>
              <DialogContentText>
                Are you really sure you want to delete this project ? This operation can't be reverted
              </DialogContentText>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => this.setState({ open: false })} color="primary">
                Cancel
              </Button>
              <Button 
                onClick={this.deleteProject}
                color="secondary"
                variant="contained">
                Delete
              </Button>
            </DialogActions>
          </Dialog>
        </React.Fragment>
      );
    }
  }

 export class NewProjectDialog extends React.Component {
    state = {
      open: false,
      name: '',
      type: '',
      status: '',
      golivedate: ''
    };
  
    handleClickOpen = () => {
      this.setState({ open: true });
    };

    saveProject = () => {
        var self = this;
        axios({
            method: 'post', //you can set what request you want to be
            url: apiBaseUrl+'project',
            data: {name:this.state.name, type:this.state.type, status:this.state.status, golivedate:this.state.golivedate},
            headers: {
              Authorization: 'Bearer ' + localStorage.getItem('session'),
              'Content-Type': 'application/json; charset=utf-8'
            }
        }).then(function (response) {
            if(response.status === 200){
                self.props.handleProjectsChange()
                self.setState({ open: false });
            }
        }).catch(function (error) {
        });
    }
    
    render() {
      var date=new Date();
      var yearPlusOne = date.getFullYear()+1;
      var month = date.getMonth()+1;
      var day = date.getDate();
      if (month < 10) {
        month = '0' + month;
      } 
      if (day < 10) {
        day = '0' + day;
      }
      this.state.golivedate = yearPlusOne+"-"+month+"-"+day;
      return (
        <div>
          <Button onClick={this.handleClickOpen} color="primary" className='new-button'>
                <AddIcon />
                Project
          </Button>
          <Dialog
            open={this.state.open}
            onClose={this.handleClose}
            aria-labelledby="form-dialog-title"
          >
            <DialogTitle id="new-project-dialog-title">New Project</DialogTitle>
            <DialogContent>
              <DialogContentText>
                To create a new project, please fill all fields
              </DialogContentText>
              <TextField
                autoFocus
                margin="dense"
                id="name"
                label="Name"
                required
                onChange = {(event) => this.setState({name:event.target.value})}
                fullWidth
              />
              <TextField
                margin="dense"
                id="type"
                label="Type"
                required
                onChange = {(event) => this.setState({type:event.target.value})}
                fullWidth
              />
              <TextField className='golive'
                    type='date'
                    id="golivedate"
                    name="golivedate"
                    onChange={event => this.setState({golivedate:event.target.value})}
                    defaultValue={""+yearPlusOne+"-"+month+"-"+day+""}   
                    label='Go Live Date'
                />
              <FormControl required fullWidth>
                <InputLabel>Status</InputLabel>
                <Select
                  required
                  value={this.state.status}
                  onChange={(event) => {this.setState({status:event.target.value})}}
                  name="status"
                  inputProps={{
                    id: 'status',
                  }}
                >
                  <MenuItem value='Active'>Active</MenuItem>
                  <MenuItem value='Pending'>Pending</MenuItem>
                  <MenuItem value='Complete'>Complete</MenuItem>
                </Select>
              </FormControl>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => this.setState({ open: false })} color="primary">
                Cancel
              </Button>
              <Button 
                onClick={this.saveProject}
                color="primary">
                Save
              </Button>
            </DialogActions>
          </Dialog>
        </div>
      );
    }
  }

  export class NotifyUsersDialog extends React.Component {
    state = {
      open: false,
      openNotifyNotification: false,
      details: ''
    };
  
    handleClickOpen = () => {
      this.setState({ open: true });
    };

    notifyUsers() {
      var self = this;
      axios({
          method: 'post', //you can set what request you want to be
          url: apiBaseUrl+'project/'+self.props.id+'/notify',
          data: {details:this.state.details},
          headers: {
            Authorization: 'Bearer ' + localStorage.getItem('session'),
            'Content-Type': 'application/json; charset=utf-8'
          }
      }).then(function (response) {
          if(response.status === 200){
              self.setState({ open: false });
              self.setState({ openNotifyNotification: true });
          }
      }).catch(function (error) {
      });
    }
  
    render() {
      return (
        <React.Fragment>
          <ProjectSaveNotification 
                open={this.state.openNotifyNotification} 
                message={'Notification successfully sent'}
                handleClose={() => {this.setState({openNotifyNotification:false})}}
          />
          <MuiThemeProvider theme={blueTheme}>
          <Button 
              onClick={() => this.setState({ open: true })} 
              size="small"
              color="primary" 
              className='notify-button'>
                  <NotificationIcon /> Notify Users
          </Button>
          <Dialog
            open={this.state.open}
            onClose={this.handleClose}
            aria-labelledby="form-dialog-title"
          >
            <DialogTitle id="new-project-dialog-title">Notify users</DialogTitle>
            <DialogContent>
              <DialogContentText>
                Please provide details for the notification
              </DialogContentText>
              <TextField
                autoFocus
                margin="dense"
                id="details"
                label="Details"
                multiline
                required
                onChange = {(event) => this.setState({details:event.target.value})}
                fullWidth
              />
            </DialogContent>
            <DialogActions>
              <Button onClick={() => this.setState({ open: false })} color="primary">
                Cancel
              </Button>
              <Button 
                onClick={() => {this.notifyUsers()}}
                color="primary">
                Notify
              </Button>
            </DialogActions>
          </Dialog>
        </MuiThemeProvider>
        </React.Fragment>
      );
    }
  }