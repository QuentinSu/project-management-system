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
import Paper from '@material-ui/core/Paper';
import Tooltip from '@material-ui/core/Tooltip';
import Avatar from '@material-ui/core/Avatar';


var config = require('./config.json');

const apiBaseUrl = config.apiBaseUrl;
var remindersState = [];

// const reminderTheme = createMuiTheme(
//   {overrides: 
//     {textField:
//         { borderColor:'#f44336',
//           background: 'green',
//         },
//     },
//   },
//   // { palette: { primary: {main: '#ffffff'} }, secondary: {main: '#f44336'}}
// );

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

        var legendText = <div><Avatar style={{background: "#00984C", width: 20, height: 20}}></Avatar>Validated<br/>
                          <Avatar style={{background: "#f44336", width: 20, height: 20}}></Avatar>Late<br/>
                          <Avatar style={{background: "#f6ae47", width: 20, height: 20}}></Avatar>Soon (-14 days)<br/>
                          <Avatar style={{background: "#c9c9c9", width: 20, height: 20}}></Avatar>Active<br/></div>
        return(
            <div>
                <div className='project-header'>
                    <input
                        placeholder="Search (e.g: name, special reminder, date)"
                        onChange={event => this.filterReminders(event.target.value)}
                    />
                </div>
                <Tooltip title={legendText} interactive>
                  <Paper className='reminder-legend' square={false}>Legend</Paper>
                  </Tooltip>
                  <br/><p></p>
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

    colorReminder(reminder) {
      var today = new Date();
      today.setHours(0,0,0,0);
      console.log(today);
      var remindDate = new Date(reminder["reminder"][3]);

      var remindDateLessFourteen = new Date(remindDate - 12096e5); //14 days in milliseconds
      console.log("Remind date : "+remindDate);
      console.log("Less 14 days : "+remindDateLessFourteen);
      if(remindDate < today) {
        return '#f44336';
      } else if(today > remindDateLessFourteen){
        return '#f6ae47';
      } else {
        return '#c9c9c9';
      }
    }

    render() {
      const classes = this.props;
      let mappedListOfReminders = this.state.reminders.map((reminder)=>{
        if(reminder!=="empty") {
          var cololor = this.colorReminder({reminder});
        }
        return (
          <div className='reminder-element'>
            <MuiThemeProvider>
              {reminder[2]}
                <TextField
                    className='reminder-element-theme'
                    type='date'
                    style={{
                      background: (reminder[1]=='ok') ? "#00984C" : cololor,
                    }}
                    defaultValue={reminder[3]}
                    InputProps={{
                      className: classes.textField,
                    }}
                    variant="outlined"
                />
            </MuiThemeProvider>
            <span>&nbsp;&nbsp;</span>
          </div>
        )
    })
    let mappedEoys = this.state.eoys.map((eoy)=>{
      return (
        <div className='reminder-eoy'>
        <MuiThemeProvider>
              EOY+{eoy[0]}
                <TextField
                    className='eoy-element-theme'
                    type='date'
                    style={{
                      
                    }}
                    defaultValue={eoy[1]}
                    InputProps={{
                      className: classes.textField,
                    }}
                    variant="outlined"
                /> 
            </MuiThemeProvider>
            <span>&nbsp;&nbsp;</span>
        </div>
      )
    })
    return (
      <div>
      <Card className="reminder-card" hidden={this.props.hidden}>
      {/* <ReminderSaveNotification 
                  open={this.state.openSaveNotification} 
                  message={'Reminder saved: ' + this.state.name}
                  handleClose={() => {this.setState({openSaveNotification:false})}}
              /> */}
      {/* <Card className='company-card' hidden={this.props.hidden}> */}
      <div className='reminder-details'>
          <Avatar className='reminder-avatar' style={{background: "#00984C"}}>{this.state.reminders.length}</Avatar>
          <text className='reminder-name'>
              {this.state.name}
          </text>

          <TextField className='reminder-golive'
              type='date'
              onChange={event => this.setState({goLiveDate:event.target.value})}
              defaultValue={this.state.goLiveDate}
              label='Go Live Date'
          />

          {/* <Typography color="textSecondary">
            Status: 
          </Typography>
          <span>&nbsp;&nbsp;</span>
          <Typography>
              {this.state.status}
          </Typography> */}
        </div>
        <div className='reminder-list'>
          {this.state.reminders[0]!=="empty" && mappedListOfReminders}
          {/* can't delete reminder beacause reminder always linked with project (project master) */}
        </div>
          <Button 
              className="reminder-save-button"
              size="small"
              color="primary"
              onClick={() => this.saveReminder()}>
              <SaveIcon/> Save
          </Button>
      </Card>
      <br /> 
      </div>
      );
    }
}