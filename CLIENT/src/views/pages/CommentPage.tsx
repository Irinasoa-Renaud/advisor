import React, { useEffect, useState } from 'react';
import {
  Button,
  CircularProgress,
  Container,
  Grid,
  Paper,
  TextField,
  Typography,
} from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import Navbar from '../../components/layouts/Navbar';
import { sendMessage } from '../../services/message';
import { getRestaurantWithId } from '../../services/restaurant';
import { useSnackbar } from 'notistack';
import Footer from '../../components/layouts/Footer';
import clsx from 'clsx';

const useStyles = makeStyles((theme) => ({
  root: {
    marginTop: 40,
  },
  paper: {
    padding: theme.spacing(4),
  },
  title: {
    marginBottom: theme.spacing(4),
  },
  submit: {
    marginTop: theme.spacing(2),
  },
}));

interface CommentPageProps {
  restaurantId?: string;
}

const CommentPage: React.FC<CommentPageProps> = ({ restaurantId }) => {
  const classes = useStyles();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [message, setMessage] = useState('');
  const [target, setTarget] = useState<string>();
  const [loading, setLoading] = useState(false);

  const { enqueueSnackbar } = useSnackbar();

  useEffect(() => {
    if (restaurantId) {
      getRestaurantWithId(restaurantId, 'fr').then(({ admin }) => {
        setTarget(admin);
      });
    }
  }, [restaurantId, target]);

  const onSubmit: (event: React.FormEvent<HTMLFormElement>) => void = (
    event
  ) => {
    event.preventDefault();
    setLoading(true);
    sendMessage({
      name,
      email,
      phoneNumber,
      message,
      target: restaurantId ? target || '' : undefined,
    }).then(() => {
      setLoading(false);
      setName('')
      setEmail('')
      setPhoneNumber('')
      setMessage('')
      enqueueSnackbar('Message envoyé avec succès', { variant: 'success' });
    });
  };

  return (
    <>
      <Navbar hideCart hideSearchField elevation={0} />
      <Container maxWidth="md" className={classes.root}>
        <Paper className={classes.paper} elevation={3}>
          <form noValidate onSubmit={onSubmit}>
            <Typography
              component="h1"
              variant="h4"
              align="center"
              className={clsx(classes.title, 'translate')}
            >
              {restaurantId ? "Contacter le restaurant" : "Commentaire"}
            </Typography>
            <Grid container spacing={4}>
              <Grid item xs={12}>
                <TextField
                  variant="outlined"
                  required
                  fullWidth
                  id="name"
                  label={<span className="translate">Nom</span>}
                  name="name"
                  value={name}
                  autoComplete="name"
                  autoFocus
                  onChange={(e) => setName(e.target.value)}
                />
              </Grid>
              <Grid item xs={7}>
                <TextField
                  variant="outlined"
                  required
                  fullWidth
                  id="email"
                  label={<span className="translate">Email</span>}
                  name="email"
                  value={email}
                  autoComplete="email"
                  autoFocus
                  onChange={(e) => setEmail(e.target.value)}
                />
              </Grid>
              <Grid item xs={5}>
                <TextField
                  id="phoneNumber"
                  variant="outlined"
                  required
                  fullWidth
                  label={<span className="translate">N° Téléphone</span>}
                  name="phoneNumber"
                  value={phoneNumber}
                  autoComplete="phoneNumber"
                  autoFocus
                  onChange={(e) => setPhoneNumber(e.target.value)}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  id="message"
                  variant="outlined"
                  label={<span className="translate">Commentaire</span>}
                  required
                  fullWidth
                  multiline
                  rows={10}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                />
              </Grid>
            </Grid>
            <Button
              type="submit"
              fullWidth
              variant="contained"
              color="primary"
              size="large"
              className={clsx(classes.submit, 'translate')}
            >
              {loading ? (
                <CircularProgress />
              ) : 'Envoyer'}
            </Button>
          </form>
        </Paper>
      </Container>
      <Footer mini />
    </>
  );
};

export default CommentPage;
