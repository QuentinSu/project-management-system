import React, {Component} from 'react';
import { MuiThemeProvider, createMuiTheme } from '@material-ui/core/styles';
import StarIcon from '@material-ui/icons/Star';
import { Link, NavLink } from 'react-router-dom';
import axios from 'axios';
import {DeleteProjectDialog, NewProjectDialog, NotifyUsersDialog} from './projectDialog.js'

var config = require('./config.json');

const apiBaseUrl = config.apiBaseUrl;

// CLASS TO RENDER ALL THE PROJECTS

class Reminders extends Component {
    constructor(props){
      super(props);
      this.state={
          projects: [],
          trigger: true
      }
    };
    handleRemindersChange() {
        var self = this;
        axios({
            method: 'get', //you can set what request you want to be
            url: apiBaseUrl+'project',
            headers: {
              Authorization: 'Bearer ' + localStorage.getItem('session'),
              'Content-Type': 'application/json; charset=utf-8'
            }
          })
            .then(function (response) {
              if(response.status === 200){
                self.setState({projects:response.data});
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
            url: apiBaseUrl+'project',
            headers: {
              Authorization: 'Bearer ' + localStorage.getItem('session'),
              'Content-Type': 'application/json; charset=utf-8'
            }
          })
            .then(function (response) {
              if(response.status === 200){
                self.setState({projects:response.data});
              }
            })
            .catch(function (error) {
            });
    }

    filterProjects(label) {
        let newProjects = this.state.projects.slice();
        newProjects.map((project)=>{
            if (project.name.toUpperCase().includes(label.toUpperCase()) || project.type.toUpperCase().includes(label.toUpperCase())) {
                project.hidden = false;
            } else {
                project.hidden = true;
            }
        })
        this.setState({projects: newProjects}); 
    }

    render(){
        let mappedReminders = this.state.projects.map((project)=>{
          return <Reminder   key={project.id}
                            id={project.id}
                            name={project.name}
                            type={project.type}
                            status={project.status}
                            goLiveDate={project.go_live_date}
                            checklists={project.checklists}
                            tickets={project.tickets}
                            hidden={project.hidden ? project.hidden : false}
                            file_ticket_id={project.file_ticket_id}
                            handleRemindersChange={this.handleRemindersChange.bind(this)}
                />     
        })
        return(
            <div>
                <div className='project-header'>
                    <input
                        placeholder="Search (e.g: name, special reminder, date)"
                        onChange={event => this.filterProjects(event.target.value)}
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
          market: [],
          trigger: true,
          open: false,
          newAuthor: null,
          newDescription: null
      }
    }
    render() {
        return (
            <div>
                <p>Reminder</p>
            </div>
        );
    }
}