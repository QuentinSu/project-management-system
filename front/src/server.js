import React, {Component} from 'react';
import { MuiThemeProvider, createMuiTheme } from '@material-ui/core/styles';
import StarIcon from '@material-ui/icons/Star';
import { Link, NavLink } from 'react-router-dom';
import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';
import Card from '@material-ui/core/Card';
import AddIcon from '@material-ui/icons/Add';
import DeleteIcon from '@material-ui/icons/Delete';
import Typography from '@material-ui/core/Typography';
import Paper from '@material-ui/core/Paper';
import axios from 'axios';
import Avatar from '@material-ui/core/Avatar';
import Chip from '@material-ui/core/Chip';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';
import SaveIcon from '@material-ui/icons/Save';
import BlurOnIcon from '@material-ui/icons/BlurOn';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Switch from '@material-ui/core/Switch';
import HighlightOff from '@material-ui/icons/HighlightOff';
import CheckCircleIcon from '@material-ui/icons/CheckCircle';
import Tooltip from '@material-ui/core/Tooltip';
import ServerSaveNotification from './saveNotification.js';

var config = require('./config.json');
var nbServers;
var once = false;
const apiBaseUrl = config.apiBaseUrl;

function dateDiff(date) {
    date = date.split('-');
    var today = new Date();
    var year = today.getFullYear();
    var month = today.getMonth() + 1;
    var day = today.getDate();
    var yy = parseInt(date[0]);
    var mm = parseInt(date[1]);
    var dd = parseInt(date[2]);
    var years, months, days;
    // months
    months = month - mm;
    if (day < dd) {
        months = months - 1;
    }
    // years
    years = year - yy;
    if (month * 100 + day < mm * 100 + dd) {
        years = years - 1;
        months = months + 12;
    }
    // days
    days = Math.floor((today.getTime() - (new Date(yy + years, mm + months - 1, dd)).getTime()) / (24 * 60 * 60 * 1000));
    //
    return [years, months, days];
}


class Servers extends Component {
    constructor(props){
      super(props);
      this.state={
        servers: [],
        trigger: true,
        open: false,
        newName: null,
        newAddress: '',
        newComment: null,
        newMonitoring: 'yes',
        newFirewall: 'yes',
        newBackups: 'yes',
        newLocal: 'yes',
        newLastbu: 'undefined'
        }
    };

