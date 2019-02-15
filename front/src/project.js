import React, {Component} from 'react';
import Typography from '@material-ui/core/Typography';
import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';
import axios from 'axios';
import Card from '@material-ui/core/Card';
import Input from '@material-ui/core/Input';
import ExpansionPanel from '@material-ui/core/ExpansionPanel';
import ExpansionPanelSummary from '@material-ui/core/ExpansionPanelSummary';
import ExpansionPanelDetails from '@material-ui/core/ExpansionPanelDetails';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import SaveIcon from '@material-ui/icons/Save';
import DownloadIcon from '@material-ui/icons/GetApp';
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';
import AppBar from 'material-ui/AppBar';
import PropTypes from 'prop-types';
import FormControl from '@material-ui/core/FormControl';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import ListItemSecondaryAction from '@material-ui/core/ListItemSecondaryAction';
import Checkbox from '@material-ui/core/Checkbox';
import MenuItem from '@material-ui/core/MenuItem';
import Select from '@material-ui/core/Select';
import InputLabel from '@material-ui/core/InputLabel';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogTitle from '@material-ui/core/DialogTitle';
import {DeleteProjectDialog, NewProjectDialog, NotifyUsersDialog} from './projectDialog.js'
import {DeleteTicketDialog, NewTicketDialog, DeleteFileDialog, NewTicketMessageDialog} from './ticketDialog.js'
import {DeleteChecklistDialog, NewChecklistDialog, NewChecklistMessageDialog, DeleteChecklistMessageDialog, NewChecklistItemDialog, DeleteChecklistItemDialog} from './checklistDialog.js'
import Dropzone from 'react-dropzone';
import ProjectSaveNotification from './saveNotification.js';
import Chip from '@material-ui/core/Chip';

var config = require('./config.json');

const apiBaseUrl = config.apiBaseUrl;

// TAB CONTAINER

function TabContainer(props) {
    return (
      <Typography component="div">
        {props.children}
      </Typography>
    );
  }
  
TabContainer.propTypes = {
    children: PropTypes.node.isRequired,
};

// FUNCTION TO RENDER CHECKLIST

function Checklist(props) {
    let mappedMessages = props.messages.map((message)=>{
        return (<ListItem   key={message.id}
                        ><TextField className='message-text' multiline
                        defaultValue={message.label}
                        label='Message'
                        onChange={event => props.checklistMessageChange(message, "label", event.target.value)}
               />
               <DeleteChecklistMessageDialog className='message-delete-button'
                    projectId={props.projectId} 
                    checklistId={props.checklistId} 
                    checklistMessageId={message.id}
                    handleProjectChange={props.handleProjectChange}
                /></ListItem>)
    });
    let mappedItems = props.items.map((item)=>{
        return (
        <ListItem
        key={item.id}
        dense
        button
      >
        <Checkbox
          checked={item.checked}
          onChange={event => props.checklistItemChange(item, "checked", event.target.value)}
        />
        <Input
            className='checklist-list-item'
            multiline
            defaultValue={item.label} 
            onChange={event => props.checklistItemChange(item, "label", event.target.value)}
        />
        <DeleteChecklistItemDialog className='item-delete-button'
                    projectId={props.projectId} 
                    checklistId={props.checklistId} 
                    checklistItemId={item.id}
                    handleProjectChange={props.handleProjectChange}
        />
      </ListItem>
      );
    });

    return (
        <ExpansionPanel>
            <ExpansionPanelSummary expandIcon={<ExpandMoreIcon />}>
            <TextField
                className="checklist-label"
                defaultValue={props.label}
                label='Title'
                onChange={event => props.checklistChange("label", event.target.value)}
            />
            </ExpansionPanelSummary>
            <ExpansionPanelDetails className="checklist-panel">
            <NewChecklistMessageDialog 
                projectId={props.projectId} 
                checklistId={props.checklistId} 
                handleProjectChange={props.handleProjectChange}
            />
            <NewChecklistItemDialog 
                projectId={props.projectId} 
                checklistId={props.checklistId} 
                handleProjectChange={props.handleProjectChange}
            />
            <CsvChecklistImport
                projectId={props.projectId} 
                checklistId={props.checklistId} 
                handleProjectChange={props.handleProjectChange}
            />
            <Typography style={{color:'grey'}} class='checklist-id'>
                ID: {props.checklistId}
            </Typography>
           <List className='items-list'>
            {mappedItems}
            </List>
            {mappedMessages}
            
            <div className='ticket-buttons'>
                <Button 
                        className="save-button"
                        size="small"
                        color="primary"
                        onClick={() => props.saveChecklist(props.projectId, props.checklistId)}>
                        <SaveIcon/> Save
                </Button>
                <DeleteChecklistDialog 
                    projectId={props.projectId}
                    checklistId={props.checklistId}
                    handleProjectChange={props.handleProjectChange}
                />
            </div>
            </ExpansionPanelDetails>
        </ExpansionPanel>
      
    );
}

