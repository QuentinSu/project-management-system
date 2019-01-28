import React, {Component} from 'react';
import { MuiThemeProvider, createMuiTheme } from '@material-ui/core/styles';
import CloudUploadIcon from '@material-ui/icons/CloudUpload';
import StarIcon from '@material-ui/icons/Star';
import { Link, NavLink } from 'react-router-dom'
import AppBar from 'material-ui/AppBar';
import Typography from '@material-ui/core/Typography';
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';
import Button from '@material-ui/core/Button';
import Projects from './project.js';
import Testimonials from './testimonial.js'
import PropTypes from 'prop-types';
import Users from './user.js'
import Footer from './footer.js';
// import Button from '@material-ui/core/Button';
// import Badge from '@material-ui/core/Badge';
// import MailIcon from '@material-ui/icons/Mail';
import Notifications from './notification.js';
import {UserMenu} from './user.js';

const whiteTheme = createMuiTheme({ palette: { primary: {main: '#ffffff'}, secondary: {main: '#f44336'} } });

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
    return (
        <div className='Tabs'>
            <AppBar position="static">
            <img className='logo-dashboard' alt='logo RW' src={process.env.PUBLIC_URL + '/rw.png'}/>
            <Notifications/>
            <MuiThemeProvider theme={whiteTheme} >
              <Button variant="contained" color='primary' size="small" className='advanced-but-dashboard' onClick={() => {this.setState(window.location.href = '/admin/advanced');}}>
                {/* if on advanced : button to return classical; else button to go advanced mode */}
                prout
                {/* {this.props.location.pathname} */}
              </Button>

            </MuiThemeProvider>
            <UserMenu username={localStorage.getItem('username')}/>
            <Tabs className='dashboard-tabs' value={this.state.tabValue} onChange={this.handleChange}>
                <Tab label="Projects" />
                <Tab label="Users" />
                <Tab label="Testimonials" />
            </Tabs>
            </AppBar>
            {this.state.tabValue === 0 && <TabContainer><Projects/></TabContainer>}
            {this.state.tabValue === 1 && <TabContainer><Users/></TabContainer>}
            {this.state.tabValue === 2 && <TabContainer><Testimonials/></TabContainer>}
            <Footer/>
        </div>
    );
  }
}

export default AdminDashboard;