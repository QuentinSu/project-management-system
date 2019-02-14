import React, {Component} from 'react';
import AppBar from 'material-ui/AppBar';
import Typography from '@material-ui/core/Typography';
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';
import Testimonials from './testimonial.js'
import PropTypes from 'prop-types';
import {UserMenu} from './user.js'
import Footer from './footer.js';
import Button from '@material-ui/core/Button';
import axios from 'axios';
import ArrowBackIcon from '@material-ui/icons/ArrowBack';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import ListItemSecondaryAction from '@material-ui/core/ListItemSecondaryAction';
import Checkbox from '@material-ui/core/Checkbox';
import Card from '@material-ui/core/Card';
import {NewChecklistMessageDialog} from './checklistDialog.js'
import LinearProgress from '@material-ui/core/LinearProgress';
import {NewTicketDialog} from './ticketDialog.js'
import { MuiThemeProvider, createMuiTheme } from 'material-ui/styles';
import ExpansionPanel from '@material-ui/core/ExpansionPanel';
import ExpansionPanelSummary from '@material-ui/core/ExpansionPanelSummary';
import ExpansionPanelDetails from '@material-ui/core/ExpansionPanelDetails';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import {Ticket} from './project.js';

import Dropzone from 'react-dropzone'
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogTitle from '@material-ui/core/DialogTitle';
import ProjectSaveNotification from './saveNotification.js';

var config = require('./config.json');

const apiBaseUrl = config.apiBaseUrl;
const blueTheme = createMuiTheme({ palette: { primary: {main: '#007CBA'} } })

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

function BackToMenu(props) {
    return (
        <div className='back-button'>
            <Button
                onClick={() => {props.changeTab('menu')}}
                style={{color:'#FFFFFF'}}
            >
                <ArrowBackIcon/> Menu
            </Button>
        </div>
    )
}

class Menu extends Component {

    render() {
        return (
        <div className='menu'>
            <div className='menu-top'>
                <Button onClick={() => {this.props.changeTab('project')}}>
                <img className='menu-button' alt='project' src={process.env.PUBLIC_URL + '/project.png'}/>
                </Button>
                <Button onClick={() => {this.props.changeTab('support')}}>
                <img className='menu-button' alt='support' src={process.env.PUBLIC_URL + '/support.png'}/>
                </Button>
            </div>
            <div className='menu-bottom'>
                <Button onClick={() => {this.props.changeTab('testimonial')}}>
                <img className='menu-button' alt='testimonial' src={process.env.PUBLIC_URL + '/testimonial.png'}/>
                </Button>
                <Button onClick={() => {this.props.changeTab('fileupload')}}>
                <img className='menu-button' alt='fileUpload' src={process.env.PUBLIC_URL + '/fileupload.png'}/>
                </Button>
            </div>
        </div>
        )
    }
}

class ProjectProgress extends Component {

    render() {
        var self = this;
        let mappedChecklists = this.props.project.checklists.map(function(checklist) {
            var value = 0;
            var count = 0;
            checklist.items.forEach(item => {
                item.checked ? value++ : count++;
            });
            var percentage = value+count !== 0 ? 100*value/(value+count) : 0;
            return(
            <Card key={checklist.id}>
            <List>
                <ListItem>
                    <div className='checklist-title'>
                        {checklist.label.toUpperCase()}
                    </div>
                    <ListItemSecondaryAction>
                        <NewChecklistMessageDialog 
                            projectId={self.props.project.id} 
                            checklistId={checklist.id} 
                            handleProjectChange={self.props.updateProject}
                            buttonStyle='client'
                        />      
                    </ListItemSecondaryAction>
                </ListItem>
                <MuiThemeProvider theme={blueTheme}>
                    <LinearProgress 
                        color='primary'
                        variant='determinate' 
                        style={{margin:'30px',height:'8px'}} 
                        value={percentage} 
                    />
                </MuiThemeProvider>
                <Card style={{margin:'5px'}}>
                <ListItem>
                    <div className='checklist-subtitle'>
                        Items
                    </div>
                </ListItem>
                {checklist.items.map(item => (
                <ListItem
                    key={item.id}
                    dense
                >
                    <Checkbox
                    checked={item.checked}
                    tabIndex={-1}
                    disableRipple
                    style={{color:'#34845F'}}
                    />
                    <div style={item.checked ? {color:'#34845F'} : {}}> {item.label} </div>
                
                </ListItem>
                ))}
                </Card>
                <Card style={{margin:'5px'}}>
                <ListItem>
                    <div className='checklist-subtitle'>
                        Messages
                    </div>
                </ListItem>
                {checklist.messages.map(message => (
                <ListItem
                    key={message.id}
                    dense
                >
                    <ListItemText primary={message.label}/>
                </ListItem>
                ))}
                </Card>
            </List> 
            </Card>  
          );
        })
        return (
            <div>
            <div className='project-progress'>
                <BackToMenu changeTab={this.props.changeTab}/>
                <img className='project-progress-button'alt='project' src={process.env.PUBLIC_URL + '/project.png'}/> 
                <div className='project-progress-title' alt='proj. progress'>PROJECT PROGRESS</div>  
            </div> 
            <div className='project-content'>
                {mappedChecklists}
            </div>
            </div>
        )
    }
}