    updateServers() {
        var self = this;
        axios({
            method: 'get', //you can set what request you want to be
            url: apiBaseUrl+'server',
            headers: {
              Authorization: 'Bearer ' + localStorage.getItem('session'),
              'Content-Type': 'application/json; charset=utf-8'
            }
          })
            .then(function (response) {
              if(response.status === 200){
                self.setState({servers:response.data});
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
            url: apiBaseUrl+'server',
            headers: {
              Authorization: 'Bearer ' + localStorage.getItem('session'),
              'Content-Type': 'application/json; charset=utf-8'
            }
          })
            .then(function (response) {
              if(response.status === 200){
                if(!once) {
                  once = true;
                  nbServers = response.data.length;
                }
                self.setState({servers:response.data});
              }
            })
            .catch(function (error) {
            });
    }

    handleChangeAddress(newValue) {
        let length = newValue.length;
        let index = newValue.lastIndexOf('.')+1;
        let nbOfDots = newValue.split('.').length -1;
        let updatedVal='';
        if(length!==index && nbOfDots<3 && this.state.newAddress.length < length && (length-index)%3==0){
            updatedVal= newValue + '.';
        }else if(nbOfDots>3 || length-index>3){
            let newString = newValue.substring(0,length-1);
            updatedVal = newString;
        }else{
            updatedVal = newValue;
        }
        this.setState({newAddress:updatedVal});
    }

    saveNewServer() {
        var self = this;
        axios({
            method: 'post', //you can set what request you want to be
            url: apiBaseUrl+'server',
            headers: {
              Authorization: 'Bearer ' + localStorage.getItem('session'),
              'Content-Type': 'application/json; charset=utf-8'
            },
            data: {
                "name": this.state.newName,
                "address": this.state.newAddress,
                "comment": this.state.newComment,
                "monitoring": this.state.newMonitoring,
                "firewall": this.state.newFirewall,
                "backups": this.state.newBackups,
                "local": this.state.newLocal,
                "lastbu": this.state.newLastbu,
            }
          })
            .then(function (response) {
              if(response.status === 200){
                self.setState({ open: false });
                self.updateServers();
                nbServers++;
              }
            })
            .catch(function (error) {
            });
    }

    filterServers(searchString) {
      let newServers = this.state.servers.slice();
      newServers.map((server)=>{
          //mandatory because of the first passage here
          if(server.hidden == undefined) {
              server.hidden = false;
          }
          var initialState=server.hidden;
          if (server.name.toUpperCase().includes(searchString.toUpperCase()) || server.address.toUpperCase().includes(searchString.toUpperCase()) || server.comment.toUpperCase().includes(searchString.toUpperCase())) {
              // if the searchString correspond with company name or phone useless to filter on users
              server.hidden = false;
          } else {
              server.hidden = true;
          }
          /** STATS CONTROL */
          //si a la base l'item etait caché
          if(initialState) {
              // s'il y a eu un changement l'item est apparru donc on incremente
              if(initialState!==server.hidden) {
                  nbServers++;
              }
          } else {
              //sinon litem etait visible. En cas de changement on decremente
              if(initialState!==server.hidden) {
                  nbServers--;
              }
          }
      })
      this.setState({servers: newServers});
    }

    render(){
        let mappedServers = this.state.servers.map((server)=>{
          return <Server   key={server.id}
                            id={server.id}
                            name={server.name}
                            comment={server.comment}
                            serverReminders={server.serverReminders}
                            address={server.address}
                            created={server.created}
                            hidden={server.hidden ? server.hidden : false}
                            updateServers={this.updateServers.bind(this)}
                />     
        })

        var button = 
        <Button onClick={() => this.setState({ open: true })} color="primary" className='new-button'>
            <AddIcon />
            Server
        </Button>
        
        return(
            <div>
                {button}
                <div className='server-header'>
                  <input
                      placeholder="Search (name, address, comment)"
                      className='header-search'
                      onChange={event =>this.filterServers(event.target.value)}
                  />
                  <Paper color="primary" className='server-stats' square={false}>
                      <Typography className='server-stats-nb'>You have <b>{nbServers}</b> servers</Typography>
                  </Paper>
                </div>
                <Dialog
                    open={this.state.open}
                    aria-labelledby="form-dialog-title"
                    fullWidth
                >
                    <DialogTitle id="new-project-dialog-title">New Server</DialogTitle>
                    <DialogContent>
                    <DialogContentText>
                        To create a new server, please fill all fields
                    </DialogContentText>
                    <TextField
                        autoFocus
                        margin="dense"
                        id="name"
                        label="Name"
                        required
                        onChange = {(event) => this.setState({newName:event.target.value})}
                        fullWidth
                    /><br/>
                    <TextField
                        margin="dense"
                        id="address"
                        label="IP Address"
                        required
                        value={this.state.newAddress}
                        onChange = {event => this.handleChangeAddress(event.target.value)}
                        fullWidth
                    />
                    <TextField
                        margin="dense"
                        id="comment"
                        label="Comment"
                        multiline
                        rows='4'
                        value={this.state.newComment}
                        onChange = {event => this.setState({newComment:event.target.value})}
                        fullWidth
                    />
                    <FormControlLabel 
                    className="server-monitoring-switch"
                    control={<Switch
                            color="primary"
                            defaultChecked={true}
                            onClick={event => this.setState({newMonitoring:(event.target.checked ? 'yes' : 'no')})}  />} 
                    label="Monitoring" />
                    <FormControlLabel 
                    className="server-firewall-switch"
                    control={<Switch
                            color="primary"
                            defaultChecked={true}
                            onClick={event => this.setState({newFirewall:(event.target.checked ? 'yes' : 'no')})}  />} 
                    label="Firewall" />
                    <FormControlLabel 
                    className="server-backups-switch"
                    control={<Switch
                            color="primary"
                            defaultChecked={true}
                            onClick={event => this.setState({newBackups:(event.target.checked ? 'yes' : 'no')})}  />} 
                    label="Back ups" />
                    <FormControlLabel 
                    className="server-local-switch"
                    control={<Switch
                            color="primary"
                            defaultChecked={true}
                            onClick={event => this.setState({newLocal:(event.target.checked ? 'yes' : 'no')})}  />} 
                    label="Local Back up" />
                    </DialogContent>
                    <DialogActions>
                    <Button onClick={() => this.setState({ open: false })} color="primary">
                        Cancel
                    </Button>
                    <Button 
                        onClick={() => this.saveNewServer()}
                        color="primary">
                        Save
                    </Button>
                    </DialogActions>
                </Dialog>
                <p></p>
                {mappedServers}
            </div>
        );
    }
  }

  export default Servers;


