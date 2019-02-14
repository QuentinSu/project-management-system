import React, {Component} from 'react';
import Button from '@material-ui/core/Button';
import ExpansionPanel from '@material-ui/core/ExpansionPanel';
import ExpansionPanelSummary from '@material-ui/core/ExpansionPanelSummary';
import ExpansionPanelDetails from '@material-ui/core/ExpansionPanelDetails';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Switch from '@material-ui/core/Switch';
import TextField from '@material-ui/core/TextField';
import Typography from '@material-ui/core/Typography';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import ListItemSecondaryAction from '@material-ui/core/ListItemSecondaryAction';
import RemoveIcon from '@material-ui/icons/Remove';
import axios from 'axios';
import Paper from '@material-ui/core/Paper';
import Card from '@material-ui/core/Card';
import SaveIcon from '@material-ui/icons/Save';
import DeleteIcon from '@material-ui/icons/Delete';
import AddIcon from '@material-ui/icons/Add';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';
import Dropzone from 'react-dropzone';
import NewCompanyUserLinkDialog from './newCompanyUserLinkDialog.js';
import Divider from '@material-ui/core/Divider';
import CompanySaveNotification from './saveNotification.js';
import List from '@material-ui/core/List';


//import Typography from '@material-ui/core/Typography';
//import { MuiThemeProvider, createMuiTheme } from 'material-ui/styles'

var config = require('./config.json');
var nbClients;
var once = false;
const apiBaseUrl = config.apiBaseUrl;
//const greenTheme = createMuiTheme({ palette: { primary: {main: '#00984C',contrastText: '#fff'} } });

var today = new Date();
var dd = today.getDate();
var mm = today.getMonth() + 1; //January is 0!
var yyyy = today.getFullYear();
var hh = today.getHours();
var min = today.getMinutes();
var ss = today.getSeconds();

if (dd < 10) {
  dd = '0' + dd;
}

if (mm < 10) {
  mm = '0' + mm;
}
if (hh < 10) {
    hh = '0' + hh;
}
  
if (min < 10) {
    min = '0' + min;
}
if (ss < 10) {
    ss = '0' + ss;
}

var created = yyyy + '-' + mm + '-' + dd +' '+ hh + ":" + min + ":" + ss;

// CLASS TO RENDER ALL THE COMPANIES

class Companies extends Component {
    constructor(props){
      super(props);
      this.state={
          companies: [],
          trigger: true,
          open: false,
          newName: null,
          newDescription: null,
          newPhone: null,
          newCreation: created,
          newStatus: true,
          newEoy: null
          //users: ????,
      }
    };

    handleCompaniesChange() {
        this.componentDidMount();
        this.forceUpdate();
    }
    
