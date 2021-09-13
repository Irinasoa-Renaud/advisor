import React, { useState } from 'react';
import Avatar from '@material-ui/core/Avatar';
import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';

import { Link as RouterLink } from 'react-router-dom';
import Grid from '@material-ui/core/Grid';

import LockOutlinedIcon from '@material-ui/icons/LockOutlined';
import Typography from '@material-ui/core/Typography';
import { makeStyles, useTheme } from '@material-ui/core/styles';
import Container from '@material-ui/core/Container';

import { reset_password, confirm_reset_password } from '../../services/auth';
import Alert from '@material-ui/lab/Alert';
import clsx from 'clsx';
import { useTypographyStyles } from '../../hooks/styles';

const useStyles = makeStyles((theme) => ({
  paper: {
    marginTop: theme.spacing(8),
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  avatar: {
    margin: theme.spacing(1),
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
  confirm: {
    marginTop: theme.spacing(10),
  },
  success: {
    marginTop: '20vh',
  },
}));

const ForgotPaswwordPage: React.FC = () => {
  const classes = useStyles();

  const typographyClasses = useTypographyStyles();

  const [isSent, setIsSent] = useState(false);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [code, setCode] = useState('');
  const [erreurMessage, setErreurMessage] = useState('');
  const [token, setToken] = useState('');
  const [isReset, setIsReset] = useState(false);

  const theme = useTheme();

  const handleResetPassword = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!phoneNumber) {
      setErreurMessage('code vide');
      return;
    }

    var data = { phoneNumber };
    try {
      const reponse = await reset_password(data);
      if (reponse !== false) {
        setIsSent(true);
        setErreurMessage('');
        setToken(reponse.data.token);
      } else {
        setErreurMessage('Veuillez verifier votre numero');
      }
    } catch (e) {
      setErreurMessage('Veuillez verifier vos informations');
    }
  };

  const handleConfirmResetPassword = async (
    e: React.FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault();

    if (!password || !code || !confirmPassword) {
      setErreurMessage('Les identifiants ne sont pas complets');
      return;
    }
    if (password !== confirmPassword) {
      setErreurMessage('Mot de passe non identiques');
      return;
    }

    var data = { code, password, token };
    try {
      const reponse = await confirm_reset_password(data);
      if (reponse) {
        setIsReset(true);
      } else {
        setIsReset(false);
        setErreurMessage('Veuillez verifier vos informations');
      }
    } catch (e) {
      setErreurMessage('Veuillez verifier vos informations');
    }
  };

  return (
    <>
      {!isReset ? (
        <Container component="main" maxWidth="sm">
          <div className={classes.paper}>
            {!isSent ? (
              <>
                <Grid container justify="center">
                  <Grid item>
                    <Typography
                      className={clsx(classes.confirm, 'translate')}
                      component="h4"
                      variant="h6"
                      align="center"
                    >
                      Entrer votre numéro téléphone pour recevoir votre code de
                      restauration
                    </Typography>
                  </Grid>
                </Grid>
                <form
                  className={classes.form}
                  noValidate
                  autoComplete="off"
                  onSubmit={handleResetPassword}
                >
                  <Grid
                    container
                    justify="center"
                    style={{ marginBottom: theme.spacing(2) }}
                  >
                    <Grid item>
                      <TextField
                        id="phoneNumber"
                        required
                        label={<span className="translate">Téléphone</span>}
                        variant="outlined"
                        onChange={(e) => setPhoneNumber(e.target.value)}
                      />
                    </Grid>
                  </Grid>
                  {erreurMessage ? (
                    <Alert
                      severity="error"
                      style={{ marginBottom: theme.spacing(2) }}
                    >
                      {erreurMessage}
                    </Alert>
                  ) : null}
                  <Grid container direction="row" spacing={2} justify="center">
                    <Grid item>
                      <Button
                        className="translate"
                        type="submit"
                        variant="contained"
                      >
                        Annuler
                      </Button>
                    </Grid>
                    <Grid item>
                      <Button
                        className="translate"
                        type="submit"
                        variant="contained"
                        color="secondary"
                      >
                        Valider
                      </Button>
                    </Grid>
                  </Grid>
                </form>
              </>
            ) : (
              <>
                <Avatar className={classes.avatar}>
                  <LockOutlinedIcon />
                </Avatar>
                <Typography component="h1" variant="h5" className="translate">
                  Entrer votre nouveau mot de passe
                </Typography>
                <form
                  className={classes.form}
                  noValidate
                  onSubmit={handleConfirmResetPassword}
                >
                  <Grid container spacing={2}>
                    <Grid item xs={12}>
                      <TextField
                        name="Code"
                        variant="outlined"
                        required
                        fullWidth
                        id="code"
                        type="number"
                        label={<span className="translate">Code</span>}
                        autoFocus
                        onChange={(e) => setCode(e.target.value)}
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
                        label={
                          <span className="translate">Confirm Password</span>
                        }
                        type="password"
                        id="condfirmPassword"
                        onChange={(e) => setConfirmPassword(e.target.value)}
                      />
                    </Grid>
                  </Grid>
                  {erreurMessage ? (
                    <Alert severity="error" className="translate">
                      {erreurMessage}
                    </Alert>
                  ) : null}
                  <Button
                    type="submit"
                    fullWidth
                    variant="contained"
                    color="primary"
                    className={clsx(classes.submit, 'translate')}
                  >
                    Valider
                  </Button>
                  <Grid container justify="flex-end">
                    <Grid item>
                      <RouterLink
                        to="/login"
                        className={clsx('translate', typographyClasses.link)}
                      >
                        Annuler
                      </RouterLink>
                    </Grid>
                  </Grid>
                </form>
              </>
            )}
          </div>
        </Container>
      ) : (
        <>
          <Grid
            container
            justify="center"
            alignItems="center"
            className={classes.success}
            direction="column"
            spacing={5}
          >
            <Grid item xs={12} sm={6} md={4} lg={4} xl={6}>
              <Typography
                component="h4"
                variant="h2"
                align="center"
                className="translate"
              >
                Votre mot de passe a été renouveller avec succés
              </Typography>
            </Grid>
            <Grid item xs={12} sm={6} md={4} lg={4} xl={6}>
              <RouterLink
                to="/login"
                className={clsx('translate', typographyClasses.link)}
              >
                Veuillez vous connecter maintenant!
              </RouterLink>
            </Grid>
          </Grid>
        </>
      )}
    </>
  );
};

export default ForgotPaswwordPage;