class SupportTicket extends Component {
    constructor(props){
        super(props);
        this.state = {
            openSaveNotification: false
        }
    }

    handleProjectChange() {
        this.setState({openSaveNotification: true});
        this.props.updateProject();
    }
    render() {
        let mappedTickets = this.props.project.tickets.map((ticket)=>{
            var creation = new Date(ticket.created);
            var parsedCreation = creation.toLocaleString('en-GB', { timeZone: 'UTC' });
            var modified = new Date(ticket.modified);
            var parsedModify = modified.toLocaleString('en-GB', { timeZone: 'UTC' });
            return (
            <ExpansionPanel className='ticket-panel' hidden={this.props.hidden} key={ticket.id}>
                    <ExpansionPanelSummary expandIcon={<ExpandMoreIcon />}>
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
                            projectId={this.props.project.id}
                            isFileTicket={this.props.project.file_ticket_id===ticket.id}
                            created={ticket.created}
                            modified={ticket.modified}
                            description={ticket.description}
                            status={ticket.status}
                            files={ticket.files}
                            handleProjectChange={() => this.handleProjectChange()}
                            className='ticket-from-panel'
                            isClient={true}
                    /> 
                </ExpansionPanelDetails>
            </ExpansionPanel>
            )
        })
        return (
            <div>
            <ProjectSaveNotification 
                open={this.state.openSaveNotification} 
                message={'Ticket saved successfully'}
                handleClose={() => {this.setState({openSaveNotification:false})}}
            />
            <div className='ticket-client'>
                <BackToMenu changeTab={this.props.changeTab}/>
                <img className='project-progress-button' src={process.env.PUBLIC_URL + '/support.png'}/> 
                <div className='project-progress-title'>SUPPORT TICKET</div>  
            </div> 
            <div className='ticket-content'>
                <NewTicketDialog
                    projectId={this.props.project.id}
                    handleProjectChange={this.props.updateProject}
                    buttonStyle='client'
                />
                {mappedTickets}
            </div>
            </div>
        )
    }
}

class Review extends Component {
    constructor(props){
        super(props);
    }
    render() {
        return (
            <div>
                <div className='review-client'>
                    <BackToMenu changeTab={this.props.changeTab}/>
                    <img className='review-button' src={process.env.PUBLIC_URL + '/testimonial.png'}/> 
                    <div className='review-title'>TESTIMONIALS</div>  
                </div> 
                <div className='review-content'>
                    <Testimonials isClient={true}/>
                </div>
            </div>
        )
    }
}

class FileUpload extends Component {
    constructor(props){
        super(props);
        this.state={
            open:false
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
            axios.post(apiBaseUrl+'project/'+self.props.project.id+'/file', data, {headers:headers})
                .then(function (response) {
                    self.props.updateProject();
                    self.setState({open:true})
                })
                .catch(function (error) {
                    console.log(error);
                });
        });
    }
    render() {
        return (
            <div>
                <Dialog open={this.state.open}>
                    <DialogTitle> File uploaded successfully</DialogTitle>
                    <DialogActions>
                        <Button onClick={() => {this.setState({open:false})}} color="primary">
                            OK
                        </Button>
                    </DialogActions>
                </Dialog>
                <div className='file-upload'>
                    <BackToMenu changeTab={this.props.changeTab}/>
                    <img className='file-upload-button' src={process.env.PUBLIC_URL + '/fileupload.png'}/> 
                    <div className='file-upload-title'>FILE UPLOAD</div>  
                </div> 
                <div className='file-upload-content'>
                    <div style={{margin:'auto', textAlign:'center'}}>
                    <Dropzone 
                        className='dropzone-client' 
                        accept={config.acceptedFiles}
                        onDrop={(files, rejected) => {this.onDrop(files)}} 
                        hidden={this.state.hidden}
                    >
                        <p>Drop file or click to upload (max: 10M)</p>
                    </Dropzone>
                    </div>
                </div>
            </div>
        )
    }
}