  class Server extends Component {
    constructor(props){
        super(props);
        this.state={
            id: props.id,
            name: props.name,
            address: props.address,
            comment: props.comment,
            created: props.created,
            serverReminders: null,
            openDelete: false,
            thingstoSave: true,
            openSaveNotification: false
        }
    }

    saveServer(idServ, reminders) {

        /** Server part */
        var self = this;
        axios({
            method: 'put', //you can set what request you want to be
            url: apiBaseUrl+'server/'+this.state.id,
            headers: {
              Authorization: 'Bearer ' + localStorage.getItem('session'),
              'Content-Type': 'application/json; charset=utf-8'
            },
            data: {
                "name": this.state.name,
                "address": this.state.address,
                "comment": this.state.comment
            }
          })
            .then(function (response) {
              if(response.status === 200){
                self.props.updateServers();
              }
            })
            .catch(function (error) {
            });
        /** Server reminder part */
        reminders.forEach(function(remind) {
          axios({
            method: 'put', //you can set what request you want to be
            url: apiBaseUrl+ 'server/reminder/'+remind[0],
            headers: {
              Authorization: 'Bearer ' + localStorage.getItem('session'),
              'Content-Type': 'application/json; charset=utf-8'
            },
            data: {
                "status": remind[2]
            }
          })
            .then(function (response) {
              if(response.status === 200){
                self.props.updateServers();
              }
            })
            .catch(function (error) {
              console.log(error);
            });
        });
        this.setState({thingstoSave:false});
        this.setState({openSaveNotification: true});
    }

    getServerReminders() {
        var self = this;
        axios({
            method: 'get', //you can set what request you want to be
            url: apiBaseUrl+'server/reminder/'+this.state.id,
            headers: {
              Authorization: 'Bearer ' + localStorage.getItem('session'),
              'Content-Type': 'application/json; charset=utf-8'
            }
          })
          .then(function (response) {
            if(response.status === 200){
              self.setState({serverReminders:response.data});
              self.setState({thingstoSave:false});
            }
          })
          .catch(function (error) {
            console.log(error);  
          });
    }

    deleteServer() {
        var self = this;
        axios({
            method: 'delete', //you can set what request you want to be
            url: apiBaseUrl+'server/'+this.state.id,
            headers: {
              Authorization: 'Bearer ' + localStorage.getItem('session'),
              'Content-Type': 'application/json; charset=utf-8'
            }
          })
            .then(function (response) {
              if(response.status === 200){
                self.setState({ openDelete: false });
                self.props.updateServers();
                nbServers--;
              }
            })
            .catch(function (error) {
            });
    }

