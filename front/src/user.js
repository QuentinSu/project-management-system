import React, {Component} from 'react';
import Typography from '@material-ui/core/Typography';
import Button from '@material-ui/core/Button';
import ExpansionPanel from '@material-ui/core/ExpansionPanel';
import ExpansionPanelSummary from '@material-ui/core/ExpansionPanelSummary';
import ExpansionPanelDetails from '@material-ui/core/ExpansionPanelDetails';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import TextField from '@material-ui/core/TextField';
import Switch from '@material-ui/core/Switch';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import ListItemSecondaryAction from '@material-ui/core/ListItemSecondaryAction';
import Divider from '@material-ui/core/Divider';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';
import AddIcon from '@material-ui/icons/Add';
import DeleteIcon from '@material-ui/icons/Delete';
import SaveIcon from '@material-ui/icons/Save';
import RemoveIcon from '@material-ui/icons/Remove';
import Card from '@material-ui/core/Card';
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';
import InputLabel from '@material-ui/core/InputLabel';
import Select from '@material-ui/core/Select';
import axios from 'axios';
import ClickAwayListener from '@material-ui/core/ClickAwayListener';
import ReactSelect from 'react-select';
import Paper from '@material-ui/core/Paper';
import Chip from '@material-ui/core/Chip';
import classNames from 'classnames';
import { emphasize } from '@material-ui/core/styles/colorManipulator';
import NewUserProjectLinkDialog from './newUserProjectLinkDialog.js';
import Cookies from 'universal-cookie';

var config = require('./config.json');

const apiBaseUrl = config.apiBaseUrl;
const cookies = new Cookies();

export class UserMenu extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            anchorEl: null,
            openChangePassword: false,
            openInvalid: false,
            currentPassword: '',
            newPassword: '',
            newConfirmation: ''
        };
    }
    handleClick = event => {
        this.setState({ anchorEl: event.currentTarget });
    };

    logout(){
        localStorage.clear();
        cookies.remove("remember_me", { path: '/' });
        window.location.href='/';
    }

    changePassword() {
        var self = this;
        axios({
            method: 'post', //you can set what request you want to be
            url: apiBaseUrl+'password/change',
            data: {
                current_password: this.state.currentPassword,
                plainPassword: {
                    first: this.state.newPassword,
                    second: this.state.newConfirmation
                }
            },
            headers: {
              Authorization: 'Bearer ' + localStorage.getItem('session'),
              'Content-Type': 'application/json; charset=utf-8'
            }
        }).then(function (response) {
            if(response.status === 200){
                self.setState({ anchorEl: null });
                self.setState({ openChangePassword: false });
            } else {
                self.setState({openInvalid:true});
            }
        }).catch(function (error) {
            self.setState({openInvalid:true});
        });
    }

    render() {
        const { anchorEl } = this.state;

        return(
            <div className='user-frame'>
            <Button 
                className='user-button-override'
                onClick={(ev) => {this.handleClick(ev)}}
                aria-owns={anchorEl ? 'simple-menu' : null}
                aria-haspopup="true"
            >
                <img className='user-button' src={process.env.PUBLIC_URL + '/user.png'}/>
            </Button>
            <div className='user-username'>{this.props.username}</div> 
            <Menu
                id="simple-user-menu"
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={() => {this.setState({ anchorEl: null })}}
            >
                <MenuItem onClick={() => {this.setState({openChangePassword:true})}}>Change password</MenuItem>
                <MenuItem onClick={this.logout}>Logout</MenuItem>
            </Menu>
            <Dialog open={this.state.openInvalid}>
                <DialogTitle>Invalid credentials or different passwords</DialogTitle>
                <DialogActions>
                    <Button onClick={() => {this.setState({openInvalid:false})}} color="primary">
                        Retry
                    </Button>
                </DialogActions>
            </Dialog>
            <Dialog
                open={this.state.openChangePassword}
            >
                <DialogTitle>Change Password</DialogTitle>
                <DialogContent>
                <TextField
                    autoFocus
                    margin="dense"
                    id="current_password"
                    label="Current Password"
                    required
                    type="password"
                    onChange = {(event) => this.setState({currentPassword:event.target.value})}
                    fullWidth
                />
                <TextField
                    margin="dense"
                    id="new_1"
                    label="New Password"
                    required
                    type="password"
                    onChange = {(event) => this.setState({newPassword:event.target.value})}
                    fullWidth
                />
                <TextField
                    margin="dense"
                    id="new_2"
                    label="Confirm New Password"
                    required
                    type="password"
                    onChange = {(event) => this.setState({newConfirmation:event.target.value})}
                    fullWidth
                />
                </DialogContent>
                <DialogActions>
                <Button onClick={() => this.setState({ openChangePassword: false, anchorEl:null })} color="primary">
                    Cancel
                </Button>
                <Button 
                    onClick={() => this.changePassword()}
                    color="primary">
                    Save
                </Button>
                </DialogActions>
            </Dialog>
            </div>
        )
    }
}