    updateCompanies() {
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
                self.setState({companies:response.data});
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
            url: apiBaseUrl+'company',
            headers: {
              Authorization: 'Bearer ' + localStorage.getItem('session'),
              'Content-Type': 'application/json; charset=utf-8'
            }
          })
            .then(function (response) {
              if(response.status === 200){
                if(!once) {
                    once = true;
                    nbClients = response.data.length;
                }
                self.setState({companies:response.data});
              }
            })
            .catch(function (error) {
            });
    }

    saveNewCompany() {
        var self = this;
        console.log("Save new company trigger : "+this.state.newCreation);
        axios({
            method: 'post', //you can set what request you want to be
            url: apiBaseUrl+'company',
            headers: {
              Authorization: 'Bearer ' + localStorage.getItem('session'),
              'Content-Type': 'application/json; charset=utf-8'
            },
            data: {
                "name": this.state.newName,
                "description": this.state.newDescription,
                "phone": this.state.newPhone,
                "creation": this.state.newCreation,
                "status": this.state.newStatus,
                "eoy": this.state.newEoy
            }
          })
            .then(function (response) {
              if(response.status === 200){
                self.setState({ open: false });
                self.handleCompaniesChange();
                this.setState({openSaveNotification: true});
              }
            })
            .catch(function (error) {
            });
    }

    // filter on name & phone
    filterCompanies(searchString) {
        let newCompanies = this.state.companies.slice();
        newCompanies.map((company)=>{
            //mandatory because of the first passage here
            if(company.hidden == undefined) {
                company.hidden = false;
            }
            var initialState=company.hidden;
            if (company.name.toUpperCase().includes(searchString.toUpperCase()) || company.phone.toUpperCase().includes(searchString.toUpperCase())) {
                // if the searchString correspond with company name or phone useless to filter on users
                company.hidden = false;
            } else {
                // else, we keep visible the company only if filter on users match /!\ test on presence of users on the company
                if(company.users.length > 0) {
                    company.users.map((user)=>{
                        if(user.username.toUpperCase().includes(searchString.toUpperCase())) {
                            company.hidden = false;
                        } else {
                            company.hidden = true;
                        }
                        })
                } else {
                    company.hidden = true;  
                }
            }
            //si a la base l'item etait caché
            if(initialState) {
                // s'il y a eu un changement l'item est apparru donc on incremente
                if(initialState!==company.hidden) {
                    nbClients++;
                }
            } else {
                //sinon litem etait visible. En cas de changement on decremente
                if(initialState!==company.hidden) {
                    nbClients--;
                }
            }
        })
        this.setState({companies: newCompanies});
    }

    filterInactiveCompanies(checkedShowInactive) {
        let newCompanies = this.state.companies.slice();
        newCompanies.map((company)=>{
            if(company.hidden == undefined) {
                company.hidden = false;
            }
            var initialState=company.hidden;
            if (!company.status) {
                checkedShowInactive ? company.hidden = false : company.hidden = true;
            }
            //si a la base l'item etait caché
            if(initialState) {
                // s'il y a eu un changement l'item est apparru donc on incremente
                if(initialState!==company.hidden) {
                    nbClients++;
                }
            } else {
                //sinon litem etait visible. En cas de changement on decremente
                if(initialState!==company.hidden) {
                    nbClients--;
                }
            }
        })
        this.setState({companies: newCompanies}); 
    }

    render(){
        if (!localStorage.getItem('isAdvanced')) {
            window.location.href = '/admin'
        }

        let mappedCompanies = this.state.companies.map((company)=>{
          return <Company   key={company.id}
                            id={company.id}
                            description={company.description}
                            name={company.name}
                            phone={company.phone}
                            creation={company.creation}
                            status={company.status}
                            eoy={company.eoy}
                            users={company.users}
                            hidden={company.hidden ? company.hidden : false}
                            updateCompanies={this.updateCompanies.bind(this)}
                />     
        })
        
        var button = 
        <div>
        <Button onClick={() => this.setState({ open: true })} color="primary" className='new-button'>
            <AddIcon />
            company
        </Button>
        <div className='company-header'>
        <input
            placeholder="Search (name, phone, username)"
            updateCompanies={this.updateCompanies.bind(this)}
            onChange={event =>this.filterCompanies(event.target.value)}
        />
        <Paper color="primary" className='company-stats' square={false}>
            <Typography className='company-stats-nb'>You have <b>{nbClients}</b> clients <i>with this filter</i></Typography>
        </Paper>
         <FormControlLabel 
                    className="company-active-filter"
                    control={<Switch checked={this.state.checked} defaultChecked={true} onChange={this.onChange} onClick={event => this.filterInactiveCompanies(event.target.checked)}
                             />} 
                    label="Show inactive" />
        </div>
        <br></br>
        </div>
        return(
            <div>
                {button}
                <Dialog
                    open={this.state.open}
                    aria-labelledby="form-dialog-title"
                    fullWidth
                >
                    <DialogTitle id="new-company-dialog-title">New company</DialogTitle>
                    <DialogContent>
                    <DialogContentText>
                        To create a new company, please fill all fields
                    </DialogContentText>
                    <TextField
                        margin="dense"
                        id="name"
                        label="name"
                        autoFocus
                        required
                        onChange = {(event) => this.setState({newName:event.target.value})}
                        fullWidth
                    />

                    <TextField
                        style={{height:'175px'}}
                        multiline
                        margin="dense"
                        id="description"
                        label="Description"
                        required
                        onChange = {(event) => this.setState({newDescription:event.target.value})}
                        fullWidth
                    />

                    <TextField
                        margin="dense"
                        id="phone"
                        label="phone"
                        required
                        onChange = {(event) => this.setState({newPhone:event.target.value})}
                        fullWidth
                    />

                    <TextField
                        margin="dense"
                        id="eoy"
                        label="EOY"
                        type="date"
                        defaultValue={new Date().getFullYear()+"-12-31"}
                        onChange = {(event) => this.setState({newEoy:event.target.value})} 
                    />

                    <TextField disabled
                        margin="dense"
                        id="status"
                        label="Status"
                        defaultValue={true}
                        onChange = {(event) => this.setState({newStatus:event.target.value})}
                    />

                    </DialogContent>
                    <DialogActions>
                    <Button onClick={() => this.setState({ open: false })} color="primary">
                        Cancel
                    </Button>
                    
                    <Button 
                        onClick={() => this.saveNewCompany()}
                        color="primary">
                        Save
                    </Button>
                    </DialogActions>
                </Dialog>

                <p></p>
                {mappedCompanies}
            </div>
        );
    }
  }

  export default Companies;

  function User(props) {
    return (
        <div>
        <ListItem fullWidth key={props.userId}> 
            <ListItemText>
                <Typography>
                    {props.username}
                </Typography>
            </ListItemText>
            <ListItemSecondaryAction>
                <Button className='button-remove-project'
                    size='small'
                    onClick={() => props.removeUserLink(props.userId)} 
                    color="secondary" >
                        <RemoveIcon />
                        User
                </Button>
            </ListItemSecondaryAction>
        </ListItem>
        <Divider/>
        </div>
    );
}

  class Company extends Component {
    constructor(props){
        super(props);
        this.state={
            id: props.id,
            description: props.description,
            name: props.name,
            phone: props.phone,
            creation: props.creation,
            status: props.status,
            eoy: props.eoy,
            users: props.users,
            openDelete: false,
            openSaveNotification: false
        }
    }

    removeUserLink(userId) {
        var self = this;
        axios({
            method: 'put', //you can set what request you want to be
            url: apiBaseUrl+'profile/'+userId,
            data: {
                'companyId': -1
            },
            headers: {
              Authorization: 'Bearer ' + localStorage.getItem('session'),
              'Content-Type': 'application/json; charset=utf-8'
            }
        }).then(function (response) {
            if(response.status === 200){
                self.props.updateCompanies();
                self.handleCompanyChange();
                self.forceUpdate();
                self.setState({openSaveNotification: true});
            }
        }).catch(function (error) {
        });
    }

    onDrop(files) {
        var self = this;
        files.forEach(function(file) {
            const data = new FormData();
            data.append('upload', file);
            var headers = {
                Authorization: 'Bearer ' + localStorage.getItem('session'),
                'Content-Type': 'application/json; charset=utf-8'
            }
            axios.post(apiBaseUrl+'company/'+self.props.id+'/file', data, {headers:headers})
                .then(function (response) {
                    // self.props.handleProjectChange('modifyTicketFiles');
                    // self.setState({open:true});
                })
                .catch(function (error) {
                    console.log(error);
                });
        });
    }

    saveCompany() {
        var self = this;
        console.log('Status:'+this.state.status)
        axios({
            method: 'put', //you can set what request you want to be
            url: apiBaseUrl+'company/'+this.state.id,
            headers: {
              Authorization: 'Bearer ' + localStorage.getItem('session'),
              'Content-Type': 'application/json; charset=utf-8'
            },
            data: {
                "description": this.state.description,
                "name": this.state.name,
                "phone":this.state.phone,
                "creation":this.state.creation,
                "status": this.state.status,
                "eoy": this.state.eoy
            }
          })
            .then(function (response) {
              if(response.status === 200){
                self.props.updateCompanies();
                self.handleCompanyChange();
                self.forceUpdate();
                self.setState({openSaveNotification: true});
              }
            })
            .catch(function (error) {
            });
    }

    deleteCompany() {
        var self = this;
        axios({
            method: 'delete', //you can set what request you want to be
            url: apiBaseUrl+'company/'+this.state.id,
            headers: {
              Authorization: 'Bearer ' + localStorage.getItem('session'),
              'Content-Type': 'application/json; charset=utf-8'
            }
          })
            .then(function (response) {
              if(response.status === 200){
                self.setState({ openDelete: false });
                self.props.updateCompanies();
              }
            })
            .catch(function (error) {
            });
            self.forceUpdate();
    }

    handleCompanyChange(type, data) {
        this.setState({openSaveNotification: true});
        var self = this;
        axios({
            method: 'get', //you can set what request you want to be
            url: apiBaseUrl+'company/'+this.state.id,
            headers: {
              Authorization: 'Bearer ' + localStorage.getItem('session'),
              'Content-Type': 'application/json; charset=utf-8'
            }
          })
            .then(function (response) {
              if(response.status === 200){
                var newUsers = response.data.users;
                self.setState({users:newUsers});
              }
            })
            .catch(function (error) {
            });
        this.props.handleCompaniesChange();
    }

    getUrlFile(path) {
        var self = this;
        axios({
            method: 'get', //you can set what request you want to be
            url: apiBaseUrl+'company/'+this.state.id+'/file/'+path,
            headers: {
              Authorization: 'Bearer ' + localStorage.getItem('session'),
              'Content-Type': 'application/json; charset=utf-8'
            }
          })
            .then(function (response) {
              if(response.status === 200){
                // self.setState({ openDelete: false });
                // self.props.updateCompanies();
                return response.data;
              }
            })
            .catch(function (error) {
            });
    }


    render() {
        //var dateCreation = new Date(this.state.dateCreation);
        //var parsedCreation = dateCreation.toLocaleString('en-GB', { timeZone: 'UTC' });
        
       var logoUrl = this.state.name.replace(/\s/g,'');

       let mappedUsers = this.state.users.map((user)=>{
        return  <User   key={user.id}
                        userId={user.id}
                        username={user.username}
                        handleCompanyChange={this.handleCompanyChange.bind(this)}
                        removeUserLink={this.removeUserLink.bind(user.id)}
                        
                />
        })

        return (
            <div>
            <ExpansionPanel hidden={this.props.hidden}>
            <ExpansionPanelSummary expandIcon={<ExpandMoreIcon />}>
            <CompanySaveNotification 
                        open={this.state.openSaveNotification} 
                        message={'Company saved: ' + this.state.name}
                        handleClose={() => {this.setState({openSaveNotification:false})}}
                    />
            {/* <Card className='company-card' hidden={this.props.hidden}> */}
            <div className="company-logo">
                <img className='logo-company' src={process.env.PUBLIC_URL + '/company_logo/' + logoUrl} onError={(e)=>{e.target.onerror = null; e.target.src=process.env.PUBLIC_URL + '/company_logo/error.png'}}/>
            </div>
            <div className='company-details'>
                <TextField className='company-name'
                    onChange={event => this.setState({name:event.target.value})}
                    defaultValue={this.state.name}
                    label='Name'
                />

                <TextField className='company-eoy'
                    type='date'
                    onChange={event => this.setState({eoy:event.target.value})}
                    defaultValue={this.state.eoy}   
                    label='EOY'
                />

                <TextField className='company-phone' 
                    onChange={event => this.setState({phone:event.target.value})}
                    defaultValue={this.state.phone}
                    label='Phone'
                />

                <TextField disabled className='company-creation-date'
                    defaultValue={this.state.creation}
                    value={this.state.creation}            
                    label='Creation date'
                />
            </div>
            <div className='company-description' >
                <TextField
                    className='company-description-text'
                    onChange={event => this.setState({description:event.target.value})}
                    onClick ={(event)=>"event.stopPropagation()"}
                    multiline
                    rows='4'
                    defaultValue={this.state.description}
                    label='Description'
                />
            </div>
            <div className='company-actions'>

                <FormControlLabel 
                    className="company-active-switch"
                    control={<Switch checked={this.state.status}
                            onChange = {(event) => this.setState({status:!this.state.status})} />} 
                    label="Active" />
                <Button 
                    className="company-save-button"
                    size="small"
                    color="primary" 
                    onClick={() => this.saveCompany()}>
                    <SaveIcon/> Save
                </Button>
                <Button 
                    onClick={() => this.setState({ openDelete: true })} 
                    size="small"
                    color="secondary" 
                    className='company-delete-button'>
                    <DeleteIcon /> Delete
                </Button>
                <Dialog
                    open={this.state.openDelete}
                    aria-labelledby="form-dialog-title"
                >
                    <DialogTitle id="new-company-dialog-title">Delete</DialogTitle>
                    <DialogContent>
                        <DialogContentText>
                        Are you really sure you want to delete this company ? This operation can't be reverted
                        </DialogContentText>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={() => this.setState({ openDelete: false })} color="primary">
                        Cancel
                        </Button>
                        <Button 
                        onClick={() => this.deleteCompany()}
                        color="secondary"
                        variant="contained">
                        Delete
                        </Button>
                    </DialogActions>
                </Dialog>
            </div>
            </ExpansionPanelSummary>
            <ExpansionPanelDetails>
                <Dropzone className='dropzone-square' accept={config.acceptedFiles} onDrop={(files, rejected) => {this.onDrop(files)}} >
                    <p>Drop file or click to add/update company logo (max: 10M, .png or .jpg)</p>
                </Dropzone>
                <div className="company-users-card">
                <Card>
                    <NewCompanyUserLinkDialog
                        company={this.state.id}
                        handleCompanyChange={this.handleCompanyChange.bind(this)}
                    />
                    {/* <Divider/> */}
                    <List fullWidth className="company-user-element">
                        {mappedUsers}
                    </List>
                </Card>
                </div>
            </ExpansionPanelDetails>
        </ExpansionPanel>
        <br /> 
        </div>
        );
    }

}