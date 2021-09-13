import React, { useState } from 'react';
import {
  Avatar,
  Button,
  CircularProgress,
  Container,
  Grid,
  TextField,
  Typography,
} from '@material-ui/core';
import LockOutlinedIcon from '@material-ui/icons/LockOutlined';
import { Alert } from '@material-ui/lab';
import { makeStyles } from '@material-ui/core/styles';
import clsx from 'clsx';
import { changePassword } from '../../services/user';
import Navbar from '../../components/layouts/Navbar';
import { useSnackbar } from 'notistack';
import { useHistory } from 'react-router';
import Footer from '../../components/layouts/Footer';

const useStyles = makeStyles((theme) => ({
  paper: {
    marginTop: theme.spacing(8),
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  avatar: {
    margin: theme.spacing(1, 'auto'),
    backgroundColor: theme.palette.secondary.main,
  },
  form: {
    width: '100%', // Fix IE 11 issue.
    marginTop: theme.spacing(3),
    marginBottom: theme.spacing(2),
  },
  submit: {
    margin: theme.spacing(3, 0, 2),
  },
  btn: {
    marginTop: theme.spacing(2),
  },
  confirm: {
    marginTop: theme.spacing(10),
    width: '500px',
  },
  success: {
    width: '100%',
    marginTop: '20vh',
  },
}));

const ChangePasswordPage = () => {
  const classes = useStyles();

  const [oldPassword, setOldPassword] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [confirmPassword, setConfirmPassword] = useState<string>('');

  const [inProgress, setInProgress] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string>();

  const { enqueueSnackbar } = useSnackbar();

  const history = useHistory();

  const handleResetPassword: React.FormEventHandler<HTMLFormElement> = async (
    e
  ) => {
    e.preventDefault();

    if (!password || !confirmPassword)
      return setErrorMessage('Les identifiants ne sont pas complets');

    if (password !== confirmPassword)
      return setErrorMessage('Mot de passe non identiques');

    var data = { newPassword: password, oldPassword };

    setErrorMessage(undefined);
    setInProgress(true);

    try {
      await changePassword(data);

      enqueueSnackbar('Succès', {
        variant: 'success',
      });
      history.replace('/profile');
    } catch (e) {
      setErrorMessage('Veuillez verifier vos informations');
    } finally {
      setInProgress(false);
    }
  };

  return (
    <>
      <Navbar hideCart hideSearchField elevation={0} />

      <Container component="main" maxWidth="sm">
        <Avatar className={classes.avatar}>
          <LockOutlinedIcon />
        </Avatar>
        <Typography
          component="h1"
          variant="h5"
          className="translate"
          align="center"
        >
          Entrer votre nouveau mot de passe
        </Typography>
        <form
          className={classes.form}
          noValidate
          onSubmit={handleResetPassword}
        >
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                name="old-password"
                variant="outlined"
                required
                fullWidth
                id="old-password"
                type="password"
                label={<span className="translate">Ancien mot de passe</span>}
                autoFocus
                onChange={(e) => setOldPassword(e.target.value)}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                variant="outlined"
                required
                fullWidth
                name="password"
                label={<span className="translate">Password</span>}
                type="password"
                id="password"
                onChange={(e) => setPassword(e.target.value)}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                variant="outlined"
                required
                fullWidth
                name="Confirm Password"
                label={<span className="translate">Confirm Password</span>}
                type="password"
                id="condfirmPassword"
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </Grid>
          </Grid>

          {errorMessage && (
            <Alert severity="error" className="translate">
              {errorMessage}
            </Alert>
          )}

          <Button
            type="submit"
            fullWidth
            variant="contained"
            color="primary"
            className={clsx(classes.submit, 'translate')}
          >
            {inProgress ? (
              <CircularProgress size={24} color="inherit" />
            ) : (
              'Valider'
            )}
          </Button>
        </form>
      </Container>

      <Footer mini />
    </>
  );
};

export default ChangePasswordPage;
