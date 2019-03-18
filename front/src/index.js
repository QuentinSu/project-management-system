import React from 'react';
import ReactDOM from 'react-dom';
import Button from '@material-ui/core/Button';
import Login from './login.js';
import AdminDashboard from './admin.js';
import ClientDashboard from './client.js';
import styles from './styles.css';
import { BrowserRouter as Router, Route } from "react-router-dom";
import { MuiThemeProvider, createMuiTheme } from '@material-ui/core/styles'; 

import JssProvider from 'react-jss/lib/JssProvider';
import { create } from 'jss';
import { createGenerateClassName, jssPreset } from '@material-ui/core/styles';

// Generate class name is used in order to avoid CSS class duplication issues when deploying the app
const generateClassName = createGenerateClassName();
const jss = create(jssPreset());

// The theme used in the whole support website
const theme = createMuiTheme({
  palette: {
    primary: {
      light: '#4f5b62',
      main: '#1A1818',
      dark: '#000a12',
      contrastText: '#fff',
    },
    secondary: {
      light: '#ff7961',
      main: '#f44336',
      dark: '#ba000d',
      contrastText: '#000',
    },
    custom: {
      light: '#ff7961',
      main: '#f44336',
      dark: '#ba000d',
      contrastText: '#000',
    }
  },
});

// The login page main component
function LoginWithTheme() {
  return (
    <JssProvider jss={jss} generateClassName={generateClassName}>
    <MuiThemeProvider theme={theme}>
      <Login/>
    </MuiThemeProvider>
    </JssProvider>
  );
}

// The admin page main component
function AdminWithTheme() {
  return (
    <JssProvider jss={jss} generateClassName={generateClassName}>
    <MuiThemeProvider theme={theme}>
      <AdminDashboard/>
    </MuiThemeProvider>
    </JssProvider>
  );
}

// The client page main component
function ClientWithTheme() {
  return (
    <JssProvider jss={jss} generateClassName={generateClassName}>
    <MuiThemeProvider theme={theme}>
      <ClientDashboard/>
    </MuiThemeProvider>
    </JssProvider>
  )
}

// The routeur function with three routes : login for /, admin for /admin and client for /client
const RouterFunction = () => (
  <Router>
    <div>
      <Route exact path="/" component={LoginWithTheme} />
      <Route path="/admin" component={AdminWithTheme} />
      <Route path="/client" component={ClientWithTheme} />
    </div>
  </Router>
);
  
  // The index page renders the router
ReactDOM.render(RouterFunction(), document.getElementById('root'));
