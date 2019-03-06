import React, {Component} from 'react';
import { MuiThemeProvider, createMuiTheme } from '@material-ui/core/styles';
import StarIcon from '@material-ui/icons/Star';
import CheckCircleIcon from '@material-ui/icons/CheckCircle';
import AddIcon from '@material-ui/icons/Add';
import DeleteIcon from '@material-ui/icons/Delete';
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
import HighlightOff from '@material-ui/icons/HighlightOff'
import List from '@material-ui/core/List';
import { withStyles } from 'material-ui/styles';
import PropTypes from 'prop-types';
import Paper from '@material-ui/core/Paper';
import Tooltip from '@material-ui/core/Tooltip';
import Avatar from '@material-ui/core/Avatar';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';
import NewMailReminderDialog, {NewReminderDialog} from './reminderDialog.js';

var config = require('./config.json');

const apiBaseUrl = config.apiBaseUrl;
var remindersState = new Array();

var reminderStatLate;
var reminderStatValidated;
var reminderStatSoon;
var reminderStatActive;
var stats = "";
var firstRender=true;


// CLASS TO RENDER ALL THE REMINDERS CARD

class Reminders extends Component {
  constructor(props){
    super(props);
    this.state={
        remindersCard: [],
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
              self.setState({remindersCard:response.data});
              self.forceUpdate();
            }
          })
          .catch(function (error) {
            console.log(error);
          });
          return 'blup';
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
              self.setState({remindersCard:response.data});
            }
          })
          .catch(function (error) {
            console.log(error);
          });
  }

  filterReminders(label) {
      let newReminders = this.state.remindersCard.slice();
      
      console.log(newReminders);
      newReminders.map((reminder)=>{
        //mandatory because of the first passage here
        if(reminder.hidden == undefined) {
          reminder.hidden = false;
        }
        console.log(reminder.name);
        console.log(label);
          if (reminder.name.toUpperCase().includes(label.toUpperCase())) {
              reminder.hidden = false;
          } else {
              // if()
              reminder.hidden = true;
          }
      });
      this.setState({remindersCard: newReminders}); 
  }

  forceRegenAutoReminders() {
    var self = this;
      axios({
          method: 'put', //you can set what request you want to be
          url: apiBaseUrl+'reminder/autoregen',
          headers: {
            Authorization: 'Bearer ' + localStorage.getItem('session'),
            'Content-Type': 'application/json; charset=utf-8'
          }
        })
          .then(function (response) {
            if(response.status === 200){
            }
          })
          .catch(function (error) {
            console.log(error);
          });
  }

  render(){
      // var test = this.getDetailledReminder();
      let mappedReminders = this.state.remindersCard.map((reminder)=>{
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


      var legendText = <div><br/>
                        <b><h4>Legend</h4></b>
                        <Avatar style={{background: "#00984C", width: 20, height: 20}}></Avatar>Validated<br/>
                        <Avatar style={{background: "#f44336", width: 20, height: 20}}></Avatar>Late<br/>
                        <Avatar style={{background: "#f6ae47", width: 20, height: 20}}></Avatar>Soon (-14 days)<br/>
                        <Avatar style={{background: "#c9c9c9", width: 20, height: 20}}></Avatar>Active<br/>
                      </div>

      var advancedFunction = <div>
                              <div>
                                <b><h4>Advanced function</h4></b>
                                <Button className="button-advanced-reminder" variant="contained" onClick={() => { if (window.confirm('Are you sure you wish to regen all 3m and 6m reminders?')) this.forceRegenAutoReminders()}} fullWidth>Regenerate Reminders (3m, 6m)</Button>
                                {/* Insert here other advanced function buttons */}
                              </div>
                              {legendText}
                            </div>


      return(
          <div>
              <div className='project-header'>
                  <input
                      placeholder="Search (e.g: name, special reminder, date)"
                      handleRemindersChange={this.handleRemindersChange.bind(this)}
                      onChange={event => this.filterReminders(event.target.value)}
                  />
              </div>
              <div>
                <div className='reminder-legend'>
                <Tooltip title={advancedFunction} interactive>
                  <Paper square={false}>Advanced functions & Legend</Paper>
                </Tooltip>
                </div>
              </div>
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
          thingstoSave : false,
          stat:[]
      }
    }

    changeStatus(reminder, projectId, targetStatus) {
      var self = this;
      axios({
            method: 'put', //you can set what request you want to be
            url: apiBaseUrl+'reminder/'+reminder["reminder"][0],
            data: {projectId:projectId["projectId"], status:targetStatus, type:reminder["reminder"][2], deadline:reminder["reminder"][3]},
            headers: {
              Authorization: 'Bearer ' + localStorage.getItem('session'),
              'Content-Type': 'application/json; charset=utf-8'
            }
          }).then(function (response) {
              if(response.status === 200){
                reminder["reminder"][1]=targetStatus;
                self.forceUpdate();
              }
          }).catch(function (error) {
            console.log('error on forcing reminder change status');
        });
    }

    colorReminder(nameCard, reminder) {
      var nameCard = nameCard["nameCard"];
      var today = new Date();
      today.setHours(0,0,0,0);
      var remindDate = new Date(reminder["reminder"][3]);

      var remindDateLessFourteen = new Date(remindDate - 12096e5); //14 days in milliseconds
      if(reminder["reminder"][1]=='ok') {
        reminder["reminder"][4] = 'validated';
        return '#00984C';
      } else {
        if(remindDate < today) {
          reminder["reminder"][4] = 'late';
          return '#f44336';
        } else if(today > remindDateLessFourteen){
          reminder["reminder"][4] = 'soon';
          return '#f6ae47';
        } else {
          reminder["reminder"][4] = 'active';
          return '#c9c9c9';
        }
      }
    }

    handleReminderChange(type, data) {
      this.setState({openSaveNotification: true});
      var self = this;
      switch(type) {
          case 'addRemind':
          case 'deleteReminder':
              this.getReminders(this, this.state.id, function(newReminds) {
                  self.setState({reminders: newReminds});
              });
              this.props.handleRemindersChange();
              break;
          default:
              this.props.handleRemindersChange();
              console.log('unknown type');
      }
  }

    getReminders(reminderThis, projectId, callback) {
      var self = reminderThis;
      axios({
          method: 'get', //you can set what request you want to be
          url: apiBaseUrl+'reminder/'+projectId,
          headers: {
            Authorization: 'Bearer ' + localStorage.getItem('session'),
            'Content-Type': 'application/json; charset=utf-8'
          }
      })
          .then(function (response) {
            if(response.status === 200){
              var remindersNewArray =[];
              (response.data.reminders).forEach(function (remind) {
                  var remindArray=[];
                  remindArray.push(remind['id']);
                  remindArray.push(remind['status']);
                  remindArray.push(remind['type']);
                  remindArray.push(remind['deadline']);
                  remindersNewArray.push(remindArray);
              });
              self.setState({reminders:remindersNewArray});
            }
      })
          .catch(function (error) {
            console.log(error);
      });
      //this.props.handleRemindersChange();
  }

  deleteReminder(reminderId) {
    var self = this;
    axios({
          method: 'delete', //you can set what request you want to be
          url: apiBaseUrl+'reminder/'+reminderId,
          headers: {
            Authorization: 'Bearer ' + localStorage.getItem('session'),
            'Content-Type': 'application/json; charset=utf-8'
          }
        }).then(function (response) {
            if(response.status === 200){
              self.handleReminderChange('deleteReminder', self.state.reminders);
            }
        }).catch(function (error) {
          console.log(error);
      });
  }

    saveReminder(projectid, remindersTab, golive) {
      // project element update : golive (so reminder 3m and 6m date too)
      var self = this;
      axios({
          method: 'put', //you can set what request you want to be
          url: apiBaseUrl+'project/'+projectid,
          data: {goLiveDate:golive},
          headers: {
            Authorization: 'Bearer ' + localStorage.getItem('session'),
            'Content-Type': 'application/json; charset=utf-8'
          }
      }).then(function (response) {
          if(response.status === 200){
              self.props.handleProjectsChange();
          }
      }).catch(function (error) {
      });

      //custom reminder update/add
      remindersTab.forEach(function(remind) {
        if(remind[2]!=="3m" && remind[2]!=="6m") {
          axios({
            method: 'put', //you can set what request you want to be
            url: apiBaseUrl+'reminder/'+remind[0],
            //       $status = $request->get('status');
            //        $type = $request->get('type');
            //        $deadline = $request->get('deadline');
            data: {projectId:projectid, type:remind[2], deadline:remind[3]},
            headers: {
              Authorization: 'Bearer ' + localStorage.getItem('session'),
              'Content-Type': 'application/json; charset=utf-8'
            }
          }).then(function (response) {
              if(response.status === 200){
                self.setState({openSaveNotification: true});
              }
          }).catch(function (error) {
          });
        } else {
          var InitialDate = remind[3];
          if(remind[2]==='3m') {
            remind[3]=self.formatDateRegen3m6mDate(golive, '3m');
          } else if (remind[2]==='6m') {
            remind[3]=self.formatDateRegen3m6mDate(golive, '6m');
          }
          
          if(remind[3]!==InitialDate) {
            remind[1]='notok';
          }
        }
      });
      // self.forceUpdate();
      this.setState({reminders:remindersTab});
      this.setState({thingstoSave:false});
      this.forceUpdate();
    }

    formatDateRegen3m6mDate(dateString, type) {
      if(type = '3m') {
        var d = new Date(dateString),
            month = '' + (d.getMonth()+1-3), //january is 0
            day = '' + d.getDate(),
            year = d.getFullYear();
      } else if(type = '6m') {
        var d = new Date(dateString),
            month = '' + (d.getMonth()+1-6), //january is 0
            day = '' + d.getDate(),
            year = d.getFullYear();
      }
  
      if (month.length < 2) month = '0' + month;
      if (day.length < 2) day = '0' + day;
      return [year, month, day].join('-');
      //this.props.handleRemindersChange();
      // return [year, month, day].join('-');
    }


    formatDateAddOneYear(dateString, reminder) {
      var d = new Date(dateString),
          month = '' + (d.getMonth()+1), //january is 0
          day = '' + d.getDate(),
          year = d.getFullYear()+1;
  
      if (month.length < 2) month = '0' + month;
      if (day.length < 2) day = '0' + day;
      this.setState({thingstoSave:true});
      return [year, month, day].join('-');
      //this.props.handleRemindersChange();
      // return [year, month, day].join('-');
    }

    modifyDate (reminder, value) {
      let tmpTabReminders = Object.create(this.state.reminders);
      this.setState({reminders:tmpTabReminders});
      this.setState({thingstoSave:true});
    }

    render() {
      const classes = this.props;
      let nameCard = this.state.name;
      let cardObject = this;
      let projectId = this.state.id;
      let myTab = [...this.state.reminders];
      if(firstRender) {
        firstRender=false;
        myTab.sort((a, b) => a[3] > b[3]);
      }
      //sort by date
      let mappedListOfReminders = myTab.map((reminder)=>{
      //let mappedListOfReminders = myTab.map((reminder)=>{
        if(reminder!=="empty") {
          var cololor = this.colorReminder({nameCard}, {reminder});

        }
        var autoRemind = (reminder[2]==='3m'||reminder[2]==='6m');
        var shown = (autoRemind || reminder[1]==='ok');
        var remindValid = (!autoRemind && reminder[1] === 'ok');
        return (
          <div className='reminder-element'>
            <MuiThemeProvider>
              <span className="textToCenter"><b>
              {(remindValid || !shown) && reminder[2]}
              {autoRemind && reminder[2]=='3m' && '3 Months to Go'}
              {autoRemind && reminder[2]=='6m' && '6 Months to Go'}
              </b></span>

              <span className="borderRadiusManager">
              <b>
                  <TextField
                      disabled={shown}
                      className='reminder-element-theme'
                      type='date'
                      style={{
                        background: cololor,
                        borderRadius: '20px',
                      }}
                      value={reminder[3]}
                      required={true}
                      InputProps={{
                        className: classes.textField,
                      }}
                      onChange={(event) => {(reminder[3]=event.target.value); this.modifyDate(reminder, event.target.value)} }
                      variant='outlined'
                  />
              </b>
              </span>
            </MuiThemeProvider>
            <span>&nbsp;&nbsp;</span>
            <img className='timeline-reminders' src={process.env.PUBLIC_URL + '/time.png'}></img>
            <div className='reminder-action-buttons'>
            {reminder[1]=='notok' &&
            <Tooltip title="Force validation" interactive>
              <Button
                  className="reminder-button"
                  size="small"
                  color="primary"
                  onClick={() => { if (window.confirm('Are you sure you wish to force validation of this reminder?')) {this.changeStatus({reminder}, {projectId}, 'ok'); this.setState({reminders:myTab}); this.forceUpdate()}}}>
                  <CheckCircleIcon style={{color: "#00984C"}} className="reminder-valid-button"/>
              </Button>
            </Tooltip>}
            {reminder[1]=='ok' &&
            <Tooltip title="Unvalidate reminder" interactive>
              <Button
                  className="reminder-button"
                  size="small"
                  color="primary"
                  onClick={() => { if (window.confirm('Are you sure you wish to cancel validation of this reminder?')) this.changeStatus({reminder}, {projectId}, 'notok')}}>
                  <HighlightOff style={{color: "#f44336"}} className="reminder-unvalid-button"/>
              </Button>
            </Tooltip>}
            
            {reminder[1]=='notok' &&
            <React.Fragment>
              <NewMailReminderDialog  projectId={this.props.id} reminderType={reminder[2]}/></React.Fragment>
            }
            {!autoRemind && reminder[1]=='notok' &&
            <Tooltip title="Add 1 year on reminder date" interactive>
              <Button
                  className="reminder-button" //  reminder-addyear-button"
                  size="small"
                  color="primary"
                  onClick={(event) => {reminder[3]=this.formatDateAddOneYear(reminder[3], reminder); this.setState({reminders:myTab})}}>
                  <AddIcon/><small>1y</small>
              </Button>
            </Tooltip>}
            {!autoRemind &&
            <Tooltip title="Delete custom reminder" interactive>
              <Button
                  className="reminder-button"// reminder-delete-button"
                  size="small"
                  color="primary"
                  onClick={() => { if (window.confirm('Are you sure you wish to delete this reminder?')) this.deleteReminder(reminder[0])}}>
    
                  <DeleteIcon style={{color: "#f44336"}} />
              </Button>
            </Tooltip>}
            </div>
          </div>
        )
    })

    let mappedEoys = this.state.eoys.sort((a, b) => a[1] > b[1]).map((eoy)=>{
      if(eoy != 'noCompaniesLinked') {
        return (
          <div className='reminder-eoy'>
          <MuiThemeProvider>
                EOY {eoy[0]}
                  <TextField disabled
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
          </div>
        )
      } else return null;
    })

    // this.countReminderState(this.state.id, this.state.name, this.state.reminders);
    // this.remindersStats();

    var backTimeUrl= process.env.PUBLIC_URL + "/time.png";
    
    return (
      <div hidden={this.props.hidden}> 
      <Card className="reminder-card">
      {/* <ReminderSaveNotification 
                  open={this.state.openSaveNotification} 
                  message={'Reminder saved: ' + this.state.name}
                  handleClose={() => {this.setState({openSaveNotification:false})}}
              /> */}
      <div className='reminder-details'>
          <Avatar className='reminder-avatar' style={{background: "#00984C"}}>{this.state.reminders[0]==='empty' ? 0 : this.state.reminders.length}</Avatar>
          <text className='reminder-name'>
              {this.state.name}
          </text>
          <TextField className='reminder-golive'
              type='date'
              onChange={event => {this.setState({goLiveDate:event.target.value}); this.setState({thingstoSave:true})}}
              defaultValue={this.state.goLiveDate}
              label='Go Live Date'
          />
        </div>
        <div className='reminder-list'>
          {this.state.reminders[0]!=="empty" && mappedListOfReminders}

        </div>
        
        <div className='eoy-list'>
            {mappedEoys}
          </div>
        <div className="reminder-save-button">
          <NewReminderDialog
              projectId={this.props.id}
              type={this.props.type}
              deadline={this.props.deadline}
              handleReminderChange={this.handleReminderChange.bind(this)}

          />
          {this.state.thingstoSave &&
          <Button
              size="small"
              style = {{
                background:'#00984C'
              }}
              onClick={() => {this.saveReminder(this.state.id, myTab, this.state.goLiveDate);  myTab.sort((a, b) => a[3] > b[3])}}
              variant="contained"
              >
              <SaveIcon/> Save changes
          </Button>}
          {!this.state.thingstoSave &&
          <Button
              size="small"
              onClick={() => {this.saveReminder(this.state.id, myTab, this.state.goLiveDate);  myTab.sort((a, b) => a[3] > b[3])}}
              >
              <SaveIcon/> Save changes
          </Button>}
              
        </div>
      </Card>
      <br /> 
      </div>
      );
    }
}