class DeleteUserDialog extends React.Component {
    state = {
      open: false,
    };
  
    handleClickOpen = () => {
      this.setState({ open: true });
    };

    deleteUser = () => {
        var self = this;
        axios({
            method: 'delete', //you can set what request you want to be
            url: apiBaseUrl+'profile/'+self.props.id,
            headers: {
              Authorization: 'Bearer ' + localStorage.getItem('session'),
              'Content-Type': 'application/json; charset=utf-8'
            }
        }).then(function (response) {
            if(response.status === 200){
                self.props.handleUserChange();
                self.setState({ open: false });
            }
        }).catch(function (error) {
        });
    }
  
    render() {
      return (
        <div>
          <Button 
            onClick={this.handleClickOpen} 
            size="small"
            color="secondary" 
            className='delete-button'
            disabled={this.props.isAdmin}>
                <DeleteIcon />
                Delete
          </Button>
          <Dialog
            open={this.state.open}
            onClose={this.handleClose}
            aria-labelledby="form-dialog-title"
          >
            <DialogTitle id="new-project-dialog-title">Delete</DialogTitle>
            <DialogContent>
              <DialogContentText>
                Are you really sure you want to delete this user ? This operation can't be reverted
              </DialogContentText>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => this.setState({ open: false })} color="primary">
                Cancel
              </Button>
              <Button 
                onClick={this.deleteUser}
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

export class NewUserDialog extends React.Component {
    state = {
      open: false,
      username: '',
      email: '',
      password: ''
    };
  
    handleClickOpen = () => {
      this.setState({ open: true });
    };

    generatePassword = () => {
        var randomstring = Math.random().toString(36).slice(-8);
        this.setState({ password: randomstring});
    }

    saveUser = () => {
        var self = this;
        axios({
            method: 'post', //you can set what request you want to be
            url: apiBaseUrl+'register',
            data: {
                username: this.state.username,
                email: this.state.email,
                plainPassword: {
                    first: this.state.password,
                    second: this.state.password
                }
            },
            headers: {
              Authorization: 'Bearer ' + localStorage.getItem('session'),
              'Content-Type': 'application/json; charset=utf-8'
            }
        }).then(function (response) {
            if(response.status === 201){
                self.setState({ open: false });
                self.props.handleUsersChange();
            }
        }).catch(function (error) {
            alert("Bad request : the username or the mail may be already used");
        });
    }
  
    render() {
      return (
        <div>
          <Button onClick={this.handleClickOpen} color="primary" className='new-button'>
                <AddIcon /> User
          </Button>
          <Dialog
            open={this.state.open}
            onClose={this.handleClose}
            aria-labelledby="form-dialog-title"
          >
            <DialogTitle id="new-project-dialog-title">New User</DialogTitle>
            <DialogContent>
              <DialogContentText>
                To create a new user, please fill all fields
              </DialogContentText>
              <TextField
                autoFocus
                margin="dense"
                id="username"
                label="username"
                required
                onChange = {(event) => this.setState({username:event.target.value})}
                fullWidth
              />
              <TextField
                margin="dense"
                id="email"
                label="email"
                required
                onChange = {(event) => this.setState({email:event.target.value})}
                fullWidth
              />
              <TextField
                margin="dense"
                id="password"
                label="password"
                required
                value= {this.state.password}
                onChange = {(event) => this.setState({password:event.target.value})}
                fullWidth
              />
              <Button onClick={this.generatePassword}
                    color="primary">
                Generate password
              </Button>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => this.setState({ open: false })} color="primary">
                Cancel
              </Button>
              <Button 
                onClick={this.saveUser}
                color="primary">
                Save
              </Button>
            </DialogActions>
          </Dialog>
        </div>
      );
    }
  }

