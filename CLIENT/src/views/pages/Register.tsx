import React, { useState } from 'react';
import Avatar from '@material-ui/core/Avatar';
import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';
import { Link as RouterLink } from 'react-router-dom';
import Grid from '@material-ui/core/Grid';
import LockOutlinedIcon from '@material-ui/icons/LockOutlined';
import Typography from '@material-ui/core/Typography';
import { makeStyles } from '@material-ui/core/styles';
import Container from '@material-ui/core/Container';
import { register } from '../../services/auth';
import Footer from '../../components/layouts/Footer';
import { Box, CircularProgress } from '@material-ui/core';
import { useHistory } from 'react-router-dom';
import clsx from 'clsx';
import { useTypographyStyles } from '../../hooks/styles';
import { useSnackbar } from 'notistack';

const useStyles = makeStyles((theme) => ({
  paper: {
    paddingTop: theme.spacing(8),
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
  btn: {
    marginTop: theme.spacing(2),
  },
  success: {
    width: '100%',
    marginTop: '40vh',
  },
}));

const RegisterPage: React.FC = () => {
  const classes = useStyles();

  const typographyClasses = useTypographyStyles();

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [email, setMail] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [loading, setLoading] = useState(false);

  const history = useHistory();
  const { enqueueSnackbar } = useSnackbar();

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {

    event.preventDefault();

    try {

      setLoading(true);

      const { data: data } = await register({
        phoneNumber,
        email,
        password,
        name: {
          first: firstName,
          last: lastName,
        },
      })

      if (data) {
        history.push(`/confirm-register?token=${data.token}`);
      }

    }
    catch (err) {
      enqueueSnackbar(`Le mail ou Téléphone est deja utilisé`, {
        variant: 'error',
      });

    }
    finally {

      setLoading(false);

    }

  };

  const validated = Boolean(
    firstName.length &&
    lastName.length &&
    password.length &&
    confirmPassword === password &&
    email.length &&
    phoneNumber.length
  );

  return (
    <>
      <Container component="main" maxWidth="xs">
        <div className={classes.paper}>
          <Avatar className={classes.avatar}>
            <LockOutlinedIcon />
          </Avatar>
          <Typography component="h1" variant="h5" className="translate">
            Créer un compte
          </Typography>
          <form
            className={classes.form}
            noValidate
            autoComplete="off"
            onSubmit={handleSubmit}
          >
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  error={!phoneNumber.length}
                  helperText="Ce champ ne doit pas être vide"
                  variant="outlined"
                  required
                  fullWidth
                  id="phoneNumber"
                  label={<span className="translate">N° Téléphone</span>}
                  name="phoneNumber"
                  autoComplete="phoneNumber"
                  onChange={(e) => setPhoneNumber(e.target.value)}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  error={!firstName.length}
                  helperText="Ce champ ne doit pas être vide"
                  autoComplete="firstName"
                  name="firstName"
                  variant="outlined"
                  required
                  fullWidth
                  id="firstName"
                  label={<span className="translate">Prénom</span>}
                  autoFocus
                  onChange={(e) => setFirstName(e.target.value)}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  error={!lastName.length}
                  helperText="Ce champ ne doit pas être vide"
                  autoComplete="lastName"
                  name="lastName"
                  variant="outlined"
                  required
                  fullWidth
                  id="lastName"
                  label={<span className="translate">Nom</span>}
                  autoFocus
                  onChange={(e) => setLastName(e.target.value)}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  error={!email.length}
                  helperText="Ce champ ne doit pas être vide"
                  variant="outlined"
                  required
                  fullWidth
                  id="mail"
                  label={<span className="translate">Adresse mail</span>}
                  name="email"
                  autoComplete="mail"
                  onChange={(e) => setMail(e.target.value)}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  error={!password.length}
                  helperText="Ce champ ne doit pas être vide"
                  variant="outlined"
                  required
                  fullWidth
                  name="password"
                  label={<span className="translate">Mot de passe</span>}
                  type="password"
                  id="password"
                  autoComplete="current-password"
                  onChange={(e) => setPassword(e.target.value)}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  error={password !== confirmPassword}
                  helperText="Les mots de passe ne correspondent pas"
                  variant="outlined"
                  required
                  fullWidth
                  name="Confirm Password"
                  label={
                    <span className="translate">Confirmer mot de passe</span>
                  }
                  type="password"
                  id="condfirmPassword"
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
              </Grid>
            </Grid>
            <Button
              type="submit"
              fullWidth
              variant="contained"
              color="primary"
              size="large"
              className={classes.submit}
              disabled={!validated}
            >
              {loading ? (
                <CircularProgress color="secondary" />
              ) : (
                <span className="translate">Créer un compte</span>
              )}
            </Button>
            <Grid container justify="flex-end">
              <Grid item>
                <RouterLink
                  to="/login"
                  className={clsx('translate', typographyClasses.link)}
                >
                  Déjà un compte? Se connecter
                </RouterLink>
              </Grid>
            </Grid>
          </form>
        </div>
      </Container>

      <Box height={40} />

      <Footer mini />
    </>
  );
};

export default RegisterPage;
