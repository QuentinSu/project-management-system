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
import IconButton from '@material-ui/core/IconButton';
import CommentIcon from '@material-ui/icons/Comment';

var config = require('./config.json');

const apiBaseUrl = config.apiBaseUrl;

/**
 * Dialog component to delete an item from a checklist
 */
export class DeleteChecklistItemDialog extends React.Component {
    state = {
      open: false,
    };
  
    /**
     * Function to open or close the dialog
     */
    handleClickOpen = () => {
      this.setState({ open: true });
    };

    /**
     * Function to delete the checklist item
     */
    deleteChecklistItem = () => {
        // API call to delete the checklist item
        var self = this;
        axios({
            method: 'delete', //you can set what request you want to be
            url: apiBaseUrl+'project/'+self.props.projectId+'/checklist/'+self.props.checklistId+'/item/'+self.props.checklistItemId,
            headers: {
              Authorization: 'Bearer ' + localStorage.getItem('session'),
              'Content-Type': 'application/json; charset=utf-8'
            }
        }).then(function (response) {
            if(response.status === 200){
                self.setState({ open: false });
                self.props.handleProjectChange('deleteChecklistItem', {checklist:self.props.checklistId, message:self.props.checklistItemId});
            }
        }).catch(function (error) {
        });
    }
    // Rendering of the component : a button + a dialog that opens when user clicks the dialog
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
                Are you really sure you want to delete this checklist item ? This operation can't be reverted
              </DialogContentText>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => this.setState({ open: false })} color="primary">
                Cancel
              </Button>
              <Button 
                onClick={this.deleteChecklistItem}
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

/**
 * Dialog component to create a new checklist item
 */
export class NewChecklistItemDialog extends React.Component {
    state = {
      open: false,
      label: '',
    };
  
    /**
     * Function to handle the opening of the dialog
     */
    handleClickOpen = () => {
      this.setState({ open: true });
    };

    // Function to save the checklist item into the DB
    saveChecklistItem = () => {
        // API call
        var self = this;
        axios({
            method: 'post', //you can set what request you want to be
            url: apiBaseUrl+'project/'+self.props.projectId+'/checklist/'+self.props.checklistId+'/item',
            data: {label:this.state.label},
            headers: {
              Authorization: 'Bearer ' + localStorage.getItem('session'),
              'Content-Type': 'application/json; charset=utf-8'
            }
        }).then(function (response) {
            if(response.status === 200){
                self.setState({ open: false });
                var data = {checklistId:self.props.checklistId, label:self.state.label}
                self.props.handleProjectChange('addChecklistItem', data);
            }
        }).catch(function (error) {
        });
    }
    // Function to render the button and the dialog
    render() {
      return (
        <div>
          <Button onClick={this.handleClickOpen} size="small" color="primary" className='new-button'>
                <AddIcon /> Item
          </Button>
          <Dialog
            open={this.state.open}
            onClose={this.handleClose}
            aria-labelledby="form-dialog-title"
          >
            <DialogTitle id="new-project-dialog-title">New Checklist Item</DialogTitle>
            <DialogContent>
              <DialogContentText>
                To create a new checklist item, please fill all fields
              </DialogContentText>
              <TextField
                autoFocus
                margin="dense"
                id="label"
                label="label"
                required
                onChange = {(event) => this.setState({label:event.target.value})}
                fullWidth
              />
            </DialogContent>
            <DialogActions>
              <Button onClick={() => this.setState({ open: false })} color="primary">
                Cancel
              </Button>
              <Button 
                onClick={this.saveChecklistItem}
                color="primary">
                Save
              </Button>
            </DialogActions>
          </Dialog>
        </div>
      );
    }
  }

/**
 * Dialog component to delete a checklist message
 */
export class DeleteChecklistMessageDialog extends React.Component {
    state = {
      open: false,
    };
  
    // Function to handle the opening of the dialog
    handleClickOpen = () => {
      this.setState({ open: true });
    };

    // Function to delete a message from a checklist in DB
    deleteChecklistMessage = () => {
        // API call
        var self = this;
        axios({
            method: 'delete', //you can set what request you want to be
            url: apiBaseUrl+'project/'+self.props.projectId+'/checklist/'+self.props.checklistId+'/message/'+self.props.checklistMessageId,
            headers: {
              Authorization: 'Bearer ' + localStorage.getItem('session'),
              'Content-Type': 'application/json; charset=utf-8'
            }
        }).then(function (response) {
            if(response.status === 200){
                self.setState({ open: false });
                self.props.handleProjectChange('deleteChecklistMessage', {checklist:self.props.checklistId, message:self.props.checklistMessageId});
            }
        }).catch(function (error) {
        });
    }
    // Render of the button + the dialog
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
                Are you really sure you want to delete this checklist message ? This operation can't be reverted
              </DialogContentText>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => this.setState({ open: false })} color="primary">
                Cancel
              </Button>
              <Button 
                onClick={this.deleteChecklistMessage}
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

/**
 * Dialog component to create a new checklist message
 */
export class NewChecklistMessageDialog extends React.Component {
    state = {
      open: false,
      label: '',
    };
  
    // Function to handle the opening of the dialog
    handleClickOpen = () => {
      this.setState({ open: true });
    };

