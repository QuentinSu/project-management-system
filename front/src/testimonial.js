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

// CLASS TO RENDER ALL THE TESTIMONIALS

class Testimonials extends Component {
    constructor(props){
      super(props);
      this.state={
          testimonials: [],
          trigger: true,
          open: false,
          newAuthor: null,
          newDescription: null
      }
    };
    updateTestimonials() {
        var self = this;
        axios({
            method: 'get', //you can set what request you want to be
            url: apiBaseUrl+'testimonial',
            headers: {
              Authorization: 'Bearer ' + localStorage.getItem('session'),
              'Content-Type': 'application/json; charset=utf-8'
            }
          })
            .then(function (response) {
              if(response.status === 200){
                self.setState({testimonials:response.data});
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
            url: apiBaseUrl+'testimonial',
            headers: {
              Authorization: 'Bearer ' + localStorage.getItem('session'),
              'Content-Type': 'application/json; charset=utf-8'
            }
          })
            .then(function (response) {
              if(response.status === 200){
                self.setState({testimonials:response.data});
              }
            })
            .catch(function (error) {
            });
    }

    saveNewTestimonial() {
        var self = this;
        axios({
            method: 'post', //you can set what request you want to be
            url: apiBaseUrl+'testimonial',
            headers: {
              Authorization: 'Bearer ' + localStorage.getItem('session'),
              'Content-Type': 'application/json; charset=utf-8'
            },
            data: {
                "description": this.state.newDescription,
                "author": this.state.newAuthor
            }
          })
            .then(function (response) {
              if(response.status === 200){
                self.setState({ open: false });
                self.updateTestimonials();
              }
            })
            .catch(function (error) {
            });
    }

    render(){
        let mappedTestimonials = this.state.testimonials.map((testimonial)=>{
          return <Testimonial   key={testimonial.id}
                            id={testimonial.id}
                            description={testimonial.description}
                            author={testimonial.author}
                            created={testimonial.created}
                            modified={testimonial.modified}
                            updateTestimonials={this.updateTestimonials.bind(this)}
                            isClient={this.props.isClient}
                />     
        })
        if (this.props.isClient === true) {
            var button = 
              <div className='new-testimonial'>
                <MuiThemeProvider theme={greenTheme}>
                <Button
                  onClick={() => this.setState({ open: true })}
                  color="primary"
                  variant="contained">
                      <AddIcon /> Add a new testimonial
                </Button>
                </MuiThemeProvider>
              </div>
            var status = null
          } else {
            var button = 
            <Button onClick={() => this.setState({ open: true })} color="primary" className='new-button'>
                <AddIcon />
                Testimonial
            </Button>
        }
        return(
            <div>
                {button}
                <Dialog
                    open={this.state.open}
                    aria-labelledby="form-dialog-title"
                    fullWidth
                >
                    <DialogTitle id="new-project-dialog-title">New Testimonial</DialogTitle>
                    <DialogContent>
                    <DialogContentText>
                        To create a new testimonial, please fill all fields
                    </DialogContentText>
                    <TextField
                        style={{height:'175px'}}
                        multiline
                        autoFocus
                        margin="dense"
                        id="description"
                        label="Description"
                        required
                        onChange = {(event) => this.setState({newDescription:event.target.value})}
                        fullWidth
                    />
                    <TextField
                        margin="dense"
                        id="author"
                        label="author"
                        required
                        onChange = {(event) => this.setState({newAuthor:event.target.value})}
                        fullWidth
                    />
                    </DialogContent>
                    <DialogActions>
                    <Button onClick={() => this.setState({ open: false })} color="primary">
                        Cancel
                    </Button>
                    <Button 
                        onClick={() => this.saveNewTestimonial()}
                        color="primary">
                        Save
                    </Button>
                    </DialogActions>
                </Dialog>
                <p></p>
                {mappedTestimonials}
            </div>
        );
    }
  }

  export default Testimonials;

  class Testimonial extends Component {
    constructor(props){
        super(props);
        this.state={
            id: props.id,
            description: props.description,
            author: props.author,
            created: props.created,
            modified: props.modified,
            openDelete: false
        }
    }

    saveTestimonial() {
        var self = this;
        axios({
            method: 'put', //you can set what request you want to be
            url: apiBaseUrl+'testimonial/'+this.state.id,
            headers: {
              Authorization: 'Bearer ' + localStorage.getItem('session'),
              'Content-Type': 'application/json; charset=utf-8'
            },
            data: {
                "description": this.state.description,
                "author": this.state.author
            }
          })
            .then(function (response) {
              if(response.status === 200){
                self.props.updateTestimonials();
              }
            })
            .catch(function (error) {
            });
    }

    deleteTestimonial() {
        var self = this;
        axios({
            method: 'delete', //you can set what request you want to be
            url: apiBaseUrl+'testimonial/'+this.state.id,
            headers: {
              Authorization: 'Bearer ' + localStorage.getItem('session'),
              'Content-Type': 'application/json; charset=utf-8'
            }
          })
            .then(function (response) {
              if(response.status === 200){
                self.setState({ openDelete: false });
                self.props.updateTestimonials();
              }
            })
            .catch(function (error) {
            });
    }

    render() {
        var creation = new Date(this.state.created);
        var parsedCreation = creation.toLocaleString('en-GB', { timeZone: 'UTC' });
        var modified = new Date(this.state.modified);
        var parsedModify = modified.toLocaleString('en-GB', { timeZone: 'UTC' });
        return (
            <Card className='testimonial-card'>
        <div>
            {!this.props.isClient &&
            <TextField 
                disabled
                defaultValue={this.state.id}
                label='ID'
            />
            }
            {!this.props.isClient &&
            <TextField disabled fullWidth
                defaultValue={parsedCreation}
                label='Creation date'
            />
            }
            {!this.props.isClient &&
            <TextField disabled fullWidth
                defaultValue={parsedModify}
                label='Last modified'
            />
            }
            {!this.props.isClient &&
            <TextField fullWidth
                onChange={event => this.setState({author:event.target.value})}
                defaultValue={this.state.author}
                label='Author'
            />
            }
            {!this.props.isClient &&
            <TextField fullWidth
                onChange={event => this.setState({description:event.target.value})}
                multiline
                defaultValue={this.state.description}
                label='Description'
            />
            }
            {this.props.isClient && 
            <div>
                <Typography>
                {this.state.description}
                </Typography>
                <Typography color="textSecondary">
                    Author: {this.state.author}
                </Typography>
            </div>     
            }
            </div>
            {!this.props.isClient &&
            <div className='ticket-buttons'>
                <Button 
                    className="save-button"
                    size="small"
                    color="primary" 
                    onClick={() => this.saveTestimonial()}>
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
                    Are you really sure you want to delete this testimonial ? This operation can't be reverted
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => this.setState({ openDelete: false })} color="primary">
                    Cancel
                    </Button>
                    <Button 
                    onClick={() => this.deleteTestimonial()}
                    color="secondary"
                    variant="contained">
                    Delete
                    </Button>
                </DialogActions>
                </Dialog>
            </div>
            }
        </Card>
        );
    }

}