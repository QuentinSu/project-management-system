import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
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
import Typography from '@material-ui/core/Typography';
import Chip from '@material-ui/core/Chip';
import Paper from '@material-ui/core/Paper';
import classNames from 'classnames';
import { emphasize } from '@material-ui/core/styles/colorManipulator';


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

  const styles = theme => ({
    root: {
      flexGrow: 1,
      width: 500,
      height: 250
    },
    input: {
      display: 'flex',
      padding: 0,
    },
    valueContainer: {
      display: 'flex',
      flexWrap: 'wrap',
      flex: 1,
      alignItems: 'center',
    },
    chip: {
      margin: `${theme.spacing.unit / 2}px ${theme.spacing.unit / 4}px`,
    },
    chipFocused: {
      backgroundColor: emphasize(
        theme.palette.type === 'light' ? theme.palette.grey[300] : theme.palette.grey[700],
        0.08,
      ),
    },
    noOptionsMessage: {
      padding: `${theme.spacing.unit}px ${theme.spacing.unit * 2}px`,
    },
    singleValue: {
      fontSize: 16,
    },
    placeholder: {
      position: 'absolute',
      left: 2,
      fontSize: 16,
    },
    paper: {
      marginTop: theme.spacing.unit,
    },
    divider: {
      height: theme.spacing.unit * 2,
    },
  });


class NewMailReminderDialog extends React.Component {
  state = {
      open: false,
      type: 'custom',
      mailto: [],
      name: '',
      template: [],
      // content: '',
      selectedTemplate: '-1',
      status: 'notok',
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
          var newUsers = response.data.map((user)=>({
              username: user.username,
              email: user.email,
          }));
          self.setState({mailto:newUsers});
          // console.log("Mail to :"+this.state.mailto);
          }
        })
        .catch(function (error) {
          console.log(error)
        });
      }

      getTemplate() {
        var self = this;
        var remindType;
        console.log('reminderType '+self.props.reminderType);
        if(self.props.reminderType === '3m' || self.props.reminderType === '6m') {
          remindType = self.props.reminderType;
        } else {
          remindType = 'custom';
        }
        axios({
            method: 'get', //you can set what request you want to be
            url: apiBaseUrl+'mailpreformat/'+remindType,
            headers: {
              Authorization: 'Bearer ' + localStorage.getItem('session'),
              'Content-Type': 'application/json; charset=utf-8'
            }
          })
          .then(function (response) {
            if(response.status === 200){
            var newTemplateItems = response.data.map((templateItem)=>({
                id: templateItem.id,
                name: templateItem.name,
                content: templateItem.content,
            }));
            self.setState({template:newTemplateItems});
            // console.log("Mail to :"+this.state.mailto);
            }
          })
          .catch(function (error) {
            console.log(error)
          });
  }

  templateUpdate(valueSelected) {
    console.log('update');
    var templateActive = this.state.template;
    if(templateActive) {
      var nameTemplate = templateActive.find(templateActive => templateActive.id === valueSelected).name;
      var contentTemplate = templateActive.find(templateActive => templateActive.id === valueSelected).content;

      this.setState({name: nameTemplate});
      this.setState({content: contentTemplate});
      this.setState({selectedTemplate:valueSelected});

    } else {
      console.log('unable to update the template');
    }
  }

  handleClickOpen = () => {
    this.setState({ open: true });
    this.getMailTo();
    this.getTemplate();
  };

  render() {
    const { classes, theme } = this.props;
        const selectStyles = {
        input: base => ({
            ...base,
            color: theme.palette.text.primary,
        }),
        };
    let recipientString = '';

    let mappedListOfRecipients = this.state.mailto.map((usermail)=>{
      recipientString += usermail.email+',';
      var show = true;
      return (
        <Chip
        tabIndex={-1}
        label={usermail.username+' <'+usermail.email+'>'}
      />
      )
    });

    let mappedMenuItem = this.state.template.map((templateItem)=>{
      // console.log(templateItem.id);
      return (
        <MenuItem tabIndex={templateItem.id} value={templateItem.id} >{templateItem.name}</MenuItem>
      )
    });
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
          fullWidth
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
            <FormControl className="template-mail-selector" required width="20%">
                <InputLabel>Base template</InputLabel>
                <Select
                  autoFocus
                  fullWidth
                  options={this.state.template}
                  value={this.state.selectedTemplate}
                  defaultValue='-1'
                  onChange={(event) => {this.templateUpdate(event.target.value)}}
                  name="template"
                  inputProps={{
                    id: 'template',
                  }}
                >
                <MenuItem value='-1'>None</MenuItem>
                {mappedMenuItem}
                </Select>
            </FormControl>
            <div className="user-recipient-list">
              <Typography className="recipients-label">Recipients</Typography>
              {mappedListOfRecipients}
            </div>
            <TextField
              autoFocus
              margin="dense"
              id="name"
              label="Object"
              value={this.state.name}
              onChange = {(event) => this.setState({name:event.target.value})}
              fullWidth
            />
            <TextField
              margin="dense"
              id="name"
              label="Body"
              multiline
              rows="15"
              value={this.state.content}
              onChange = {(event) => this.setState({content:event.target.value})}
              fullWidth
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => this.setState({ open: false })} color="primary">
              Cancel
            </Button>
            <Button onClick={() => { if (window.confirm('Open extern app ?')) window.location.href = "mailto:"+recipientString+"?subject="+this.state.name+"&body=<html>"+this.state.content+"</html>"}}>Open Mail manager</Button> 
            <Button 
              onClick={this.saveRemind}
              color="primary">
              Mark reminder as Sent
            </Button>
          </DialogActions>
        </Dialog>
      </React.Fragment>
    );
  }

}

NewMailReminderDialog.propTypes = {
  classes: PropTypes.object.isRequired,
  theme: PropTypes.object.isRequired,
};


export default withStyles(styles, { withTheme: true })(NewMailReminderDialog);