// CLASS TO IMPORT CHECKLISTS AS A CSV
class CsvChecklistImport extends Component{
    constructor(props) {
        super(props);
        this.state={
            open: false,
        }
    }
    onDrop(files) {
        var reader = new FileReader();
        var self = this;
        reader.onload = function() {
            reader.result.split('\n').forEach(function(item){
                axios({
                    method: 'post', //you can set what request you want to be
                    url: apiBaseUrl+'project/'+self.props.projectId+'/checklist/'+self.props.checklistId+'/item',
                    data: {label:item},
                    headers: {
                    Authorization: 'Bearer ' + localStorage.getItem('session'),
                    'Content-Type': 'application/json; charset=utf-8'
                    }
                }).then(function (response) {
                    if(response.status === 200){
                        self.setState({ open: true });
                        var data = {checklistId:self.props.checklistId, label:item}
                        self.props.handleProjectChange('addChecklistItem', data);
                    }
                }).catch(function (error) {
                });
            })
        };
        reader.readAsText(files[0]);        
    }
    render() {
        return(
            <div style={{marginLeft:'5px'}}>
                <Dropzone 
                    accept='.csv'
                    className='dropzone-checklist' 
                    onDrop={(files, rejected) => {this.onDrop(files)}} 
                >
                    <p>Drop CSV</p>
                </Dropzone>
            </div>
        )
    }
}

// FUNCTION TO RENDER TICKET

export class Ticket extends Component{
    constructor(props){
        super(props);
        this.state={
            description: props.description,
            status: props.status,
            open: false
        }
    }
    onDrop(files) {
        var self = this;
        files.forEach(function(file) {
            const data = new FormData();
            data.append('upload', file);
            var headers = {
                Authorization: 'Bearer ' + localStorage.getItem('session'),
                'Content-Type': 'application/json; charset=utf-8'
            }
            axios.post(apiBaseUrl+'project/'+self.props.projectId+'/ticket/'+self.props.ticketId+'/file', data, {headers:headers})
                .then(function (response) {
                    self.props.handleProjectChange('modifyTicketFiles');
                    self.setState({open:true});
                })
                .catch(function (error) {
                    console.log(error);
                });
        });
    }

    downloadFile(file) {
        var headers = {
            Authorization: 'Bearer ' + localStorage.getItem('session'),
            'Content-Type': 'application/json; charset=utf-8'
        }
        axios.get(apiBaseUrl+'project/'+this.props.projectId+'/ticket/'+this.props.ticketId+'/file/'+file, {headers:headers})
            .then(function (response) {
                return response;
            })
            .catch(function (error) {
                console.log(error);
            });

        axios({
            url: apiBaseUrl+'project/'+this.props.projectId+'/ticket/'+this.props.ticketId+'/file/'+file,
            method: 'GET',
            responseType: 'blob', // important
            headers: {
                Authorization: 'Bearer ' + localStorage.getItem('session'),
                'Content-Type': 'application/json; charset=utf-8'
            }
        }).then((response) => {
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', file); //or any other extension
            document.body.appendChild(link);
            link.click();
        });
    }

