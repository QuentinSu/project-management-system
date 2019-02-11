import React, {Component} from 'react';
import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';
import axios from 'axios';
import Card from '@material-ui/core/Card';
import CardMedia from '@material-ui/core/CardMedia';
import SaveIcon from '@material-ui/icons/Save';
import DeleteIcon from '@material-ui/icons/Delete';
import AddIcon from '@material-ui/icons/Add';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';
import Dropzone from 'react-dropzone';


//import Typography from '@material-ui/core/Typography';
//import { MuiThemeProvider, createMuiTheme } from 'material-ui/styles'

var config = require('./config.json');

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
                self.updateCompanies();
              }
            })
            .catch(function (error) {
            });
    }

    // filter on name & phone
    filterCompanies(searchString) {
        let newCompanies = this.state.companies.slice();
        console.log('bite');
        newCompanies.map((company)=>{
            if (company.name.toUpperCase().includes(searchString.toUpperCase()) || company.phone.toUpperCase().includes(searchString.toUpperCase())) {
                company.hidden = false;
            } else {
                company.hidden = true;
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
                            hidden={company.hidden ? company.hidden : false}
                            updateCompanies={this.updateCompanies.bind(this)}
                />     
        })
        
        var button = 
        <Button onClick={() => this.setState({ open: true })} color="primary" className='new-button'>
            <AddIcon />
            company
        </Button>

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
                <div className='company-header'>
                    <input
                        placeholder="Search a company"
                        updateCompanies={this.updateCompanies.bind(this)}
                        onChange={event => this.filterCompanies(event.target.value)}
                    />
                </div>
                <p></p>
                {mappedCompanies}
            </div>
        );
    }
  }

  export default Companies;

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
            openDelete: false
        }
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
                "eoy": this.state.eoy
            }
          })
            .then(function (response) {
              if(response.status === 200){
                self.props.updateCompanies();
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

        return (
            <Card className='company-card' hidden={this.props.hidden}>
            <div>
            <img className='logo-company' src={process.env.PUBLIC_URL + '/company_logo/' + logoUrl} onError={(e)=>{e.target.onerror = null; e.target.src=process.env.PUBLIC_URL + '/company_logo/error.png'}}/>
            {/* // <CardMedia
            //     className='company-logo'
            //     src={this.getUrlFile(logoUrl)}
            //     title="Company Logo"
            // /> */}
            <Dropzone className='dropzone-square' accept={config.acceptedFiles} onDrop={(files, rejected) => {this.onDrop(files)}} >
                <p>Drop file or click to add/update company logo (max: 10M, .png or .jpg)</p>
            </Dropzone>

            <TextField disabled className='company-creation-date'
                defaultValue={this.state.creation}
                value={this.state.creation}            
                label='Creation date'
            />

            <TextField className='company-name'
                onChange={event => this.setState({name:event.target.value})}
                defaultValue={this.state.name}
                label='Name'
            />

            <TextField className='company-phone' 
                onChange={event => this.setState({phone:event.target.value})}
                defaultValue={this.state.phone}
                label='Phone'
            />

            <TextField className='company-description'
                onChange={event => this.setState({description:event.target.value})}
                multiline
                rows='4'
                defaultValue={this.state.description}
                label='Description'
            />
            <TextField className='company-status' 
                onChange={event => this.setState({status:event.target.value})}
                defaultValue={this.state.status}
                label='Status'
            />

            <TextField className='company-eoy'
                type='date'
                onChange={event => this.setState({eoy:event.target.value})}
                defaultValue={this.state.eoy}   
                label='EOY'
            />
            </div>
            
            <div className='company-ticket-buttons'>
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
        </Card>
        );
    }

}