  function Project(props) {
    return (
        <div>
        <ListItem fullWidth key={props.projectId}> 
            <ListItemText>
                <Typography>
                    {props.name}
                </Typography>
            </ListItemText>
            <ListItemSecondaryAction>
                <Button className='button-remove-project'
                    size='small'
                    onClick={() => props.removeProjectLink(props.projectId)} 
                    color="secondary" >
                        <RemoveIcon />
                        Project
                </Button>
            </ListItemSecondaryAction>
        </ListItem>
        <Divider/>
        </div>
    );
}

function Company(props) {
    return (
        <div>
        <ListItem fullWidth key={props.companyId}> 
            <ListItemText>
                <Typography>
                    {props.name}
                </Typography>
            </ListItemText>
            <ListItemSecondaryAction>
                <Button className='button-remove-company'
                    size='small'
                    onClick={() => props.removeCompanyLink(props.companyId)} 
                    color="secondary" >
                        <RemoveIcon />
                        Company
                </Button>
            </ListItemSecondaryAction>
        </ListItem>
        <Divider/>
        </div>
    );
}

class User extends Component {
 
    constructor(props){
        super(props);
        this.onceChargeList = false;
        this.selectedCompId;
        this.state={
            companies: [],
            id: props.id,
            username: props.username,
            email: props.email,
            enabled: props.enabled,
            lastlogin: props.lastlogin,
            company: props.company,
            roles: props.roles,
            projects: props.projects,
            tabValue: 0,
        }
    }

    changeTab = (event, tabValue) => {
        this.setState({ tabValue });
    };

    handleUserChange(type, data) {
        var self = this;
        axios({
            method: 'get', //you can set what request you want to be
            url: apiBaseUrl+'profile/'+this.state.id,
            headers: {
              Authorization: 'Bearer ' + localStorage.getItem('session'),
              'Content-Type': 'application/json; charset=utf-8'
            }
          })
            .then(function (response) {
              if(response.status === 200){
                var newProjects = response.data.projects;
                self.setState({projects:newProjects});
              }
            })
            .catch(function (error) {
            });
        this.props.handleUsersChange();
    }

    switchAdminStatus() {
        if (this.state.roles.includes('ROLE_ADMIN')) {
            let newRoles = this.state.roles.slice();
            newRoles.splice(newRoles.indexOf('ROLE_ADMIN'), 1);
            this.setState({roles: newRoles}); 
        } else {
            let newRoles = this.state.roles.slice();
            newRoles.push('ROLE_ADMIN');
            this.setState({roles: newRoles}); 
        }
    }

    switchAdvancedStatus() {
        if (this.state.roles.includes('ROLE_ADVANCED')) {
            let newRoles = this.state.roles.slice();
            newRoles.splice(newRoles.indexOf('ROLE_ADVANCED'), 2);
            this.setState({roles: newRoles}); 
        } else {
            let newRoles = this.state.roles.slice();
            newRoles.push('ROLE_ADVANCED');
            this.setState({roles: newRoles}); 
        }
    }

    saveUser () {
        var self = this;
        axios({
            method: 'put', //you can set what request you want to be
            url: apiBaseUrl+'profile/'+self.state.id,
            data: {email:self.state.email, enabled:self.state.enabled, roles:self.state.roles, companyId:self.selectedCompId},
            headers: {
              Authorization: 'Bearer ' + localStorage.getItem('session'),
              'Content-Type': 'application/json; charset=utf-8'
            }
        }).then(function (response) {
            if(response.status === 200){
                self.props.handleUsersChange();
            }
        }).catch(function (error) {
        });
    }

