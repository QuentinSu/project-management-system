import React, {Component} from 'react';
import { MuiThemeProvider, createMuiTheme } from '@material-ui/core/styles';
import StarIcon from '@material-ui/icons/StarRounded';
import StarHalf from '@material-ui/icons/StarHalfRounded';
import AppBar from 'material-ui/AppBar';
import Typography from '@material-ui/core/Typography';
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';
import Button from '@material-ui/core/Button';
import Projects from './project.js';
import Testimonials from './testimonial.js';
import Companies from './company.js';
import Reminders from './reminder.js';
import Servers from './server.js';
import Marketing from './marketing.js';
import MailsManagement from './mailManagement.js';
import PropTypes from 'prop-types';
import Users from './user.js';
import Footer from './footer.js';
// import Button from '@material-ui/core/Button';
// import Badge from '@material-ui/core/Badge';
// import MailIcon from '@material-ui/icons/Mail';
import Notifications from './notification.js';
import {UserMenu} from './user.js';

const whiteTheme = createMuiTheme(
  {overrides: 
    {MuiButton: 
      {text: 
        { borderColor:'#f44336',
          background: 'linear-gradient(45deg, white 30%, #c9c9c9 90%)',
          color: 'black',
        },
      },
    }, 
  typography: 
    {useNextVariants: true }
  },
  // { palette: { primary: {main: '#ffffff'} }, secondary: {main: '#f44336'}}
);

var advanced;
{ window.location.href.includes('advanced') 
  ? advanced = false
  : advanced = true};

var activeTab = '';

/**
 * React component that represents a tab with a particular style
 */
function TabContainer(props) {
    return (
      <Typography component="div" style={{ padding: 8 * 3 }}>
        {props.children}
      </Typography>
    );
  }
  
TabContainer.propTypes = {
    children: PropTypes.node.isRequired,
};

/**
 * React component that represents the admin dashboard
 */
class AdminDashboard extends Component {
  constructor(props){
    super(props);
    this.state={
        tabValue: 0,
    }
  };

  /**
   * Function to change the value of the tab (projects, users, testimonials...)
   */
  handleChange = (event, tabValue) => {
    this.setState({ tabValue });
    activeTab = {tabValue};
  };


  /**
   * Rendering function
   */
  render() {
    // If the user is not an admin, access to this page is not granted
    // Note that this is note a securized way of doing it, ofc, but there is also a server side protection
    if (!localStorage.getItem('isAdmin')) {
      window.location.href = '/client'
    }
    var buttonPanel;
    if(localStorage.getItem('isAdvanced')) {
        console.log(localStorage.getItem('isAdvanced'));
        buttonPanel = <Button size="small" className='advanced-but-dashboard' onClick={() => {advanced=!advanced; advanced ? window.location.href = '/admin' : window.location.href = '/admin/advanced' }}>
        {/* if on advanced : button to return classical; else button to go advanced mode */}
        <div id='advanced-but-dashboard-long-text'>
        { advanced
          ? 'ADMIN PANEL'
          : 'USER PANEL'
        }</div>
        <div id='advanced-but-dashboard-short-text' >
        { advanced
          ? <StarHalf />
          : <StarIcon />
        }</div>
      </Button>
    } else {
      buttonPanel = <Typography className='advanced-but-dashboard'>Dashboard</Typography>
    }

    return (
        <div className='Tabs'>
            <AppBar position="static">
            <img className='logo-dashboard' alt='logo RW' src={process.env.PUBLIC_URL + '/rw.png'} onClick={() => {this.setState(window.location.href = '/admin')}}/>
            <Notifications/>
            {localStorage.getItem('isAdvanced') &&
            <MuiThemeProvider theme={whiteTheme} >
              {buttonPanel}
            </MuiThemeProvider>}
            <UserMenu username={localStorage.getItem('username')}/>
              {/* If you are in class view, we show projects/users/testimaniols, else advanced admin view (clients, reminders, ...) */}
              { advanced ? (
                <Tabs className='dashboard-tabs' value={this.state.tabValue} onChange={this.handleChange}>
                  <Tab label="Projects" />
                  <Tab label="Users" />
                  <Tab label="Testimonials" />  
                </Tabs>
              ) : (
                <Tabs className='dashboard-tabs' value={this.state.tabValue} onChange={this.handleChange}>
                  <Tab label="Clients"/>
                  <Tab label="Reminders"/>
                  <Tab label="Servers" />
                  <Tab label="Marketing" />
                  <Tab label="Manage mail" />
                </Tabs>
              )}
              </AppBar>
              
              {(this.state.tabValue === 0) && <TabContainer> {advanced ? <Projects/> : <Companies/>}</TabContainer>}
              {(this.state.tabValue === 1) && <TabContainer>{advanced ? <Users/> : <Reminders/>}</TabContainer>}
              {(this.state.tabValue === 2) && <TabContainer>{advanced ? <Testimonials/> : <Servers/>}</TabContainer>}
              {(this.state.tabValue === 3) && <TabContainer><Marketing/></TabContainer>}
              {(this.state.tabValue === 4) && <TabContainer><MailsManagement/></TabContainer>}
            <Footer/>
        </div>
    );
  }
}

export default AdminDashboard;
export {activeTab};