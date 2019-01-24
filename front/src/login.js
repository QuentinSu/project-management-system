import React, {Component} from 'react';
import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';
import axios from 'axios';
import Card from '@material-ui/core/Card';
import CardMedia from '@material-ui/core/CardMedia';
import CardContent from '@material-ui/core/CardContent';
import Footer from './footer.js';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogTitle from '@material-ui/core/DialogTitle';
import { Checkbox } from '@material-ui/core';

var config = require('./config.json');

const apiBaseUrl = config.apiBaseUrl;

/**
 * Login component logs the user, stores its token in local storage and redirects to admin / client page
 */
class Login extends Component {

  /**
   * React component constructor
   */
  constructor(props){
    super(props);
    this.state={
    username:'',
    password:'',
    open: false,
    remember_me: false
    }
  }

  /**
   * Render method
   */
  render() {
    return (
      <div>
      <Dialog open={this.state.open}>
        <DialogTitle>Invalid credentials</DialogTitle>
        <DialogActions>
            <Button onClick={() => {this.setState({open:false})}} color="primary">
                Retry
            </Button>
        </DialogActions>
      </Dialog>
      <Card className='login-form'>
        <CardMedia title="Rhys Welsh Logo" className="logo-login">
          <img src={process.env.PUBLIC_URL + '/rw.png'}/>
        </CardMedia>
        <CardContent>
          <TextField
            label="Username"
            onChange = {(event) => this.setState({username:event.target.value})}
            />
          <br/>
            <TextField
              label="Password"
              type="password"
              onChange = {(event) => this.setState({password:event.target.value})}
              onKeyPress={(ev) => {
                if (ev.key === 'Enter') {
                  this.checkLogs(ev);
                }
              }}
              />
            <br/>
            <label htmlFor="remember_me">Remember me</label>
            <Checkbox type="checkbox"
              id="remember_me"
              ref="remember_me" 
              label="Remember Me"
              onChange={(event) => this.setState({remember_me:event.target.checked})} 
              defaultChecked /><br/>
            <Button  
              className="login-button"
              variant="contained" 
              color="primary" 
              label="Submit" 
              primary={true} 
              onClick={(event) => this.checkLogs(event)}>
              Login
            </Button>
        </CardContent>
      </Card>
      <Footer/>
      </div>
    );
    }

  /**
   * API call to verify if given logs are valid
   */
  checkLogs(event) {
    var self = this;
    var payload={
      "username":this.state.username,
      "password":this.state.password,
      "remember_me":this.state.remember_me
    }
    // We call the API
    axios({
      method: 'post', //you can set what request you want to be
      url: apiBaseUrl+'login',
      data: payload,
      headers: {
        //Authorization: 'Bearer ' + varToken
        'Content-Type': 'application/json; charset=utf-8'
      }
    })
      .then(function (response) {
        if(response.status === 200){
          localStorage.setItem('session',JSON.stringify(response.data.token));
          axios({
            method: 'get', //you can set what request you want to be
            url: apiBaseUrl+'profile',
            headers: {
              Authorization: 'Bearer ' + localStorage.getItem('session'),
              'Content-Type': 'application/json; charset=utf-8'
            }
          })
            .then(function (response) {
              // If the user is logged
              if(response.status === 200){
                // If he is and admin, redirect to admin page, else to client page
                if (response.data.is_admin) {
                  localStorage.setItem('isAdmin', true);
                  localStorage.setItem('username', response.data.current_username);
                  window.location.href = 'admin';
                } else {
                  localStorage.setItem('isAdmin', false);
                  localStorage.setItem('username', response.data.username);
                  window.location.href = 'client';
                }
              }
              // If he put invalid credentials
              else {
                self.setState({open:true})
              }
            })
          .catch(function (error) {
            self.setState({open:true})
          });
        }
        else {
          self.setState({open:true})
        }
      })
    .catch(function (error) {
      self.setState({open:true})
    });
  }
}

export default Login;