    handleChange = name => value => {
        this.setState({
          [name]: value,
        });
    };

    handleChange = event => {
        this.setState({ [event.target.label]: event.target.value });
        this.selectedCompId=event.target.value;
      };

    listCompanies () {
        var self = this;
        axios({
            method: 'get', //you can set what request you want to be
            url: apiBaseUrl+'company',
            headers: {
            Authorization: 'Bearer ' + localStorage.getItem('session'),
            'Content-Type': 'application/json; charset=utf-8'
            }
        })
            .then(function (response) {
            if(response.status === 200){
                var newCompanies = response.data.map(company=>({
                    value: company.id,
                    label: company.name
                }));
                self.setState({companies:newCompanies});
            // self.setState({companies:newCompanies});
            }
            })
            .catch(function (error) {
            });
    }

    removeProjectLink(projectId) {
        var self = this;
        axios({
            method: 'delete', //you can set what request you want to be
            url: apiBaseUrl+'profile/'+self.state.id+'/project/'+projectId,
            headers: {
              Authorization: 'Bearer ' + localStorage.getItem('session'),
              'Content-Type': 'application/json; charset=utf-8'
            }
        }).then(function (response) {
            if(response.status === 200){
                self.handleUserChange();
            }
        }).catch(function (error) {
        });
    }

