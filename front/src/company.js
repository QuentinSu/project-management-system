import React, {Component} from 'react';
import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';
import axios from 'axios';
import Card from '@material-ui/core/Card';
import SaveIcon from '@material-ui/icons/Save';
import DeleteIcon from '@material-ui/icons/Delete';
import AddIcon from '@material-ui/icons/Add';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';
import Typography from '@material-ui/core/Typography';
import { MuiThemeProvider, createMuiTheme } from 'material-ui/styles'

var config = require('./config.json');

const apiBaseUrl = config.apiBaseUrl;
const greenTheme = createMuiTheme({ palette: { primary: {main: '#00984C',contrastText: '#fff'} } })

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
          newDateCreation: null
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
                "dateCreation": new Date()
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
                            dateCreation={company.dateCreation}
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

  class Company extends Component {
    constructor(props){
        super(props);
        this.state={
            id: props.id,
            description: props.description,
            name: props.name,
            phone: props.phone,
            dateCreation: props.dateCreation,
            openDelete: false
        }
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
                "dateCreation":this.state.dateCreation
            }
          })
            .then(function (response) {
              if(response.status === 200){
                self.props.updateCompany();
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

    render() {
        var creation = new Date(this.state.dateCreation);
        var parsedCreation = creation.toLocaleString('en-GB', { timeZone: 'UTC' });
       
        return (
            <Card className='company-card'>
        <div>
        
            <TextField 
                disabled
                defaultValue={this.state.id}
                label='ID'
            />
            Date : {this.state.dateCreation} / {parsedCreation}
            <TextField disabled
                defaultValue={parsedCreation}
                value={this.state.dateCreation}            
                label='Creation date'
            />
            
            <TextField fullWidth
                onChange={event => this.setState({name:event.target.value})}
                defaultValue={this.state.name}
                label='Name'
            />
                
            <TextField fullWidth
                onChange={event => this.setState({description:event.target.value})}
                multiline
                defaultValue={this.state.description}
                label='Description'
            />

            <TextField fullWidth
                onChange={event => this.setState({phone:event.target.value})}
                defaultValue={this.state.phone}
                label='Phone'
            />
            
            </div>
            
            <div className='ticket-buttons'>
                <Button 
                    className="save-button"
                    size="small"
                    color="primary" 
                    onClick={() => this.saveCompany()}>
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