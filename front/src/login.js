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
import Cookies from 'universal-cookie'
import { array } from 'prop-types';

var config = require('./config.json');

const apiBaseUrl = config.apiBaseUrl;
const cookies = new Cookies();
var rmbMe = false;
var previousSession = cookies.get("remember_me");

var advanced;
{ window.location.href.includes('adv') 
  ? advanced = true
  : advanced = false};

function parseGetUrl() { 
  return window.location.origin;
}

var testurl=parseGetUrl();

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
    };
  }

  /**
   * Render method
   */
  render() {  
    if(previousSession) {
      this.checkLogs(null);
    }
    return (
      <div className={advanced ? "mainlog" : ""}>
      <Dialog open={this.state.open}>
        <DialogTitle>{!previousSession && <p>Invalid credentials</p>}{previousSession && <p>Already log in. Work in progress.</p>}</DialogTitle>
        {!previousSession &&
        <DialogActions>
            <Button onClick={() => {this.setState({open:false})}} color="primary">
                Retry
            </Button>
        </DialogActions>}
      </Dialog>
      {/* <Dialog open={this.state.open}>
        <DialogTitle>Already log in. Connection in progress</DialogTitle>
          <CircularProgress/>
      </Dialog> */}
      <Button  size="small" variant="contained" color={advanced ? "secondary" : "primary"} className='advanced-but' onClick={() => {advanced=!advanced; advanced ? this.setState(window.location.href = '?adv') : this.setState(window.location.href = testurl) }}>
                {/* if on advanced : button to return classical; else button to go advanced mode */}
                { advanced
                  ? 'Switch to classic'
                  : 'Switch to advanced'
                }
      </Button>
      <Card className='login-form'>
        <CardMedia title="Rhys Welsh Logo" className="logo-login">
          <img alt='rhysw_logo' src={process.env.PUBLIC_URL + '/rw.png'}/>
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
              checked={this.state.remember_me} 
              value={this.state.remember_me} 
              onChange={(event) => this.setState({remember_me:event.target.checked})} /><br/>
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
    rmbMe = this.state.remember_me;
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
                // remember me cookie
                if(rmbMe) {
                  let d = new Date();
                  d.setTime(d.getTime() + (60*1000)*(1440*365)); // (60*1000)=1min; 1440=1day. => 1 year
                  cookies.set("remember_me", rmbMe, {path: "/", expires: d} ); //array[payload, localStorage.getItem('session')]
                }
                // If he is and admin, redirect to admin page, else to client page
                if (response.data.is_admin) {
                  localStorage.setItem('isAdmin', true);
                  localStorage.setItem('username', response.data.current_username);
                  if(response.data.is_advanced) {
                    localStorage.setItem('isAdvanced', true);
                    if(advanced) {
                      window.location.href = 'admin/advanced';
                    } else {
                      window.location.href = 'admin';
                    }
                  } else {
                    localStorage.setItem('isAdvanced', false);
                    window.location.href = 'admin';
                  }
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