    render() {
        var date = new Date(this.state.lastlogin);
        var parsedDate = date.toLocaleString('en-GB', { timeZone: 'UTC' });
        var isAdmin = this.state.roles.length > 1;
        var isAdvanced = this.state.roles.length > 2;
        var currentCompanyName;
        var currentCompanyId;
        
        if(this.state.company != undefined) {
            console.log(this.state.company.id);
            currentCompanyName = this.state.company.name;
            currentCompanyId = this.state.company.id;
        } else {
            currentCompanyId = -1;
        }

        var listOfCompanies;
        var mappedComp;

        if(!this.onceChargeList) {
            this.listCompanies();
            this.onceChargeList = true;
            this.selectedCompId = currentCompanyId;

        }
        if(this.state.companies != undefined) {
            listOfCompanies = this.state.companies;
            console.log(listOfCompanies);
            mappedComp = this.state.companies.map((comp)=>{
                return <MenuItem value={comp.value}>{comp.label}</MenuItem>
            }) 
        }

        let mappedProjects = this.state.projects.map((project)=>{
            return  <Project key={project.id}
                            projectId={project.id}
                            name={project.name}
                            handleUserChange={this.handleUserChange.bind(this)}
                            removeProjectLink={this.removeProjectLink.bind(this)}
                    />
        })


        return (<ExpansionPanel hidden={this.props.hidden}>
                    <ExpansionPanelSummary expandIcon={<ExpandMoreIcon />}>
                    <Typography color="textSecondary">
                        Username: 
                    </Typography>
                    <span>&nbsp;&nbsp;</span>
                    <Typography>
                        {this.state.username}
                    </Typography>
                    <span>&nbsp;&nbsp;</span>
                    <Typography color="textSecondary">
                        Last login: 
                    </Typography>
                    <span>&nbsp;&nbsp;</span>
                    <Typography>
                        {parsedDate}
                    </Typography>
                    <span>&nbsp;&nbsp;</span>
                    <Typography color="textSecondary">
                        Role: 
                    </Typography>
                    <span>&nbsp;&nbsp;</span>
                    <Typography>
                        {isAdmin ? 'Admin' : 'User'}
                    </Typography>
                    </ExpansionPanelSummary>
                    <ExpansionPanelDetails>
                    <List className="user-details">
                        <ListItem>
                        <InputLabel shrink htmlFor="select-listCompanies">
                            Company
                         </InputLabel>
                        <Select label='listCompanies'
                            className="select-listCompanies"
                            onChange={this.handleChange}
                            value={this.selectedCompId}>
                            {/* ADD null possibility (to keep user unless the company is deleted *or the user is fired LMAO*) */}
                            <MenuItem value={-1}><i>No company</i></MenuItem>
                            { this.onceChargeList && mappedComp}
                        </Select>
                        </ListItem>
                        <ListItem>
                            <TextField
                                defaultValue={this.state.email}
                                label='E-mail'
                                onChange = {(event) => this.setState({email:event.target.value})}
                            />
                        </ListItem>
                        <ListItem>
                            <ListItemText primary='Enabled' />
                            <ListItemSecondaryAction>
                            <Switch
                                checked={this.state.enabled}
                                onChange = {(event) => this.setState({enabled:!this.state.enabled})}
                            />
                            </ListItemSecondaryAction>
                        </ListItem>
                        <ListItem>
                            <ListItemText primary='Admin' />
                            <ListItemSecondaryAction>
                            <Switch
                                checked={this.state.roles.includes('ROLE_ADMIN')}
                                onChange = {() => this.switchAdminStatus()}
                            />
                            </ListItemSecondaryAction>
                        </ListItem>
                        <Card hidden={isAdmin}>
                                <NewUserProjectLinkDialog
                                    user={this.state.id}
                                    handleUserChange={this.handleUserChange.bind(this)}
                                />
                                <Divider/>
                                <List>
                                    {mappedProjects}
                                </List>
                            
                        </Card>
                        <ListItem>
                            <ListItemText primary='Advanced' />
                            <ListItemSecondaryAction>
                            <Switch
                                checked={this.state.roles.includes('ROLE_ADVANCED')}
                                onChange = {() => this.switchAdvancedStatus()}
                            />
                            </ListItemSecondaryAction>
                        </ListItem>
                        <ListItem>
                            <Button 
                                size="small"
                                color="primary"
                                className="save-button"
                                onClick={() => this.saveUser()}>
                                <SaveIcon/>
                                Save
                            </Button>
                            <ListItemSecondaryAction>
                                <DeleteUserDialog 
                                    id={this.state.id}
                                    handleUserChange={this.handleUserChange.bind(this)}
                                    isAdmin={isAdmin}
                                />
                            </ListItemSecondaryAction>
                        </ListItem>
                        </List>
                    </ExpansionPanelDetails>
                </ExpansionPanel>
        );
    }
}

class Users extends Component {
    constructor(props){
      super(props);
      this.state={
          users: [],
          trigger: true
      }
    };
    handleUsersChange() {
        this.componentDidMount();
    }
    componentDidMount() {
        var self = this;
        axios({
            method: 'get', //you can set what request you want to be
            url: apiBaseUrl+'profile',
            headers: {
              Authorization: 'Bearer ' + localStorage.getItem('session'),
              'Content-Type': 'application/json; charset=utf-8'
            }
          })
            .then(function (response) {
              if(response.status === 200){
                self.setState({users:response.data.users});
                this.forceUpdate();
              }
            })
            .catch(function (error) {
            });
    }

    filterUsers(label) {
        let newUsers = this.state.users.slice();
        newUsers.map((user)=>{
            if (user.username.toUpperCase().includes(label.toUpperCase())) {
                user.hidden = false;
            } else {
                user.hidden = true;
            }
        })
        this.setState({users: newUsers}); 
    }

    render(){
        let mappedUsers = this.state.users.map((user)=>{
          return <User   key={user.id}
                        id={user.id}
                        username={user.username}
                        email={user.email}
                        enabled={user.enabled}
                        lastlogin={user.lastLogin}
                        roles={user.roles}
                        company={user.company}
                        projects = {user.projects}
                        hidden = {user.hidden ? user.hidden : false}
                        handleUsersChange={this.handleUsersChange.bind(this)}
                />
                
        })
        return(
            <div>
                <div className='project-header'>
                    <NewUserDialog handleUsersChange={this.handleUsersChange.bind(this)}/>
                    <input
                        placeholder="Search an user"
                        onChange={event => this.filterUsers(event.target.value)}
                    />
                </div>
                <p></p>
                {mappedUsers}
            </div>
        );
    }
  }

  export default Users;