    deleteFile(file) {
        var headers = {
            Authorization: 'Bearer ' + localStorage.getItem('session'),
            'Content-Type': 'application/json; charset=utf-8'
        }
        var self = this;
        axios.delete(apiBaseUrl+'project/'+this.props.projectId+'/ticket/'+this.props.ticketId+'/file/'+file, {headers:headers})
            .then(function (response) {
                self.props.handleProjectChange('modifyTicketFiles');
            })
            .catch(function (error) {
                console.log(error);
            });
    }

    ticketChange(type, val) {
        if (type==='description') {
            this.setState({description:val});
        } else if (type==='status') {
            this.setState({status:val});
        }
    }

    saveTicket() {
        var self = this;
        axios({
            method: 'put', //you can set what request you want to be
            url: apiBaseUrl+'project/'+this.props.projectId+'/ticket/'+this.props.ticketId,
            data: {description:this.state.description, status:this.state.status},
            headers: {
              Authorization: 'Bearer ' + localStorage.getItem('session'),
              'Content-Type': 'application/json; charset=utf-8'
            }
        }).then(function (response) {
            if(response.status === 200){
                self.props.handleProjectChange('modifyTicket');
            }
        }).catch(function (error) {
        });
    }

    render() {
        var self = this;
        let mappedFiles = this.props.files.map(function(file) {
        return(
            <Card>
            <ListItem key={file}>
                <ListItemText>
                    {file}
                    <Button 
                        className="download-button"
                        size="small"
                        color="primary" 
                        onClick={() => self.downloadFile(file)}>
                        <DownloadIcon/>
                    </Button>
                </ListItemText>
                <ListItemSecondaryAction>
                    <DeleteFileDialog 
                        ticketId={self.props.ticketId}
                        file={file}
                        deleteFile={() => self.deleteFile(file)}
                    />
                </ListItemSecondaryAction>
            </ListItem>
            </Card>
        );
    });
    var creation = new Date(this.props.created);
    var parsedCreation = creation.toLocaleString('en-GB', { timeZone: 'UTC' });
    var modified = new Date(this.props.modified);
    var parsedModify = modified.toLocaleString('en-GB', { timeZone: 'UTC' });
    return (
        <div className='ticket'>
        <div>
            <Dialog open={this.state.open}>
                <DialogTitle> File uploaded successfully</DialogTitle>
                <DialogActions>
                    <Button onClick={() => {this.setState({open:false})}} color="primary">
                        OK
                    </Button>
                </DialogActions>
            </Dialog>
            {!this.props.isClient && 
            <Select
                  disabled = {this.props.isFileTicket}
                  value={this.state.status}
                  onChange={event => this.ticketChange("status", event.target.value)}
                  name="status"
                  label="Status"
                  inputProps={{
                    id: 'status',
                  }}
                >
                  <MenuItem value='Active'>Active</MenuItem>
                  <MenuItem value='Completed'>Completed</MenuItem>
                  <MenuItem value='Permanent' disabled> Permanent</MenuItem>
            </Select>
            }
            <TextField
                className='ticket-description'
                onChange={event => this.ticketChange("description", event.target.value)}
                multiline
                value={this.state.description}
                label='Description'
            />
        </div>
        <Dropzone className='dropzone' accept={config.acceptedFiles} onDrop={(files, rejected) => {this.onDrop(files)}} >
            <p>Drop file or click to upload (max: 10M)</p>
        </Dropzone>
        <List>
            {mappedFiles}
        </List> 
        <div className='ticket-buttons'>
            <Button 
                className="save-button"
                size="small"
                color="primary" 
                onClick={() => this.saveTicket()}>
                <SaveIcon/> Save
            </Button>
            <NewTicketMessageDialog
                    projectId={this.props.projectId} 
                    ticketId={this.props.ticketId} 
                    description={this.props.description}
                    handleProjectChange={this.props.handleProjectChange}
                    updateDescription={(val) => {this.ticketChange('description', val)}}
            />
            <DeleteTicketDialog 
                projectId={this.props.projectId} 
                ticketId={this.props.ticketId} 
                handleProjectChange={this.props.handleProjectChange}
                disabled = {this.props.isFileTicket}
            />
        </div>
        </div>
    )}
}

// CLASS TO RENDER PROJECT