class Project extends Component {
    constructor(props){
        super(props);
        this.state={
            tabValue: 0
        }
    };

    handleChange = (event, tabValue) => {
        this.setState({ tabValue });
    };

    changeTab(tab) {
        switch(tab) {
            case 'project':
                this.setState({ tabValue: 1 });
                break;
            case 'support':
                this.setState({ tabValue: 2 });
                break;
            case 'testimonial': 
                this.setState({ tabValue: 3 });
                break;
            case 'fileupload' : 
                this.setState({ tabValue: 4 });
                break;
            case 'menu' : 
                this.setState({ tabValue: 0});
                break;
        }
    }
    
    render() {
        return (
            <div className='client-tabs'>
                <AppBar position="static">
                <Tabs hidden className='dashboard-tabs' value={this.state.tabValue} onChange={this.handleChange}>
                    <Tab label="Menu" />
                    <Tab label="Project Progress" />
                    <Tab label="Support Ticket" />
                    <Tab label="Review" />
                    <Tab label="File Upload" />
                </Tabs>
                </AppBar>
                {this.state.tabValue === 0 && <TabContainer><Menu changeTab={this.changeTab.bind(this)}/></TabContainer>}
                {this.state.tabValue === 1 && <TabContainer>
                                                <ProjectProgress 
                                                    project={this.props.project}
                                                    changeTab={this.changeTab.bind(this)}
                                                    updateProject={this.props.updateProject}
                                                />
                                              </TabContainer>}
                {this.state.tabValue === 2 && <TabContainer>
                                                <SupportTicket
                                                    project={this.props.project}
                                                    changeTab={this.changeTab.bind(this)}
                                                    updateProject={this.props.updateProject}
                                                />
                                              </TabContainer>}
                {this.state.tabValue === 3 && <TabContainer>
                                                <Review
                                                    project={this.props.project}
                                                    changeTab={this.changeTab.bind(this)}
                                                />
                                              </TabContainer>}
                {this.state.tabValue === 4 && <TabContainer>
                                                <FileUpload
                                                    project={this.props.project}
                                                    changeTab={this.changeTab.bind(this)}
                                                    updateProject={this.props.updateProject}
                                                />
                                              </TabContainer>}
            </div>
        );
    }
    
}

class ClientDashboard extends Component {
  constructor(props){
    super(props);
    this.state={
        tabValue: 0,
        projects: []
    }
  };
  handleChange = (event, tabValue) => {
    this.setState({ tabValue });
  };

  updateProject() {
      this.componentDidMount();
  }

  componentDidMount () {
    // We get all the projects with granted access to the user
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

  render() {
    var tabIndex = 0;
    let mappedTabs = this.state.projects.map((project) => {
        return <Tab key={project.id} label={project.name}/>
    })
    let mappedProjects = this.state.projects.map((project)=>{
        return this.state.tabValue === tabIndex++ && <TabContainer key={project.id}> <Project
                          id={project.id}
                          name={project.name}
                          type={project.type}
                          status={project.status}
                          checklists={project.checklists}
                          tickets={project.tickets}
                          project={project}
                          updateProject={this.updateProject.bind(this)}
        /> </TabContainer>
      })
    return (
        <div className='Tabs'>
            <AppBar position="static">
            <img className='logo-dashboard' src={process.env.PUBLIC_URL + '/rw.png'}/>
            <UserMenu username={localStorage.getItem('username')}/>
            <Tabs className='dashboard-tabs' value={this.state.tabValue} onChange={this.handleChange}>
                {mappedTabs}
            </Tabs>
            </AppBar>
            {mappedProjects}
            <Footer/>
        </div>
    );
  }
}

export default ClientDashboard;