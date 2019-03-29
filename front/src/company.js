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
import Chip from '@material-ui/core/Chip';
import SaveIcon from '@material-ui/icons/Save';
import DeleteIcon from '@material-ui/icons/Delete';
import AddIcon from '@material-ui/icons/Add';
import PeopleIcon from '@material-ui/icons/People';
import BookIcon from '@material-ui/icons/Book';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';
import Dropzone from 'react-dropzone';
import NewCompanyUserLinkDialog from './newCompanyUserLinkDialog.js';
import Divider from '@material-ui/core/Divider';
import ElementSaveNotification from './saveNotification.js';
import List from '@material-ui/core/List';
import { createMuiTheme } from '@material-ui/core/styles';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import { CSVLink, CSVDownload } from "react-csv";
import StorageIcon from '@material-ui/icons/Storage';

const theme = createMuiTheme({
  palette: {
    primary: {
      // light: will be calculated from palette.primary.main,
      main: '#b5aa55',
      // dark: will be calculated from palette.primary.main,
      // contrastText: will be calculated to contrast with palette.primary.main
    },
    secondary: {
      main: '#00984C',
      // dark: will be calculated from palette.secondary.main,
      contrastText: '#ffcc00',
    },
    disabled: {
        main: '#569864',
    },
    //error: will use the default color
  },
});

const csvData = [
    ["firstname", "lastname", "email"],
    ["Ahmed", "Tomi", "ah@smthing.co.com"],
    ["Raed", "Labes", "afioozofi@zefjf.com"]
];

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