    // Function to save the message into the DB
    saveChecklistMessage = () => {
        var newLabel = localStorage.getItem('username')+': '+this.state.label;
        var self = this;
        // Call to the DB
        axios({
            method: 'post', //you can set what request you want to be
            url: apiBaseUrl+'project/'+self.props.projectId+'/checklist/'+self.props.checklistId+'/message',
            data: {label:newLabel},
            headers: {
              Authorization: 'Bearer ' + localStorage.getItem('session'),
              'Content-Type': 'application/json; charset=utf-8'
            }
        }).then(function (response) {
            if(response.status === 200){
                self.setState({ open: false });
                var data = {checklistId:self.props.checklistId, label:newLabel}
                self.props.handleProjectChange('addChecklistMessage', data);
            }
        }).catch(function (error) {
        });
    }
    // Renders the component with its button + dialog
    render() {
      var button;
      // If the dialog is for client view, the button does not display as in admin view
      if (this.props.buttonStyle === 'client') {
        button = 
        <IconButton aria-label="Comments" onClick={this.handleClickOpen}>
            <CommentIcon style={{color:'#34845F'}} />
        </IconButton>
      } else {
        button = 
        <Button onClick={this.handleClickOpen} size="small" color="primary" className='new-button'>
                <AddIcon /> Message
        </Button>
      }
      return (
        <div>
          {button}
          <Dialog
            open={this.state.open}
            onClose={this.handleClose}
            aria-labelledby="form-dialog-title"
          >
            <DialogTitle id="new-project-dialog-title">New Checklist Message</DialogTitle>
            <DialogContent>
              <DialogContentText>
                To create a new checklist message, please fill all fields
              </DialogContentText>
              <TextField
                autoFocus
                margin="dense"
                id="label"
                label="label"
                required
                onChange = {(event) => this.setState({label:event.target.value})}
                fullWidth
              />
            </DialogContent>
            <DialogActions>
              <Button onClick={() => this.setState({ open: false })} color="primary">
                Cancel
              </Button>
              <Button 
                onClick={this.saveChecklistMessage}
                color="primary">
                Save
              </Button>
            </DialogActions>
          </Dialog>
        </div>
      );
    }
  }

/**
 * Dialog component to delete a checklist
 */
export class DeleteChecklistDialog extends React.Component {
    state = {
      open: false,
    };
  
    // Function to handle the opening of the dialog
    handleClickOpen = () => {
      this.setState({ open: true });
    };
    // Function to delete the checklist in the DB
    deleteChecklist = () => {
        var self = this;
        // API call
        axios({
            method: 'delete', //you can set what request you want to be
            url: apiBaseUrl+'project/'+self.props.projectId+'/checklist/'+self.props.checklistId,
            headers: {
              Authorization: 'Bearer ' + localStorage.getItem('session'),
              'Content-Type': 'application/json; charset=utf-8'
            }
        }).then(function (response) {
            if(response.status === 200){
                self.setState({ open: false });
                self.props.handleProjectChange('deleteChecklist', self.props.checklistId);
            }
        }).catch(function (error) {
        });
    }
    // Function to render the dialog + the button
    render() {
      return (
        <div>
          <Button 
            onClick={this.handleClickOpen} 
            size="small"
            color="secondary" 
            className='delete-button'>
                <DeleteIcon /> Delete Checklist
          </Button>
          <Dialog
            open={this.state.open}
            onClose={this.handleClose}
            aria-labelledby="form-dialog-title"
          >
            <DialogTitle id="new-project-dialog-title">Delete</DialogTitle>
            <DialogContent>
              <DialogContentText>
                Are you really sure you want to delete this checklist ? This operation can't be reverted
              </DialogContentText>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => this.setState({ open: false })} color="primary">
                Cancel
              </Button>
              <Button 
                onClick={this.deleteChecklist}
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
 
  /**
   * Dialog component to create a checklist
   */
  export class NewChecklistDialog extends React.Component {
    state = {
      open: false,
      description: '',
      status: ''
    };
  
    // Function to handle the opening of the dialog
    handleClickOpen = () => {
      this.setState({ open: true });
    };

    // Function to save the checklist
    saveChecklist = () => {
        var self = this;
        // API Call
        axios({
            method: 'post', //you can set what request you want to be
            url: apiBaseUrl+'project/'+self.props.projectId+'/checklist',
            data: {label:this.state.label},
            headers: {
              Authorization: 'Bearer ' + localStorage.getItem('session'),
              'Content-Type': 'application/json; charset=utf-8'
            }
        }).then(function (response) {
            if(response.status === 200){
                self.setState({ open: false });
                var data = {label:self.state.label}
                self.props.handleProjectChange('addChecklist', data);
            }
        }).catch(function (error) {
        });
    }
    // Function to render the button and the dialog
    render() {
      return (
        <React.Fragment>
          <Button onClick={this.handleClickOpen} color="primary" className='new-button' size="small">
                <AddIcon /> Checklist
          </Button>
          <Dialog
            open={this.state.open}
            onClose={this.handleClose}
            aria-labelledby="form-dialog-title"
          >
            <DialogTitle id="new-project-dialog-title">New Checklist</DialogTitle>
            <DialogContent>
              <DialogContentText>
                To create a new checklist, please fill all fields
              </DialogContentText>
              <TextField
                autoFocus
                margin="dense"
                id="label"
                label="Title"
                required
                onChange = {(event) => this.setState({label:event.target.value})}
                fullWidth
              />
            </DialogContent>
            <DialogActions>
              <Button onClick={() => this.setState({ open: false })} color="primary">
                Cancel
              </Button>
              <Button 
                onClick={this.saveChecklist}
                color="primary">
                Save
              </Button>
            </DialogActions>
          </Dialog>
        </React.Fragment>
      );
    }
  }