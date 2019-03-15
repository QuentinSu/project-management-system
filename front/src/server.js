import React, {Component} from 'react';
import { MuiThemeProvider, createMuiTheme } from '@material-ui/core/styles';
import StarIcon from '@material-ui/icons/Star';
import { Link, NavLink } from 'react-router-dom';
import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';
import Card from '@material-ui/core/Card';
import AddIcon from '@material-ui/icons/Add';
import DeleteIcon from '@material-ui/icons/Delete';
import axios from 'axios';
import Avatar from '@material-ui/core/Avatar';
import Chip from '@material-ui/core/Chip';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';
import SaveIcon from '@material-ui/icons/Save';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Switch from '@material-ui/core/Switch';

var config = require('./config.json');
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
        newMonitoring: 'yes',
        newFirewall: 'yes',
        newBackups: 'yes',
        newLocal: 'yes'
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
        console.log('local status'+this.state.newLocal);
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
                "monitoring": this.state.newMonitoring,
                "firewall": this.state.newFirewall,
                "backups": this.state.newBackups,
                "local": this.state.newLocal,
            }
          })
            .then(function (response) {
              if(response.status === 200){
                self.setState({ open: false });
                self.updateServers();
              }
            })
            .catch(function (error) {
            });
    }

    render(){
        let mappedServers = this.state.servers.map((server)=>{
          return <Testimonial   key={server.id}
                            id={server.id}
                            name={server.name}
                            serverReminders={server.serverReminders}
                            address={server.address}
                            created={server.created}
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
                    />
                    <TextField
                        margin="dense"
                        id="address"
                        label="IP Address"
                        required
                        value={this.state.newAddress}
                        onChange = {event => this.handleChangeAddress(event.target.value)}
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


  class Testimonial extends Component {
    constructor(props){
        super(props);
        this.state={
            id: props.id,
            name: props.name,
            address: props.address,
            created: props.created,
            serverReminders: ['ma', 'bite', 'sur', 'ton', 'epaule'],
            openDelete: false,
            thingstoSave: false
        }
    }

    saveServer() {
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
                "address": this.state.address
            }
          })
            .then(function (response) {
              if(response.status === 200){
                self.props.updateServers();
              }
            })
            .catch(function (error) {
            });
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
                this.setState({serverReminders:response.data});
              }
            })
            .catch(function (error) {
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
              }
            })
            .catch(function (error) {
            });
    }

    render() {
        let mappedServerReminders;
        if((this.state.serverReminders === null) || (this.state.serverReminders === undefined)) {
            this.getServerReminders();
            mappedServerReminders = this.state.serverReminders.map((reminder)=>{
                console.log("reminder"+JSON.stringify(reminder));
                return(
                    <p>{reminder[0]}</p>
                )
            });
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
            <Card className="server-card">
            <div className='server-details'>
                <Avatar className='server-avatar' style={{background: '#523642'}}>☺</Avatar>
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
            </div>
            {mappedServerReminders}
            <p>insert here reminders</p>

            <div className='ticket-buttons'>
                <Button 
                    className="save-button"
                    size="small"
                    color="primary" 
                    onClick={() => this.saveServer()}>
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
        </Card>
        );
    }

}