import React from 'react';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';
import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';
import AddIcon from '@material-ui/icons/Add';
import EmailIcon from '@material-ui/icons/Email';
import DeleteIcon from '@material-ui/icons/Delete';
import axios from 'axios';
import { MuiThemeProvider, createMuiTheme } from 'material-ui/styles'
import MenuItem from '@material-ui/core/MenuItem';
import InputLabel from '@material-ui/core/InputLabel';
import FormHelperText from '@material-ui/core/FormHelperText';
import FormControl from '@material-ui/core/FormControl';
import { checkPropTypes } from 'prop-types';
import Tooltip from '@material-ui/core/Tooltip';
import Select from '@material-ui/core/Select';



var config = require('./config.json');
const apiBaseUrl = config.apiBaseUrl;


export class NewReminderDialog extends React.Component {
    state = {
      open: false,
      type: 'custom',
      deadline: '',
      status: 'notok',
    };
  
    handleClickOpen = () => {
      this.setState({ open: true });
    };
  
  
    saveRemind = () => {
        var self = this;
        axios({
            method: 'post', //you can set what request you want to be
            url: apiBaseUrl+'reminder',
            data: {
                type: this.state.type,
                status: this.state.status,
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
                var data = {status:self.state.status, type:self.state.type, deadline:self.state.deadline}
                self.props.handleReminderChange('addRemind', data);
            }
        }).catch(function (error) {
            console.log('coucou');
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

export class NewMailReminderDialog extends React.Component {
  state = {
      open: false,
      type: 'custom',
      mailto: [],
      name: '',
      content: '',
      status: 'notok',
      multi: null,
    };

    getMailTo() {
      var self = this;
      console.log('projectid '+self.props.projectId);
      axios({
          method: 'get', //you can set what request you want to be
          url: apiBaseUrl+'project/'+self.props.projectId+'/users',
          headers: {
            Authorization: 'Bearer ' + localStorage.getItem('session'),
            'Content-Type': 'application/json; charset=utf-8'
          }
        })
          .then(function (response) {
            if(response.status === 200){
              // self.setState({mailto:response.data});
              
              console.log(JSON.stringify(response.data));
              // console.log("Mail to :"+this.state.mailto);
            }
          })
          .catch(function (error) {
            console.log('issue bro');
            console.log(error)
          });
        }

  handleClickOpen = () => {
    this.setState({ open: true });
    this.getMailTo();
  };

  sendMail(reminderId) {
    var self = this;
    axios({
        method: 'put', //you can set what request you want to be
        url: apiBaseUrl+'reminder/mail/'+reminderId,
        headers: {
          Authorization: 'Bearer ' + localStorage.getItem('session'),
          'Content-Type': 'application/json; charset=utf-8'
        }
    }).then(function (response) {
        if(response.status === 200){
            console.log('c\'est fine');
        }
    }).catch(function (error) {
      console.log('c\'est pas fine');
    });
  }

  render() {
    const { classes, theme } = this.props;
        const selectStyles = {
        input: base => ({
            ...base,
            color: theme.palette.text.primary,
        }),
        };
    return (
      <React.Fragment>
        <Tooltip title="Manage mail reminder" interactive>
          <Button onClick={this.handleClickOpen} className="reminder-button" //reminder-mail-button"*
                    size="small"
                    color="primary">
                    {/* onClick={() => this.sendMail(reminder[0])} */}
                <EmailIcon/>
          </Button>
        </Tooltip>
        <Dialog
          maxWidth="lg"
          open={this.state.open}
          onClose={this.handleClose}
          aria-labelledby="form-dialog-title"
        >
          <DialogTitle id="new-project-dialog-title">Template Mail for this reminder</DialogTitle>
          <DialogContent>
            <DialogContentText>
              These elements are preformatted. You can copy and paste it to send quickly mail to clients
            </DialogContentText>
            {/* TO ADD : GET MAIL PREFORMATTED WITH CORRESPONDING TYPE */}
            <Select
                classes={classes}
                styles={selectStyles}
                textFieldProps={{
                InputLabelProps: {
                    label: 'Recipients',
                    shrink: true,
                },
                }}
                options={this.state.users}
                // components={components}
                value={this.state.multi}
                // onChange={this.handleChange('multi')}
                placeholder="Mail recipients"
                isMulti
                classes={classes}
            />
            <TextField
              autoFocus
              margin="dense"
              id="name"
              label="Object"
              required
              onChange = {(event) => this.setState(this.state.name:event.target.value)}
              fullWidth
            />
            <TextField
              autoFocus
              margin="dense"
              id="name"
              label="Body"
              required
              multiline
              rows="15"
              onChange = {(event) => this.setState(this.state.content:event.target.value)}
              fullWidth
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => this.setState({ open: false })} color="primary">
              Cancel
            </Button>
            <Button onClick={() => { if (window.confirm('Open extern app ?')) window.location.href = "mailto:quentin.sutkowski@gmail.com,rhys.welsh@rhys.com?subject="+this.state.name+"&body="+this.state.content}}>Mail manager</Button> 
            <Button 
              onClick={this.saveRemind}
              color="primary">
              Save
            </Button>
          </DialogActions>
        </Dialog>
      </React.Fragment>
    );
  }

}