class Project extends Component {
    constructor(props){
        super(props);
        this.state={
            id: props.id,
            name: props.name,
            type: props.type,
            status: props.status,
            goLiveDate: props.goLiveDate,
            checklists: props.checklists,
            tickets: props.tickets,
            tabValue: 0,
            openSaveNotification: false
        }
    }

    changeTab = (event, tabValue) => {
        this.setState({ tabValue });
    };

    handleProjectChange(type, data) {
        this.setState({openSaveNotification: true});
        var self = this;
        switch(type) {
            case 'addTicket':
            case 'deleteTicket':
            case 'modifyTicket':
            case 'modifyTicketFiles':
                this.getTickets(this.state.id, function(newTickets) {
                    self.setState({tickets: newTickets});
                    //this.props.handleProjectsChange();
                }); 
                break;
            case 'addChecklist':
            case 'addChecklistMessage':
            case 'addChecklistItem':
            case 'deleteChecklist':
            case 'deleteChecklistMessage':
            case 'deleteChecklistItem':
                this.getChecklists(this.state.id, function(newChecklists) {
                    self.setState({checklists: newChecklists});
                    //this.props.handleProjectsChange();
                });
                break;
            case 'deleteProject':
                this.props.handleProjectsChange();
                break;
            default:
                this.props.handleProjectsChange();
                console.log('unknown type');
        }
    }

    getChecklists(projectId, callback) {
        axios({
            method: 'get', //you can set what request you want to be
            url: apiBaseUrl+'project/'+projectId,
            headers: {
              Authorization: 'Bearer ' + localStorage.getItem('session'),
              'Content-Type': 'application/json; charset=utf-8'
            }
        })
            .then(function (response) {
              if(response.status === 200){
                callback(response.data.checklists)
              }
        })
            .catch(function (error) {
        });
    }

    getTickets(projectId, callback) {
        axios({
            method: 'get', //you can set what request you want to be
            url: apiBaseUrl+'project/'+projectId,
            headers: {
              Authorization: 'Bearer ' + localStorage.getItem('session'),
              'Content-Type': 'application/json; charset=utf-8'
            }
        })
            .then(function (response) {
              if(response.status === 200){
                callback(response.data.tickets)
              }
        })
            .catch(function (error) {
        });
    }