    render() {
      const classes = this.props;
      let mappedServerReminders;
        if((this.state.serverReminders === null) || (this.state.serverReminders === undefined) && this.state.thingstoSave) {
            this.getServerReminders();
        }

        if(this.state.serverReminders !== null) {
            mappedServerReminders = this.state.serverReminders.map((reminder)=>{
               let cololor = "#c9c9c9";
                if(reminder[2]==='yes') {
                  cololor = "#00984C";
                } else if(reminder[2]==='no') {
                  cololor = "#f44336";
                }
                
                if(reminder[1]==='Date last back up') {
                  return <div className='reminder-server-element'>
                  <MuiThemeProvider>
                  <span className="textToCenter"><b>
                    Last Back up
                    </b></span>
                    <span className="borderRadiusManager">
                    <b>
                    <TextField
                      className='reminder-server-element-theme'
                      type='date'
                      style={{
                        background: cololor,
                        borderRadius: '20px',
                      }}
                      value={reminder[2]}
                      InputLabelProps={{
                        shrink: true
                      }}
                      InputProps={{
                        className: classes.textField,
                      }}
                      onChange={(event) => {(reminder[2]=event.target.value); this.setState({thingstoSave:true});}}
                      variant='outlined'
                    />
                    </b>
                    </span>
                  </MuiThemeProvider>
                    <div className='reminder-action-buttons'>
                        <Tooltip title="Reset data back-up" interactive>
                          <Button
                              className="reminder-server-button"
                              size="small"
                              color="primary"
                              onClick={() => { if (window.confirm('Are you sure you wish to reset date of last back up?')) {reminder[2]=null;  this.setState({thingstoSave:true});this.forceUpdate();}}}>
                              <HighlightOff style={{color: "#f44336"}} className="reminder-unvalid-button"/>Reset date
                          </Button>
                        </Tooltip>
                    </div>
                  </div>
                } else {
                  var labelReminder;
                  if(reminder[1]==='Local') {
                    labelReminder = 'Local backups';
                  } else if(reminder[1]==='BackUps'){
                    labelReminder = 'Sucuri';
                  } else {
                    labelReminder = reminder[1];
                  } 
                  return  <div className='reminder-server-element'>
                    <MuiThemeProvider>
                    <span className="textToCenter"><b>
                      {labelReminder}
                      </b></span>
                      <span className="borderRadiusManager">
                        <b>
                        <TextField
                            disabled
                            className='reminder-server-element-theme'
                            style={{
                              background: cololor,
                              borderRadius: '20px'
                            }}
                            value={reminder[2].toUpperCase()}
                            InputLabelProps={{
                              shrink: true
                            }}
                            onChange={(event) => {(console.log(reminder[2]))}}
                            variant='outlined'
                        />
                        </b>
                      </span>
                    </MuiThemeProvider>
                      <div className='reminder-action-buttons'>
                        {reminder[2]=='yes' &&
                        <Tooltip title="Turn reminder on NO" interactive>
                          <Button
                              className="reminder-server-button"
                              size="small"
                              color="primary"
                              onClick={() => { {reminder[2]='no';  this.setState({thingstoSave:true});this.forceUpdate();}}}>
                              <HighlightOff style={{color: "#f44336"}} className="reminder-unvalid-button"/> Turn NO
                          </Button>
                        </Tooltip>}
                        {reminder[2]=='no' &&
                        <Tooltip title="Turn reminder on YES" interactive>
                          <Button
                              className="reminder-server-button"
                              size="small"
                              color="primary"
                              onClick={() => { {reminder[2]='yes';this.setState({thingstoSave:true}); this.forceUpdate();}}}>
                              <CheckCircleIcon style={{color: "#00984C"}} className="reminder-valid-button"/> Turn YES
                          </Button>
                        </Tooltip>}
                      </div>
                    </div>
                }
            })
            //this.setState({thingstoSave:false});
        }

         //Live from management
         var dateDifference = dateDiff(this.state.created);
         var liveFrom = dateDifference[0]>0 ? dateDifference[0]+" years " : "0 year ";
         if(dateDifference[1]>0) {
             liveFrom += dateDifference[1]+" months ";
         } else {
             liveFrom += dateDifference[2]>0 ? dateDifference[2]+" days " : "0 day";
         }
         liveFrom = liveFrom + " old";
        return (
          <div hidden={this.props.hidden}>  
            <Card className="server-card">
            <ServerSaveNotification 
                        open={this.state.openSaveNotification} 
                        message={'Server saved: ' + this.state.name}
                        handleClose={() => {this.setState({openSaveNotification:false})}}
                    />
            <div className='server-details'>
                <Avatar className='server-avatar' style={{background: '#00984C'}}><BlurOnIcon/></Avatar>
                <b>
                <TextField className='server-name'
                    onChange={event => { this.setState({name:event.target.value}); this.setState({thingstoSave:true});}}
                    label='Name'
                    defaultValue={this.state.name}
                /></b>
                <TextField className='server-address'
                    onChange={event => { this.setState({address:event.target.value}); this.setState({thingstoSave:true});}}
                    defaultValue={this.state.address}
                    label='IP Address'
                />
                <div className="serve-livefrom"><b></b>
                &nbsp;<Chip className='company-live' label={"LIVE FROM "+liveFrom} /></div>

            </div>
            <div className='reminder-server-list'>
              {mappedServerReminders}
            </div>
            <div className="server-comment-div">
                <TextField className='server-comment-text'
                    onChange={event => { this.setState({comment:event.target.value}); this.setState({thingstoSave:true});}}
                    defaultValue={this.state.comment}
                    multiline
                    rows='4'
                    label='Comment'
                />
            </div>
            <div className='ticket-server-buttons'>
            {this.state.thingstoSave &&
              <Button
                  size="small"
                  style = {{
                    background:'#00984C',
                    color: '#ffffff'
                  }}
                  onClick={() => {this.saveServer(this.state.id, this.state.serverReminders);}}
                  variant="contained"
                  >
                  <SaveIcon/> Save
              </Button>}
              {!this.state.thingstoSave &&
              <Button
                  size="small"
                  onClick={() => null}
                  >
                  <SaveIcon/> Save
              </Button>}<br></br><br></br>
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
                    Are you really sure you want to delete this server ? This operation can't be reverted
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => this.setState({ openDelete: false })} color="primary">
                    Cancel
                    </Button>
                    <Button 
                    onClick={() => this.deleteServer()}
                    color="secondary"
                    variant="contained">
                    Delete
                    </Button>
                </DialogActions>
                </Dialog>
            </div>
        </Card><br/>
        </div>
        );
    }

}