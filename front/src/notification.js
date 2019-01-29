import React, {Component} from 'react';
import { MuiThemeProvider, createMuiTheme } from '@material-ui/core/styles';
import axios from 'axios';
import Button from '@material-ui/core/Button';
import Badge from '@material-ui/core/Badge';
import MailIcon from '@material-ui/icons/Mail';
import Dialog from '@material-ui/core/Dialog';
import ListItemText from '@material-ui/core/ListItemText';
import ListItemSecondaryAction from '@material-ui/core/ListItemSecondaryAction';
import ListItem from '@material-ui/core/ListItem';
import ListSubheader from '@material-ui/core/ListSubheader';
import List from '@material-ui/core/List';
import Checkbox from '@material-ui/core/Checkbox';
import Divider from '@material-ui/core/Divider';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import IconButton from '@material-ui/core/IconButton';
import Typography from '@material-ui/core/Typography';
import CloseIcon from '@material-ui/icons/Close';
import Slide from '@material-ui/core/Slide';
import DeleteIcon from '@material-ui/icons/Delete';
import { UserMenu } from './user';

var config = require('./config.json');

const apiBaseUrl = config.apiBaseUrl;
const whiteTheme = createMuiTheme({ palette: { primary: {main: '#FFFFFF'}, secondary: {main: '#f44336'} } });

function Transition(props) {
    return <Slide direction="up" {...props} />;
}

export default class Notifications extends Component {
    constructor(props){
        super(props);
        this.state = {
            notifications: [],
            open: false
        }
    }

    updateNotifications() {
        var self = this;
        axios({
            method: 'get', //you can set what request you want to be
            url: apiBaseUrl+'notification',
            headers: {
              Authorization: 'Bearer ' + localStorage.getItem('session'),
              'Content-Type': 'application/json; charset=utf-8'
            }
          })
            .then(function (response) {
              if(response.status === 200){
                self.setState({notifications:response.data});
              }
            })
            .catch(function (error) {
            });
    }

    componentDidMount() {
        this.updateNotifications();
    }

    toggle($id) {
        var self = this;
        axios({
            method: 'put', //you can set what request you want to be
            url: apiBaseUrl+'notification/'+$id,
            headers: {
              Authorization: 'Bearer ' + localStorage.getItem('session'),
              'Content-Type': 'application/json; charset=utf-8'
            }
          })
            .then(function (response) {
              if(response.status === 200){
                  self.updateNotifications();
              }
            })
            .catch(function (error) {
            });
    }

    deleteOne($id) {
        var self = this;
        axios({
            method: 'delete', //you can set what request you want to be
            url: apiBaseUrl+'notification/'+$id,
            headers: {
              Authorization: 'Bearer ' + localStorage.getItem('session'),
              'Content-Type': 'application/json; charset=utf-8'
            }
          })
            .then(function (response) {
              if(response.status === 200){
                  self.updateNotifications();
              }
            })
            .catch(function (error) {
            });
    }

    clear() {
        var self = this;
        axios({
            method: 'delete', //you can set what request you want to be
            url: apiBaseUrl+'notification',
            headers: {
              Authorization: 'Bearer ' + localStorage.getItem('session'),
              'Content-Type': 'application/json; charset=utf-8'
            }
          })
            .then(function (response) {
              if(response.status === 200){
                  self.updateNotifications();
              }
            })
            .catch(function (error) {
            });
    }

    render() {
        var self = this;
        let mappedNotifications = this.state.notifications.map(function(notification){
            if (!notification.checked) {
                var date = new Date(notification.date);
                var parsedDate = date.toLocaleString('en-GB', { timeZone: 'UTC' });
                return(
                    <ListItem key={notification.id}>
                        <ListItemText 
                            primary={notification.description}
                            secondary={"Author: "+notification.author+" - Time: "+parsedDate} 
                        />
                        <ListItemSecondaryAction>
                        <Checkbox
                            checked={notification.checked}
                            onChange={() => {self.toggle(notification.id)}}
                        />
                        <Button 
                            onClick={() => {self.deleteOne(notification.id)}} 
                            size="small"
                            color="secondary" 
                            className='delete-button'>
                                <DeleteIcon />
                        </Button>
                        </ListItemSecondaryAction>
                    </ListItem>
                )
            }
        });
        let mappedCompletedNotifications = this.state.notifications.map(function(notification){
            if (notification.checked) {
                var date = new Date(notification.date);
                var parsedDate = date.toLocaleString('en-GB', { timeZone: 'UTC' });
                return(
                    <ListItem key={notification.id} className='completed-notification-folder'>
                        <ListItemText 
                            primary={notification.description}
                            secondary={"Author: "+notification.author+" - Time: "+parsedDate} 
                        />
                        <ListItemSecondaryAction>
                        <Checkbox
                            checked={notification.checked}
                            onChange={() => {self.toggle(notification.id)}}
                        />
                        <Button 
                            onClick={() => {self.deleteOne(notification.id)}} 
                            size="small"
                            color="secondary" 
                            className='delete-button'>
                                <DeleteIcon />
                        </Button>
                        </ListItemSecondaryAction>
                    </ListItem>
                )
            }
        });
        var badgeValue = this.state.notifications.length;
        this.state.notifications.forEach(function(notification){
            if (notification.checked) {
                badgeValue--;
            }
        })
        return (
            <div>
            <Button className='notification-button' onClick={() => {this.setState({ open: true });}}>
                <MuiThemeProvider theme={whiteTheme}>
                    <Badge badgeContent={badgeValue} color="secondary">
                            <MailIcon color="primary"/>
                    </Badge>
                </MuiThemeProvider>
            </Button>
            <Dialog
                fullScreen
                open={this.state.open}
                onClose={this.handleClose}
                TransitionComponent={Transition}
            >
                <AppBar>
                <Toolbar>
                    <IconButton color="inherit" onClick={() => {this.setState({ open: false })}} aria-label="Close">
                    <CloseIcon />
                    </IconButton>
                    <Typography variant="title" color="inherit" style={{flex:1}}>
                    Notifications
                    </Typography>
                    <Button color="secondary" onClick={() => {this.clear(); this.setState({ open: false })}}>
                        Delete all
                    </Button>
                </Toolbar>
                </AppBar>   
                <List style={{marginTop:'64px'}}>
                {mappedNotifications}
                <ListSubheader className='completed-notification-folder-separator'>Completed</ListSubheader>
                {mappedCompletedNotifications}
                </List>
            </Dialog>
            </div>
        )
    }
}