function dateDiff(date) {
    date = date.split('-');
    var today = new Date();
    var year = today.getFullYear();
    var month = today.getMonth() + 1;
    var day = today.getDate();
    var yy = parseInt(date[0],10);
    var mm = parseInt(date[1],10);
    var dd = parseInt(date[2],10);
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
          openSaveNotification: false,
          newTestimonial: false,
          newSocial: false,
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
                console.log('company added');
                self.setState({companies:response.data});
              }
            })
            .catch(function (error) {
            });
        self.forceUpdate();
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
                this.forceUpdate();
              }
            })
            .catch(function (error) {
            });
    }

    saveNewCompany() {
        var self = this;
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
                "testimonial": this.state.newTestimonial,
                "social": this.state.newSocial,
                "eoy": this.state.newEoy
            }
          })
            .then(function (response) {
              if(response.status === 200){
                self.setState({ open: false });
                self.handleCompaniesChange();
                self.setState({openSaveNotification: true});
                nbClients++;
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
            if(company.hidden === undefined) {
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
                        return true;
                        })
                } else {
                    company.hidden = true;  
                }
            }
            /** STATS CONTROL */
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
            return 'filter done';
        })
        this.setState({companies: newCompanies});
        
    }

    filterInactiveCompanies(checkedShowInactive) {
        let newCompanies = this.state.companies.slice();
        newCompanies.map((company)=>{
            if(company.hidden === undefined) {
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
            return true;
        })
        this.setState({companies: newCompanies}); 
    }

    render(){

        const classes = this.props;

        if (localStorage.getItem('isAdvanced')==='false') {
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
                            testimonial={company.testimonial}
                            social={company.social}
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
            className='header-search'
            onChange={event =>this.filterCompanies(event.target.value)}
        />
        <Paper color="primary" className='company-stats' square={false}>
            <Typography className='company-stats-nb'>You have <b>{nbClients}</b> clients</Typography>
        </Paper>
        <MuiThemeProvider theme={theme}>
        <FormControlLabel 
                    className="company-active-filter"
                    control={<Switch checked={this.state.checked} defaultChecked={true} onChange={this.onChange} onClick={event => this.filterInactiveCompanies(event.target.checked)}
                    classes={{
                        root: classes.root,
                        disabled: classes.disabled,
                        checked: classes.checked,
                    }}        />} 
            label="Show inactive" />
            </MuiThemeProvider>
        <Button color="primary" className='data-export' square={false}>
            <StorageIcon/><CSVLink filename={'rhys_companies_csv_'+created} data={this.state.companies} target="_blank">EXPORT CSV</CSVLink>
        </Button>
        </div>
        <br></br>
        </div>
        return(
            <div>
                 <ElementSaveNotification 
                        open={this.state.openSaveNotification} 
                        message={'Company added: ' + this.state.name}
                        handleClose={() => {this.setState({openSaveNotification:false})}}
                    />
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
                        rows='7'
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
                    &nbsp;
                    <TextField disabled
                        margin="dense"
                        id="status"
                        label="Status"
                        defaultValue='active'
                        onChange = {(event) => this.setState({newStatus:event.target.value})}
                    />
                    <TextField disabled
                        margin="dense"
                        id="testimonial"
                        label="Testimonial"
                        defaultValue='active'
                        onChange = {(event) => this.setState({newTestimonial:event.target.value})}
                    />
                    <TextField disabled
                        margin="dense"
                        id="social"
                        label="Social"
                        defaultValue='active'
                        onChange = {(event) => this.setState({newSocial:event.target.value})}
                    />

                    </DialogContent>
                    <DialogActions>
                    <Button onClick={() => this.setState({ open: false })} variant='outlined' color="secondary">
                        Cancel
                    </Button>
                    
                    <Button 
                        onClick={() => this.saveNewCompany()}
                        style = {{
                            background:'#00984C',
                            color: '#ffffff'
                          }}>
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
        <ListItem key={props.userId}> 
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
            testimonial: props.testimonial,
            social: props.social,
            eoy: props.eoy,
            users: props.users,
            thingstoSave:false,
            openDelete: false,
            openSaveNotification: false
        }
    }

    removeUserLink(userId) {
        var self = this;
        axios({
            method: 'delete', //you can set what request you want to be
            url: apiBaseUrl+'company/'+self.state.id+'/user/'+userId,
            headers: {
              Authorization: 'Bearer ' + localStorage.getItem('session'),
              'Content-Type': 'application/json; charset=utf-8'
            }
        }).then(function (response) {
            if(response.status === 200){
                self.handleCompanyChange();
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
                "testimonial": this.state.testimonial,
                "social": this.state.social,
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
        self.forceUpdate();
        this.setState({thingstoSave:false});
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
                self.props.updateCompanies();
                this.setState({openSaveNotification: true});
                self.setState({ openDelete: true });
                nbClients--;
                
              }
            })
            .catch(function (error) {
            });
    }

    handleCompanyChange() {
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
            url: apiBaseUrl+'company/'+self.state.id+'/file/'+path,
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
                        removeUserLink={this.removeUserLink.bind(this)}
                        
                />
        })

        //Live from management
        var dateDifference = dateDiff(this.state.creation);
        var liveFor = dateDifference[0]>0 ? dateDifference[0]+" years " : "0 year ";
        if(dateDifference[1]>0) {
            liveFor += dateDifference[1]+" months ";
        } else {
            liveFor += dateDifference[2]>0 ? dateDifference[2]+" days " : "0 day";
        }

        return (
            <div>
            <ExpansionPanel className='company-card' hidden={this.props.hidden}>
            <ExpansionPanelSummary expandIcon={<ExpandMoreIcon />}>
            <ElementSaveNotification 
                        open={this.state.openSaveNotification} 
                        message={'Company saved: ' + this.state.name}
                        handleClose={() => {this.setState({openSaveNotification:false})}}
                    />
            {/* <Card className='company-card' hidden={this.props.hidden}> */}
            <div className="company-logo">
                <img className='logo-company' alt='company-logo' src={process.env.PUBLIC_URL + '/company_logo/' + logoUrl} onError={(e)=>{e.target.onerror = null; e.target.src=process.env.PUBLIC_URL + '/company_logo/error.png'}}/>
            </div>
            <div className='company-details'>
                <TextField className='company-name'
                    onChange={event => {this.setState({name:event.target.value});;this.setState({thingstoSave:true});}}
                    defaultValue={this.state.name}
                    label='Name'
                />

                <TextField className='company-eoy'
                    type='date'
                    onChange={event => {this.setState({eoy:event.target.value});this.setState({thingstoSave:true});}}
                    defaultValue={this.state.eoy}   
                    label='EOY'
                />

                <TextField className='company-phone' 
                    onChange={event => {this.setState({phone:event.target.value});this.setState({thingstoSave:true});}}
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
                    onChange={event => {this.setState({description:event.target.value});this.setState({thingstoSave:true});}}
                    onClick ={(event)=>"event.stopPropagation()"}
                    multiline
                    rows='4'
                    defaultValue={this.state.description}
                    label='Description'
                />
            </div>
            <div className='company-actions'>
            <div className='company-actions-switches'>
            <MuiThemeProvider theme={theme}>
            <span className="company-active-switch">
                <FormControlLabel
                    labelPlacement='start'
                    fullWidth
                    control={<Switch checked={this.state.status}
                            onChange = {(event) => {this.setState({status:!this.state.status});this.setState({thingstoSave:true});}} />} 
                    label="Active" /></span>
                    <span className="company-active-switch">
                    <BookIcon className="company-active-switch-icon"/>
                     <FormControlLabel 
                    labelPlacement='start'
                    fullWidth
                    control={<Switch checked={this.state.testimonial}
                            onChange = {(event) => {this.setState({testimonial:!this.state.testimonial});this.setState({thingstoSave:true});}} />} 
                    label="Testimonial request" /></span>
                    <span className="company-active-switch">
                    <PeopleIcon className="company-active-switch-icon"/>
                     <FormControlLabel
                    labelPlacement='start'
                    control={<Switch checked={this.state.social}
                            onChange = {(event) => {this.setState({social:!this.state.social});this.setState({thingstoSave:true});}} />} 
                    label="Following on socials" /></span>
                    </MuiThemeProvider>
                </div>
                <div className="company-actions-buttons">
                <div className="company-actions-buttons-elem">
                 <FormControlLabel
                    className='company-live-for'
                    labelPlacement='top'
                    control={<Chip className='company-live' label={liveFor}/>}
                    label="LIVE FOR" />
                
                {this.state.thingstoSave &&
                <Button
                    size="small"
                    style = {{
                        background:'#00984C'
                    }}
                    className="company-save-button"
                    onClick={() => this.saveCompany()}
                    variant="contained"
                    >
                    <SaveIcon/> Save
                </Button>}
                {!this.state.thingstoSave &&
                <Button
                    size="small"
                    className="company-save-button"
                    onClick={() => null}
                    >
                    <SaveIcon/> Save
                </Button>}
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
                </div>
            </div>
            </ExpansionPanelSummary>
            <ExpansionPanelDetails>
                <Dropzone className='dropzone-square' accept={config.acceptedFiles} onDrop={(files, rejected) => {this.onDrop(files)}} >
                    <span className='text-dropzone-company'><p>Drop file or click to add/update company logo (max: 10M, .png or .jpg).<br/>Best if close to square format - Please refresh after change</p></span>
                </Dropzone>
                <div className="company-users-card">
                <Card>
                    <NewCompanyUserLinkDialog
                        company={this.state.id}
                        handleCompanyChange={this.handleCompanyChange.bind(this)}
                    />
                    {/* <Divider/> */}
                    <List className="company-user-element">
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