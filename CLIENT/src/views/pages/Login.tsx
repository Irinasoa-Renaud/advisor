import React, { useState } from 'react';
import Avatar from '@material-ui/core/Avatar';
import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Checkbox from '@material-ui/core/Checkbox';
import { Link as RouterLink } from 'react-router-dom';
import Grid from '@material-ui/core/Grid';
import LockOutlinedIcon from '@material-ui/icons/LockOutlined';
import Typography from '@material-ui/core/Typography';
import { makeStyles } from '@material-ui/core/styles';
import Container from '@material-ui/core/Container';
import { useHistory } from 'react-router-dom';
import Alert from '@material-ui/lab/Alert';
import User from '../../models/User.model';
import { ThunkDispatch } from 'redux-thunk';
import { AuthActionTypes } from '../../redux/types/auth';
import { signinWithPhoneNumberAndPassword } from '../../redux/actions/auth';
import { connect, MapStateToProps } from 'react-redux';
import RootState from '../../redux/types';
import { CircularProgress } from '@material-ui/core';
import Navbar from '../../components/layouts/Navbar';
import { AxiosError } from 'axios';
import Footer from '../../components/layouts/Footer';
import clsx from 'clsx';
import { useTypographyStyles } from '../../hooks/styles';

const useStyles = makeStyles((theme) => ({
  root: {
    paddingTop: theme.spacing(8),
  },
  paper: {
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
    marginTop: theme.spacing(1),
  },
  submit: {
    margin: theme.spacing(2, 0),
  },
}));

interface LoginPageStateProps {
  logingIn: boolean;
}

interface LoginPageDispatchProps {
  signin: (
    phoneNumber: string,
    password: string,
    rememberMe?: boolean
  ) => Promise<User>;
}

interface LoginPageOwnProps {}

type LoginPageProps = LoginPageStateProps &
  LoginPageDispatchProps &
  LoginPageOwnProps;

  const LoginPage: React.FC<LoginPageProps> = ({ signin, logingIn }) => {
  const classes = useStyles();

  const typographyClasses = useTypographyStyles();

  const [phoneNumber, setPhoneNumber] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>();
  const [rememberMe, setRememberMe] = useState(false);

  const history = useHistory();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    setErrorMessage(null);
    signin(phoneNumber, password, rememberMe)
      .then(() => {
        setErrorMessage(null);

        history.replace('/');
      })
      .catch((error) => {
        if (error.isAxiosError) {
          if ((error as AxiosError).response?.status === 401)
            setErrorMessage('N° tel ou mot de passe invalide');
        } else setErrorMessage('Erreur...');
      });
  };

  return (
    <>
      <Navbar hideSearchField hideMenu hideCart elevation={0} />
      <Container component="main" maxWidth="xs" className={classes.root}>
        <div className={classes.paper}>
          <Avatar className={classes.avatar}>
            <LockOutlinedIcon />
          </Avatar>
          <Typography component="h1" variant="h5" className="translate">
            Se connecter
          </Typography>
          <form className={classes.form} noValidate onSubmit={handleSubmit}>
            <TextField
              variant="outlined"
              margin="normal"
              required
              fullWidth
              id="phoneNumber"
              label="N° tel"
              name="phoneNumber"
              value={phoneNumber}
              autoComplete="phoneNumber"
              defaultValue='+'
              type="number"
              autoFocus
              onChange={(e) => setPhoneNumber(e.target.value)}
            />
            <TextField
              variant="outlined"
              margin="normal"
              required
              fullWidth
              name="password"
              label="Mot de passe"
              type="password"
              id="password"
              value={password}
              autoComplete="current-password"
              onChange={(e) => setPassword(e.target.value)}
            />
            <FormControlLabel
              control={
                <Checkbox
                  value={rememberMe}
                  onChange={(_, value) => setRememberMe(value)}
                  color="primary"
                />
              }
              label={<span className="translate">Se souvenir de moi</span>}
            />
            {errorMessage ? (
              <Alert severity="error" className="translate">
                {errorMessage}
              </Alert>
            ) : null}

            <Button
              type="submit"
              fullWidth
              variant="contained"
              color="primary"
              className={classes.submit}
              size="large"
            >
              {logingIn ? (
                <CircularProgress size={24} color="inherit" />
              ) : (
                'Se connecter'
              )}
            </Button>
            <Grid container>
              <Grid item xs>
                <RouterLink
                  to="/forgotPassword"
                  className={clsx("translate", typographyClasses.link)}
                >
                  Mot de passe oublié?
                </RouterLink>
              </Grid>
              <Grid item style={{ width: 40 }} />
              <Grid item xs>
                <RouterLink
                  to="/register"
                  className={clsx("translate", typographyClasses.link)}
                >
                  {'Pas de compte? En créer'}
                </RouterLink>
              </Grid>
            </Grid>
          </form>
        </div>
      </Container>
      <Footer mini />
    </>
  );
};

const mapStateToProps: MapStateToProps<
  LoginPageStateProps,
  LoginPageOwnProps,
  RootState
> = ({ auth: { logingIn } }) => ({
  logingIn,
});

const mapDispatchToProps: (
  dispatch: ThunkDispatch<RootState, undefined, AuthActionTypes>
) => LoginPageDispatchProps = (dispatch) => ({
  signin: (phoneNumber, password, rememberMe) =>
    dispatch(
      signinWithPhoneNumberAndPassword(phoneNumber, password, rememberMe)
    ),
});

const ConnectedLoginPage = connect<
  LoginPageStateProps,
  LoginPageDispatchProps,
  LoginPageOwnProps,
  RootState
>(
  mapStateToProps,
  mapDispatchToProps
)(LoginPage);

export default ConnectedLoginPage;
