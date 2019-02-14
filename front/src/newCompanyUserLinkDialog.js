/* eslint-disable react/prop-types */

import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import Select from 'react-select';
import { withStyles } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';
import TextField from '@material-ui/core/TextField';
import Paper from '@material-ui/core/Paper';
import Chip from '@material-ui/core/Chip';
import MenuItem from '@material-ui/core/MenuItem';
import { emphasize } from '@material-ui/core/styles/colorManipulator';
import Button from '@material-ui/core/Button';
import AddIcon from '@material-ui/icons/Add';
import axios from 'axios';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';
import User from './user.js';


var config = require('./config.json');

const apiBaseUrl = config.apiBaseUrl;

// New project link search bar stuff
  
const styles = theme => ({
    root: {
      flexGrow: 1,
      width: 500,
      height: 250
    },
    input: {
      display: 'flex',
      padding: 0,
    },
    valueContainer: {
      display: 'flex',
      flexWrap: 'wrap',
      flex: 1,
      alignItems: 'center',
    },
    chip: {
      margin: `${theme.spacing.unit / 2}px ${theme.spacing.unit / 4}px`,
    },
    chipFocused: {
      backgroundColor: emphasize(
        theme.palette.type === 'light' ? theme.palette.grey[300] : theme.palette.grey[700],
        0.08,
      ),
    },
    noOptionsMessage: {
      padding: `${theme.spacing.unit}px ${theme.spacing.unit * 2}px`,
    },
    singleValue: {
      fontSize: 16,
    },
    placeholder: {
      position: 'absolute',
      left: 2,
      fontSize: 16,
    },
    paper: {
      marginTop: theme.spacing.unit,
    },
    divider: {
      height: theme.spacing.unit * 2,
    },
  });

function NoOptionsMessage(props) {
    return (
      <Typography
        color="textSecondary"
        className={props.selectProps.classes.noOptionsMessage}
        {...props.innerProps}
      >
        {props.children}
      </Typography>
    );
  }
  
  function inputComponent({ inputRef, ...props }) {
    return <div ref={inputRef} {...props} />;
  }
  
  function Control(props) {
    return (
      <TextField
        fullWidth
        InputProps={{
          inputComponent,
          inputProps: {
            className: props.selectProps.classes.input,
            inputRef: props.innerRef,
            children: props.children,
            ...props.innerProps,
          },
        }}
        {...props.selectProps.textFieldProps}
      />
    );
  }
  
  function Option(props) {
    return (
      <MenuItem
        buttonRef={props.innerRef}
        selected={props.isFocused}
        component="div"
        style={{
          fontWeight: props.isSelected ? 500 : 400,
        }}
        {...props.innerProps}
      >
        {props.children}
      </MenuItem>
    );
  }
  
  function Placeholder(props) {
    return (
      <Typography
        color="textSecondary"
        className={props.selectProps.classes.placeholder}
        {...props.innerProps}
      >
        {props.children}
      </Typography>
    );
  }
  
  function SingleValue(props) {
    return (
      <Typography className={props.selectProps.classes.singleValue} {...props.innerProps}>
        {props.children}
      </Typography>
    );
  }
  
  function ValueContainer(props) {
    return <div className={props.selectProps.classes.valueContainer}>{props.children}</div>;
  }
  
  function MultiValue(props) {
    return (
      <Chip
        tabIndex={-1}
        label={props.children}
        className={classNames(props.selectProps.classes.chip, {
          [props.selectProps.classes.chipFocused]: props.isFocused,
        })}
        onDelete={event => {
          props.removeProps.onClick();
          props.removeProps.onMouseDown(event);
        }}
      />
    );
  }
  
  function Menu(props) {
    return (
      <Paper square className={props.selectProps.classes.paper} {...props.innerProps}>
        {props.children}
      </Paper>
    );
  }
  
  const components = {
    Option,
    Control,
    NoOptionsMessage,
    Placeholder,
    SingleValue,
    MultiValue,
    ValueContainer,
    Menu,
  };


class NewCompanyUserLinkDialog extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            open: false,
            users: [],
            multi: null,
        };
        var self = this;
        axios({
            method: 'get', //you can set what request you want to be
            url: apiBaseUrl+'users',
            headers: {
              Authorization: 'Bearer ' + localStorage.getItem('session'),
              'Content-Type': 'application/json; charset=utf-8'
            }
          })
            .then(function (response) {
              if(response.status === 200){
                var newUsers = response.data.map((user)=>({
                    value: parseInt(user.id),
                    label: user.username
                }));
                //self.setState({users:response.data.users});
                self.setState({users:newUsers});
                //this.forceUdpate();
              }
            })
            .catch(function (error) {
            });
    }
  
    handleClickOpen = () => {
      this.setState({ open: true });
    };

    handleChange = name => value => {
        this.setState({
          [name]: value,
        });
    };

    saveLink = () => {
        var self = this;
        this.state.multi.map(function(choice) {
            axios({
                method: 'put', //you can set what request you want to be
                url: apiBaseUrl+'company/'+self.props.company+'/user/'+choice.value,
                headers: {
                Authorization: 'Bearer ' + localStorage.getItem('session'),
                'Content-Type': 'application/json; charset=utf-8'
                }
            }).then(function (response) {
                if(response.status === 200){
                    self.setState({ open: false });
                    //this.forceUpdate();
                    self.props.handleCompanyChange();
                }
            }).catch(function (error) {
            });
        });
    }
  
    render() {
        const { classes, theme } = this.props;
        const selectStyles = {
        input: base => ({
            ...base,
            color: theme.palette.text.primary,
        }),
        };
        return (
            <div>
            <Button 
                onClick={this.handleClickOpen} size="small" color="primary" className='new-button'>
                    <AddIcon /> User
            </Button>     
            <Dialog
                open={this.state.open}
                onClose={this.handleClose}
                aria-labelledby="form-dialog-title"
            >
                <DialogTitle id="new-project-dialog-title">New user link</DialogTitle>
                <DialogContent>
                <div className={classes.root}>
                    <Select
                        classes={classes}
                        styles={selectStyles}
                        textFieldProps={{
                        InputLabelProps: {
                            label: 'Username',
                            shrink: true,
                        },
                        }}
                        options={this.state.users}
                        components={components}
                        value={this.state.multi}
                        autoFocus
                        onChange={this.handleChange('multi')}
                        placeholder="Select users"
                        isMulti
                        classes={classes}
                    />
                </div>
                </DialogContent>
                <DialogActions>
                <Button onClick={() => this.setState({ open: false })} color="primary">
                    Cancel
                </Button>
                <Button 
                    onClick={this.saveLink}
                    color="primary">
                    Save
                </Button>
                </DialogActions>
            </Dialog>
            </div>
        );
    }
  }


NewCompanyUserLinkDialog.propTypes = {
    classes: PropTypes.object.isRequired,
    theme: PropTypes.object.isRequired,
  };


export default withStyles(styles, { withTheme: true })(NewCompanyUserLinkDialog);