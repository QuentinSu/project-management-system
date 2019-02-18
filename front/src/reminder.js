import React, {Component} from 'react';
import { MuiThemeProvider, createMuiTheme } from '@material-ui/core/styles';
import StarIcon from '@material-ui/icons/Star';
import { Link, NavLink } from 'react-router-dom';
import axios from 'axios';
import {DeleteProjectDialog, NewProjectDialog, NotifyUsersDialog} from './projectDialog.js'
import Card from '@material-ui/core/Card';
import ExpansionPanel from '@material-ui/core/ExpansionPanel';
import ExpansionPanelSummary from '@material-ui/core/ExpansionPanelSummary';
import ExpansionPanelDetails from '@material-ui/core/ExpansionPanelDetails';
import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';
import Typography from '@material-ui/core/Typography';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import SaveIcon from '@material-ui/icons/Save';
import List from '@material-ui/core/List';
import { withStyles } from 'material-ui/styles';
import PropTypes from 'prop-types';



var config = require('./config.json');

const apiBaseUrl = config.apiBaseUrl;

const reminderTheme = createMuiTheme(
  {overrides: 
    {textField:
        { borderColor:'#f44336',
          background: 'blue',
          color: 'greend',
        },
    },
  },
  // { palette: { primary: {main: '#ffffff'} }, secondary: {main: '#f44336'}}
);

// CLASS TO RENDER ALL THE PROJECTS

class Reminders extends Component {
    constructor(props){
      super(props);
      this.state={
          reminders: [],
          trigger: true
      }
    };
    handleRemindersChange() {
        var self = this;
        axios({
            method: 'get', //you can set what request you want to be
            url: apiBaseUrl+'reminder',
            headers: {
              Authorization: 'Bearer ' + localStorage.getItem('session'),
              'Content-Type': 'application/json; charset=utf-8'
            }
          })
            .then(function (response) {
              if(response.status === 200){
                console.log(response.data);
                self.setState({reminders:response.data});
                this.forceUpdate();
              }
            })
            .catch(function (error) {
              console.log(error.response);
            });
    }
    componentDidMount() {
        var self = this;
        axios({
            method: 'get', //you can set what request you want to be
            url: apiBaseUrl+'reminder',
            headers: {
              Authorization: 'Bearer ' + localStorage.getItem('session'),
              'Content-Type': 'application/json; charset=utf-8'
            }
          })
            .then(function (response) {
              if(response.status === 200){
                console.log(JSON.stringify(response.data));
                self.setState({reminders:response.data});
              }
            })
            .catch(function (error) {
              console.log(error.response);
            });
    }

    filterReminders(label) {
        let newReminders = this.state.reminders.slice();
        newReminders.map((reminder)=>{
            if (reminder.name.toUpperCase().includes(label.toUpperCase()) || reminder.type.toUpperCase().includes(label.toUpperCase())) {
                reminder.hidden = false;
            } else {
                reminder.hidden = true;
            }
        })
        this.setState({reminders: newReminders}); 
    }

    render(){
        // var test = this.getDetailledReminder();
        let mappedReminders = this.state.reminders.map((reminder)=>{
          return <Reminder   key={reminder.id}
                            eoys={reminder.eoys}
                            reminders={reminder.reminders}
                            id={reminder.id}
                            name={reminder.name}
                            status={reminder.status}
                            goLiveDate={reminder.go_live_date}
                            hidden={reminder.hidden ? reminder.hidden : false}
                            handleRemindersChange={this.handleRemindersChange.bind(this)}
                />     
        })
        return(
            <div>
                <div className='project-header'>
                    <input
                        placeholder="Search (e.g: name, special reminder, date)"
                        onChange={event => this.filterReminders(event.target.value)}
                    />
                </div>
                <p></p>
                {mappedReminders}
            </div>
        );
    }
  }

  export default Reminders;


class Reminder extends Component {
    constructor(props){
      super(props);
      this.state={
          id: props.id,
          name: props.name,
          goLiveDate: props.goLiveDate,
          reminders: props.reminders,
          eoys: props.eoys,
          status: props.status,
          openSaveNotification: false,
          openDelete: false,
          hidden: false
      }
    }

    render() {
      const { classes } = this.props;
      let mappedListOfReminders = this.state.reminders.map((reminder)=>{
        return (
        <div>
          <MuiThemeProvider theme={reminderTheme} >
                <TextField className='reminder-deadline'
                    type='date'
                    defaultValue={reminder[3]} 
                    label={reminder[2]}
                />
            </MuiThemeProvider>
                
        </div>
        )
    })
        return (
          <div>
          <ExpansionPanel hidden={this.props.hidden}>
          <ExpansionPanelSummary expandIcon={<ExpandMoreIcon />}>
          {/* <ReminderSaveNotification 
                      open={this.state.openSaveNotification} 
                      message={'Reminder saved: ' + this.state.name}
                      handleClose={() => {this.setState({openSaveNotification:false})}}
                  /> */}
          {/* <Card className='company-card' hidden={this.props.hidden}> */}
          <div className='reminder-details'>
              <TextField className='reminder-name'
                  onChange={event => this.setState({name:event.target.value})}
                  defaultValue={this.state.name}
                  label='Name'
              />

              <TextField className='reminder-golive'
                  type='date'
                  onChange={event => this.setState({goLiveDate:event.target.value})}
                  defaultValue={this.state.goLiveDate}
                  label='EOY'
              />

              <Typography color="textSecondary">
                Status: 
              </Typography>
              <span>&nbsp;&nbsp;</span>
              <Typography>
                  {this.state.status}
              </Typography>
          </div>
          <div className='reminder-actions'>
              <Button 
                  className="reminder-save-button"
                  size="small"
                  color="primary" 
                  onClick={() => this.saveReminder()}>
                  <SaveIcon/> Save
              </Button>
              {this.state.reminders[0]!=="empty" && mappedListOfReminders}
              {/* can't delete reminder beacause reminder always linked with project (project master) */}
          </div>
          </ExpansionPanelSummary>
          <ExpansionPanelDetails>
              
              <Card>
                  Nothing else matters
              </Card>
          </ExpansionPanelDetails>
      </ExpansionPanel>
      <br /> 
      </div>
      );
    }
}