    saveProject (project) {
        var self = this;
        axios({
            method: 'put', //you can set what request you want to be
            url: apiBaseUrl+'project/'+project.id,
            data: {name:project.name, type:project.type, status:project.status, goLiveDate:project.goLiveDate},
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
    }

    saveChecklist(projectId, checklistId) {
        var checklist = this.state.checklists.find(c => c.id === checklistId);
        var self = this;
        axios({
            method: 'put', //you can set what request you want to be
            url: apiBaseUrl+'project/'+projectId+'/checklist/'+checklist.id,
            data: {label:checklist.label},
            headers: {
              Authorization: 'Bearer ' + localStorage.getItem('session'),
              'Content-Type': 'application/json; charset=utf-8'
            }
        }).then(function (response) {
            if(response.status === 200){
                self.props.handleProjectsChange();
                self.handleProjectChange();
            }
        }).catch(function (error) {
        });
        checklist.messages.map((message)=>{
            axios({
                method: 'put', //you can set what request you want to be
                url: apiBaseUrl+'project/'+projectId+'/checklist/'+checklist.id+'/message/'+message.id,
                data: {label:message.label},
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
        })
        checklist.items.map((item)=>{
            axios({
                method: 'put', //you can set what request you want to be
                url: apiBaseUrl+'project/'+projectId+'/checklist/'+checklist.id+'/item/'+item.id,
                data: {label:item.label, checked:item.checked},
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
        })
    }

    checklistMessageChange(checklist, message, type, val) {
        let newChecklists = this.state.checklists.slice();
        let newChecklist = newChecklists.find(c => c.id === checklist.id);
        let newMessage = newChecklist.messages.find(m => m.id === message.id);
        if (type==='label') {
            newMessage.label = val;
        }
        this.setState({checklists: newChecklists}); 
    }

    checklistItemChange(checklist, item, type, val) {
        let newChecklists = this.state.checklists.slice();
        let newChecklist = newChecklists.find(c => c.id === checklist.id);
        let newItem = newChecklist.items.find(i => i.id === item.id);
        if (type==='label') {
            newItem.label = val;
        } else if (type==='checked') {
            newItem.checked = !newItem.checked;
        }
        this.setState({checklists: newChecklists}); 
    }

    checklistChange(checklist, type, val) {
        let newChecklists = this.state.checklists.slice();
        if (type==='label') {
            newChecklists.find(c => c.id === checklist.id).label = val;
        } 
        this.setState({checklists: newChecklists}); 
    }

    ticketChange(ticket, type, val) {
        let newTickets = this.state.tickets.slice();
        if (type==='description') {
            newTickets.find(t => t.id === ticket.id).description = val;
        } else if (type==='status') {
            newTickets.find(t => t.id === ticket.id).status = val;
        }
        this.setState({tickets: newTickets});   
    }

    render() {
        let mappedChecklists = this.state.checklists.map((checklist)=>{
            return <Checklist key={checklist.id}
                            checklistId={checklist.id}
                            projectId={this.state.id}
                            label={checklist.label}
                            messages={checklist.messages}
                            items={checklist.items}
                            checklistChange={(type, val) => this.checklistChange(checklist, type, val)}
                            checklistItemChange={(item, type, val) => this.checklistItemChange(checklist,item, type, val)}
                            checklistMessageChange={(message, type, val) => this.checklistMessageChange(checklist,message, type, val)}
                            handleProjectChange={this.handleProjectChange.bind(this)}
                            saveChecklist = {this.saveChecklist.bind(this)}
                   /> 
        })
        let mappedTickets = this.state.tickets.map((ticket)=>{
            var creation = new Date(ticket.created);
            var parsedCreation = creation.toLocaleString('en-GB', { timeZone: 'UTC' });
            var modified = new Date(ticket.modified);
            var parsedModify = modified.toLocaleString('en-GB', { timeZone: 'UTC' });
            return (
            <ExpansionPanel hidden={this.props.hidden} key={ticket.id}>
                    <ExpansionPanelSummary className='ticket-panel' expandIcon={<ExpandMoreIcon />}>
                    <Typography color="textSecondary">
                        ID: 
                    </Typography>
                    <span>&nbsp;&nbsp;</span>
                    <Typography>
                        {ticket.id}
                    </Typography>
                    <span>&nbsp;&nbsp;&nbsp;</span>
                    <Typography color="textSecondary" className='less-important-ticket-info'>
                        Created: 
                    </Typography>
                    <span>&nbsp;&nbsp;</span>
                    <Typography className='less-important-ticket-info'>
                        {parsedCreation}
                    </Typography>
                    <span>&nbsp;&nbsp;&nbsp;</span>
                    <Typography color="textSecondary" className='less-important-ticket-info'>
                        Modified: 
                    </Typography>
                    <span>&nbsp;&nbsp;</span>
                    <Typography className='less-important-ticket-info'>
                        {parsedModify}
                    </Typography>
                    <span>&nbsp;&nbsp;&nbsp;</span>
                    <Typography color="textSecondary">
                        Status: 
                    </Typography>
                    <span>&nbsp;&nbsp;</span>
                    <Typography>
                        {ticket.status}
                    </Typography>
                    </ExpansionPanelSummary>
                <ExpansionPanelDetails className='client-tickets'>
                    <Ticket key={ticket.id}
                            ticketId={ticket.id}
                            projectId={this.state.id}
                            isFileTicket={this.props.file_ticket_id===ticket.id}
                            created={ticket.created}
                            modified={ticket.modified}
                            description={ticket.description}
                            status={ticket.status}
                            files={ticket.files}
                            handleProjectChange={this.handleProjectChange.bind(this)}
                            className='ticket-from-panel'
                    /> 
                </ExpansionPanelDetails>
            </ExpansionPanel>
            )
        })
        var activeTickets = 0;
        this.state.tickets.forEach(function(ticket) {
            if(ticket.status === 'Active') {
                activeTickets++;
            }
        })
        var color = (activeTickets === 0) ? '#00984C' : '#f44336';
        return (    
                    <ExpansionPanel hidden={this.props.hidden}>
                    <ProjectSaveNotification 
                        open={this.state.openSaveNotification} 
                        message={'Project saved: ' + this.state.name}
                        handleClose={() => {this.setState({openSaveNotification:false})}}
                    />
                    <ExpansionPanelSummary expandIcon={<ExpandMoreIcon />}>
                        <Chip label={activeTickets} style={{marginRight:'10px', backgroundColor:color, color:'#FFF'}}/>
                        <TextField
                            fullWidth
                            defaultValue={this.state.name}
                            label='Name'
                            onChange = {(event) => this.setState({name:event.target.value})}
                        />
                    </ExpansionPanelSummary>
                    <ExpansionPanelDetails className='project-details'>
        
                        <TextField className='project-text'
                            defaultValue={this.state.type}
                            label='Type'
                            onChange = {(event) => this.setState({type:event.target.value})}
                        />
                        <Select
                        className="status-select"
                        value={this.state.status}
                        onChange={(event) => {this.setState({status:event.target.value})}}
                        name="status"
                        inputProps={{  
                            id: 'status',
                        }}
                        >
                        <MenuItem value='Active'>Active</MenuItem>
                        <MenuItem value='Pending'>Pending</MenuItem>
                        <MenuItem value='Complete'>Complete</MenuItem>
                        </Select>
                        <TextField className='project-deadline'
                                type='date'
                                onChange={(event) => this.setState({goLiveDate:event.target.value})}
                                defaultValue={this.state.goLiveDate}
                                label='Deadline'
                        />
                            <Button 
                                color="primary"  
                                size="small"
                                className="save-button"
                                onClick={() => this.saveProject(this.state)}>
                                <SaveIcon/>
                                Project
                            </Button>
                        <DeleteProjectDialog 
                            id={this.state.id}
                            handleProjectChange={this.handleProjectChange.bind(this)}
                        />
                        <NewChecklistDialog 
                            projectId={this.state.id} 
                            handleProjectChange={this.handleProjectChange.bind(this)}
                        />
                        <NewTicketDialog 
                            projectId={this.state.id}
                            handleProjectChange={this.handleProjectChange.bind(this)}
                        />
                        <NotifyUsersDialog id={this.state.id}/>
                        <FormControl className='project-tabs'>
                            <AppBar position="static">
                                <Tabs value={this.state.tabValue} onChange={this.changeTab}>
                                    <Tab label="Checklists" />
                                    <Tab label="Support tickets" />
                                </Tabs>
                            </AppBar>
                            {this.state.tabValue === 0 && <TabContainer>{mappedChecklists}</TabContainer>}
                            {this.state.tabValue === 1 && <TabContainer>{mappedTickets}</TabContainer>}
                        </FormControl>
                    </ExpansionPanelDetails>
                </ExpansionPanel>
        );
    }
}

// CLASS TO RENDER ALL THE PROJECTS

class Projects extends Component {
    constructor(props){
      super(props);
      this.state={
          projects: [],
          trigger: true
      }
    };
    handleProjectsChange() {
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
        let mappedProjects = this.state.projects.map((project)=>{
          return <Project   key={project.id}
                            id={project.id}
                            name={project.name}
                            type={project.type}
                            status={project.status}
                            goLiveDate={project.go_live_date}
                            checklists={project.checklists}
                            tickets={project.tickets}
                            hidden={project.hidden ? project.hidden : false}
                            file_ticket_id={project.file_ticket_id}
                            handleProjectsChange={this.handleProjectsChange.bind(this)}
                />     
        })
        return(
            <div>
                <div className='project-header'>
                    <NewProjectDialog handleProjectsChange={this.handleProjectsChange.bind(this)}/>
                    <input
                        placeholder="Search (e.g: name, project type)"
                        onChange={event => this.filterProjects(event.target.value)}
                    />
                </div>
                <p></p>
                {mappedProjects}
            </div>
        );
    }
  }

  export default Projects;