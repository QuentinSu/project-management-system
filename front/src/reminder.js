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
          hidden: false
      }
    }

    changeStatus(cardObject, reminder, projectId, targetStatus) {
      var self = cardObject['cardObject'];
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
                cardObject['cardObject'].forceUpdate();
              }
          }).catch(function (error) {
            console.log('error on forcing reminder change status');
        });
      self.forceUpdate();
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
              this.getReminders(this.state.id, function(newReminds) {
                  self.setState({reminders: newReminds});
              });
              this.props.handleRemindersChange();
              break;
          case 'deleteReminder':
              this.props.handleRemindersChange();
              break;
          default:
              this.props.handleRemindersChange();
              console.log('unknown type');
      }
  }

    getReminders(projectId, callback) {
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
              //this.setState({reminders: response.data.reminders});
              callback(response.data.reminders);
              // this.forceUpdate();
            }
      })
          .catch(function (error) {
      });
      //this.props.handleRemindersChange();
  }

  deleteReminder(cardObject, reminder) {
    var self = cardObject['cardObject'];
    axios({
          method: 'delete', //you can set what request you want to be
          url: apiBaseUrl+'reminder/'+reminder["reminder"][0],
          headers: {
            Authorization: 'Bearer ' + localStorage.getItem('session'),
            'Content-Type': 'application/json; charset=utf-8'
          }
        }).then(function (response) {
            if(response.status === 200){
              cardObject['cardObject'].forceUpdate();
            }
        }).catch(function (error) {
          console.log('error on delete reminder');
      });
    self.forceUpdate();
  }

    saveReminder(projectid, reminders, golive) {
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
              this.forceUpdate();
              self.props.handleProjectsChange();
          }
      }).catch(function (error) {
      });

      //custom reminder update/add
      reminders.forEach(function(remind) {
        if(remind[2]!="3m" && remind[2]!="6m") {
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
                this.setState({openSaveNotification: true});
              }
          }).catch(function (error) {
          });
        }
      });
      this.props.handleRemindersChange();
      self.forceUpdate();
    }

    // countReminderState(id, name, reminders) {
    //   if(reminders[0]!=='empty') {
    //       var cardReminderStateEntete = new Array();
    //       cardReminderStateEntete[0] = id;
    //       cardReminderStateEntete[1] = name;

    //       var cardReminderLateState = new Array();
    //       cardReminderLateState.push('late');
    //       var cardReminderValidatedState = new Array();
    //       cardReminderValidatedState.push('validated');
    //       var cardReminderSoonState = new Array();
    //       cardReminderSoonState.push('soon');
    //       var cardReminderActiveState = new Array();
    //       cardReminderActiveState.push('active');

    //       cardReminderLateState = cardReminderStateEntete.concat(cardReminderLateState);
    //       cardReminderValidatedState = cardReminderStateEntete.concat(cardReminderValidatedState);
    //       cardReminderSoonState =  cardReminderStateEntete.concat(cardReminderSoonState);
    //       cardReminderActiveState =  cardReminderStateEntete.concat(cardReminderActiveState);

    //       var cardReminderLateNb = 0;
    //       var cardReminderValidatedNb = 0;
    //       var cardReminderSoonNb = 0;
    //       var cardReminderActiveNb = 0;

    //       for(var i=0; i<reminders.length; i++) {
    //         switch (reminders[i][4]) {
    //           case 'late':
    //             cardReminderLateNb++;
    //             break;
    //           case 'validated':
    //             cardReminderValidatedNb++;
    //             break;
    //           case 'soon':
    //             cardReminderSoonNb++;
    //             break;
    //           case 'active':
    //             cardReminderActiveNb++;
    //             break;
    //         }
    //       }
    //       cardReminderLateState.push(cardReminderLateNb);
    //       cardReminderValidatedState.push(cardReminderValidatedNb);
    //       cardReminderSoonState.push(cardReminderSoonNb);
    //       cardReminderActiveState.push(cardReminderActiveNb);
          
    //       cardReminderLateNb!==0 ? remindersState.push(cardReminderLateState) : null;
    //       cardReminderValidatedNb!==0 ? remindersState.push(cardReminderValidatedState) : null;
    //       cardReminderSoonNb!==0 ? remindersState.push(cardReminderSoonState) : null;
    //       cardReminderActiveNb!==0 ? remindersState.push(cardReminderActiveState) : null;
    //   }
    // }

    // remindersStats() {
    //   reminderStatLate = 0;
    //   reminderStatActive = 0;
    //   reminderStatSoon = 0;
    //   reminderStatValidated = 0;
    //   remindersState.forEach(function(remind) {
    //     switch (remind[2]) { 
    //       case 'late':
    //         reminderStatLate++;
    //         break;
    //       case 'active':
    //         reminderStatActive++;
    //         break;
    //       case 'soon':
    //         reminderStatSoon++;
    //         break;
    //       case 'validated':
    //         reminderStatValidated++;
    //         break;
    //     }
    //   });
    // }

    render() {
      const classes = this.props;
      let nameCard = this.state.name;
      let cardObject = this;
      let projectId = this.state.id;
      //sort by date
      let mappedListOfReminders = this.state.reminders.sort((a, b) => a[3] > b[3]).map((reminder)=>{
        console.log(reminder[3].getFullYear());
        if(reminder!=="empty") {
          var cololor = this.colorReminder({nameCard}, {reminder});
        }
        var autoRemind = (reminder[2]==='3m'||reminder[2]==='6m');
        var shown = (autoRemind || reminder[1]==='ok');
        var remindValid = (!autoRemind && reminder[1] === 'ok');
        return (
          <div className='reminder-element'>
            <MuiThemeProvider>
              {(remindValid || !shown) && reminder[2]}
              {autoRemind && reminder[2]=='3m' && '3 Months to Go'}
              {autoRemind && reminder[2]=='6m' && '6 Months to Go'}
              <b>
                  <TextField required='required' 
                      disabled={shown}
                      className='reminder-element-theme'
                      type='date'
                      style={{
                        background: cololor,
                      }}
                      defaultValue={reminder[3]}
                      InputProps={{
                        className: classes.textField,
                      }}
                      onChange={(event) => (reminder[3]=event.target.value)}
                      variant="outlined"
                  />
              </b>
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
                  onClick={() => { if (window.confirm('Are you sure you wish to force validation of this reminder?')) this.changeStatus({cardObject}, {reminder}, {projectId}, 'ok')}}>
                  <CheckCircleIcon style={{color: "#00984C"}} className="reminder-valid-button"/>
              </Button>
            </Tooltip>}
            {reminder[1]=='ok' &&
            <Tooltip title="Unvalidate reminder" interactive>
              <Button
                  className="reminder-button"
                  size="small"
                  color="primary"
                  onClick={() => { if (window.confirm('Are you sure you wish to cancel validation of this reminder?')) this.changeStatus({cardObject}, {reminder}, {projectId}, 'notok')}}>
                  <HighlightOff style={{color: "#f44336"}} className="reminder-unvalid-button"/>
              </Button>
            </Tooltip>}
            
            {reminder[1]=='notok' &&
            <React.Fragment>
              <NewMailReminderDialog  projectId={this.props.id} reminderType={reminder[2]}/></React.Fragment>
            }
            <Tooltip title="Add 1 year on reminder date" interactive>
              <Button
                  className="reminder-button" //  reminder-addyear-button"
                  size="small"
                  color="primary"
                  onClick={() => this.setState(reminder[3])}>
                  >
                  <AddIcon/><small>1y</small>
              </Button>
            </Tooltip>
            {!autoRemind &&
            <Tooltip title="Delete custom reminder" interactive>
              <Button
                  className="reminder-button"// reminder-delete-button"
                  size="small"
                  color="primary"
                  onClick={() => { if (window.confirm('Are you sure you wish to delete this reminder?')) this.deleteReminder({cardObject}, {reminder})}}>
    
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
      <div>
      <Card className="reminder-card" hidden={this.props.hidden}>
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
              onChange={event => this.setState({goLiveDate:event.target.value})}
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
          <Button
              size="small"
              color="primary"
              onClick={() => this.saveReminder(this.state.id, this.state.reminders, this.state.goLiveDate)}>
              <SaveIcon/> Save changes
          </Button>
        </div>
      </Card>
      <br /> 
      </div>
      );
    }
}

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
              console.log('tu es un dieu');
              console.log(error.response);
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
              console.log(error.response);
            });
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