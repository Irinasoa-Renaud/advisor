import React, { useState } from 'react';
import { useHistory, useLocation } from 'react-router-dom';
import queryString from 'querystring';
import Footer from '../../components/layouts/Footer';
import Alert from '@material-ui/lab/Alert';
import {
  Button,
  Container,
  Grid,
  TextField,
  Typography,
} from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import { confirm_account, resendConfirmationCode } from '../../services/auth';
import clsx from 'clsx';

const useStyles = makeStyles((theme) => ({
  root: {
    paddingTop: theme.spacing(18),
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  btn: {
    marginTop: theme.spacing(2),
  },
}));

const ConfirmRegister: React.FC = () => {
  const location = useLocation();

  const { token } = queryString.parse(location.search.substring(1));

  const [code, setCode] = useState<string>('');
  const [erreurMessage, setErreurMessage] = useState('');

  const classes = useStyles();

  const history = useHistory();

  const handleConfirm = async (e: React.FormEvent<HTMLFormElement>) => {

    e.preventDefault();

    if (!code) {
      return setErreurMessage('code vide');
    }

    var data = { code, token };

    try {

      if (await confirm_account(data)) {
        history.push('/login');
      }

    } catch (e) {
      setErreurMessage('veuillez verifier vos informations');
    }
  };

  const handleResendConfirmationCode = async (
    e: React.MouseEvent<HTMLButtonElement, MouseEvent>
  ) => {
    resendConfirmationCode(token as string);
  };

  return (
    <>
      <Container className={classes.root} maxWidth="sm">
        <Typography
          align="center"
          component="h4"
          variant="h6"
          className="translate"
          gutterBottom
        >
          Veuillez saisir les codes envoyés à votre téléphone
        </Typography>
        <form
          noValidate
          autoComplete="off"
          onSubmit={handleConfirm}
          className={classes.form}
        >
          <TextField
            id="code"
            required
            label={<span className="translate">Code de Confirmation</span>}
            variant="outlined"
            onChange={(e) => setCode(e.target.value)}
            style={{ width: 300, textAlign: 'center' }}
          />
          <Grid container direction="row" spacing={2} justify="center">
            {erreurMessage ? (
              <Alert severity="error" className="translate">
                {erreurMessage}
              </Alert>
            ) : null}
            <Grid item>
              <Button
                className={clsx(classes.btn, 'translate')}
                variant="contained"
                onClick={handleResendConfirmationCode}
                size="large"
              >
                Renvoyer le code
              </Button>
            </Grid>
            <Grid item>
              <Button
                className={clsx(classes.btn, 'translate')}
                type="submit"
                variant="contained"
                color="secondary"
                size="large"
              >
                Valider
              </Button>
            </Grid>
          </Grid>
        </form>
      </Container>
      <Footer mini />
    </>
  );
};

export default ConfirmRegister;
