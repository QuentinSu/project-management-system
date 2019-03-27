import React, {Component} from 'react';
import CheckCircleIcon from '@material-ui/icons/CheckCircle';
import green from '@material-ui/core/colors/green';
import classNames from 'classnames';
import SnackbarContent from '@material-ui/core/SnackbarContent';
import Snackbar from '@material-ui/core/Snackbar';
import { withStyles } from '@material-ui/core/styles';
import IconButton from '@material-ui/core/IconButton';
import CloseIcon from '@material-ui/icons/Close';
import PropTypes from 'prop-types';

// PROJECT & COMPANY SAVE NOTIFICATION

const variantIcon = {
    success: CheckCircleIcon
  };
  
  const styles1 = theme => ({
    success: {
      backgroundColor: green[600],
    },
    icon: {
      fontSize: 20,
    },
    iconVariant: {
      opacity: 0.9,
      marginRight: theme.spacing.unit,
    },
    message: {
      display: 'flex',
      alignItems: 'center',
    },
  });

  function MySnackbarContent(props) {
    const { classes, className, message, onClose, variant, ...other } = props;
    const Icon = variantIcon[variant];
  
    return (
      <SnackbarContent
        className={classNames(classes[variant], className)}
        aria-describedby="client-snackbar"
        message={
          <span id="client-snackbar" className={classes.message}>
            <Icon className={classNames(classes.icon, classes.iconVariant)} />
            {message}
          </span>
        }
        action={[
          <IconButton
            key="close"
            aria-label="Close"
            color="inherit"
            className={classes.close}
            onClick={onClose}
          >
            <CloseIcon className={classes.icon} />
          </IconButton>,
        ]}
        {...other}
      />
    );
  }
  
  MySnackbarContent.propTypes = {
    classes: PropTypes.object.isRequired,
    className: PropTypes.string,
    message: PropTypes.node,
    onClose: PropTypes.func,
    variant: PropTypes.oneOf(['success', 'warning', 'error', 'info']).isRequired,
  };
  
  const MySnackbarContentWrapper = withStyles(styles1)(MySnackbarContent);
  
  const styles2 = theme => ({
    margin: {
      margin: theme.spacing.unit,
    },
  });


export default function ElementSaveNotification(props) {
  return (
      <Snackbar
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'left',
        }}
        open={props.open}
        autoHideDuration={3000}
        onClose={props.handleClose}
      >
        <MySnackbarContentWrapper
          onClose={props.handleClose}
          variant="success"
          message={<span id="message-id">{props.message}</span>}
        />
      </Snackbar>
  )
}