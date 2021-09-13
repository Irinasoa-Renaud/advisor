import React, { useCallback, useState } from 'react';
import { makeStyles } from '@material-ui/core/styles';

import Typography from '@material-ui/core/Typography';

import Navbar from '../../components/layouts/Navbar';
import Footer from '../../components/layouts/Footer';
import {
  Box,
  Card,
  CardContent,
  CircularProgress,
  Container,
  Divider,
  Grid,
  TextField,
} from '@material-ui/core';
import changeProfile from '../../services/user';
import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';
import User from '../../models/User.model';
import { connect, MapStateToProps } from 'react-redux';
import RootState, { RootActionTypes } from '../../redux/types';
import { blue } from '@material-ui/core/colors';
import {
  LocationOn,
  Phone,
} from '@material-ui/icons';
import { useSnackbar } from 'notistack';
import { ThunkDispatch } from 'redux-thunk';
import { refreshProfile } from '../../redux/actions/auth';
import Loading from '../../components/Loading';
import clsx from 'clsx';
import { Link } from 'react-router-dom';
import { sendMessage } from '../../services/message';
import PlacesAutocomplete, {geocodeByAddress, getLatLng} from 'react-places-autocomplete';
import { Autocomplete } from '@material-ui/lab';

const useStyles = makeStyles((theme) => ({
  root: {
    margin: theme.spacing(2, 'auto'),
  },
  heading: {
    fontSize: theme.typography.pxToRem(15),
    fontWeight: theme.typography.fontWeightRegular,
  },
  profileHeader: {
    position: 'relative',
    height: 200,
    backgroundColor: blue[400],
  },
  speedDial: {
    position: 'absolute',
    '&.MuiSpeedDial-directionUp, &.MuiSpeedDial-directionLeft': {
      bottom: theme.spacing(2),
      right: theme.spacing(2),
    },
    '&.MuiSpeedDial-directionDown, &.MuiSpeedDial-directionRight': {
      top: theme.spacing(2),
      left: theme.spacing(2),
    },
  },
  buttons: {
    borderRadius: 1000,
    marginTop: theme.spacing(2),
  },
}));

interface ProfilePageStateProps {
  user: User | null;
  refreshingProfile: boolean;
}

interface ProfilePageDispatchProps {
  refreshProfile: () => Promise<User>;
}

interface ProfilePageOwnProps {}

type ProfilePageProps = ProfilePageStateProps &
  ProfilePageDispatchProps &
  ProfilePageOwnProps;

const ProfilePage: React.FC<ProfilePageProps> = ({
  user,
  refreshingProfile,
  refreshProfile,
}) => {
  const classes = useStyles();

  const [firstName, setFirstName] = useState(user?.name.first);
  const [lastName, setLastName] = useState(user?.name.last);
  const [address, setAddress] = useState(user?.address);
  const [phoneNumber, setPhoneNumber] = useState(user?.phoneNumber);

  const [message, setMessage] = useState('');

  const [openEditProfileDialog, setOpenEditProfileDialog] = useState(false);
  const [openMessageDialog, setOpenMessageDialog] = useState(false);

  const { enqueueSnackbar } = useSnackbar();

  const handleChange = async () => {
    try {
      var data = {
        phoneNumber: phoneNumber as string,
        name: { first: firstName as string, last: lastName as string },
        address: address as string,
      };
      await changeProfile({ _id: user?._id, ...data });

      setOpenEditProfileDialog(false);
      enqueueSnackbar('Modification Terminée!', { variant: 'success' });
      refreshProfile();
    } catch (e) {
      enqueueSnackbar('Erreur lors du modification!', { variant: 'error' });
    }
  };

  const validateMessage = () => {
    sendMessage({
      email: `${user?.email}`,
      name: `${user?.name.first} ${user?.name.last}`,
      phoneNumber: `${user?.phoneNumber}`,
      message,
    })
      .then(() => {
        setOpenMessageDialog(false);
        enqueueSnackbar('Message envoyé', { variant: 'success' });
      })
      .catch(() => {
        enqueueSnackbar("Erreur lors de l'envoi", { variant: 'error' });
      });
  };

  const handleSelectUserAddress = useCallback(
    (address) => {
      geocodeByAddress(address)
      .then(results => getLatLng(results[0]))
      .catch(error => console.error('Error', error));
    },
    []
  );

  return (
    <>
      <Navbar elevation={0} hideCart hideSearchField />
      <Container maxWidth="md" className={classes.root}>
        <Card elevation={0} variant="outlined">
          <CardContent>
            <Grid container direction="column" spacing={1}>
              <Grid item>
                <Typography variant="h5">{`${user?.name.first} ${user?.name.last}`}</Typography>
              </Grid>
              <Grid item container>
                <Grid item>
                  <Phone fontSize="small" />
                </Grid>
                <Grid item xs>
                  <Typography variant="body2">{user?.phoneNumber}</Typography>
                </Grid>
              </Grid>
              <Grid item container>
                <Grid item>
                  <LocationOn fontSize="small" />
                </Grid>
                <Grid item xs>
                  <Typography variant="body2">{user?.address}</Typography>
                </Grid>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
        <Box height={40} />
        <Card elevation={0} variant="outlined">
          <CardContent>
            <Typography variant="h6" className="translate">
              Paramètres
            </Typography>

            <Divider />

            <Button
              variant="contained"
              color="primary"
              className={clsx(classes.buttons, 'translate')}
              fullWidth
              onClick={() => setOpenEditProfileDialog(true)}
            >
              Modifier mes infos
            </Button>

            <Button
              variant="contained"
              color="primary"
              className={clsx(classes.buttons, 'translate')}
              fullWidth
              component={Link}
              to="/change-password"
            >
              Changer de mot de passe
            </Button>
            <Button
              variant="contained"
              color="primary"
              className={clsx(classes.buttons, 'translate')}
              fullWidth
              onClick={() => setOpenMessageDialog(true)}
            >
              Envoyer un message vers l'admin
            </Button>
            <Button
              variant="contained"
              color="primary"
              className={clsx(classes.buttons, 'translate')}
              fullWidth
              component={Link}
              to="/favorites"
            >
              Mes favoris
            </Button>
          </CardContent>
        </Card>
      </Container>

      <Dialog
        open={openEditProfileDialog}
        onClose={() => setOpenEditProfileDialog(false)}
        aria-labelledby="edit-profile"
      >
        <DialogTitle id="edit-profile">Modifier vos informations :</DialogTitle>
        <DialogContent>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                autoComplete="First Name"
                name="firstName"
                variant="outlined"
                value={lastName}
                required
                fullWidth
                id="firstName"
                label="Nom :"
                autoFocus
                onChange={(e) => setLastName(e.target.value)}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                autoComplete="Last Name"
                name="lastName"
                variant="outlined"
                value={firstName}
                required
                fullWidth
                id="lastName"
                label="Prénom :"
                autoFocus
                onChange={(e) => setFirstName(e.target.value)}
              />
            </Grid>
            <Grid item xs={12}>
              <PlacesAutocomplete
                value={address}
                onChange={(address) => setAddress(address)}
              >
                {({ getInputProps, suggestions, loading }) => (
                  <Autocomplete
                    noOptionsText="Aucune adresse trouvée"
                    options={suggestions.map((v) => v)}
                    loading={loading}
                    getOptionLabel={(option: any) => option.description}
                    onChange={(_: any, value: any) => value && handleSelectUserAddress?.(value)}
                    inputValue={address}
                    onInputChange={(_, value) =>
                      getInputProps().onChange({ target: { value } })
                    }
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        fullWidth
                        variant="outlined"
                        name="address"
                        placeholder="Adresse"
                        InputProps={{
                          ...params.InputProps,
                          endAdornment: (
                            <React.Fragment>
                              {loading ? (
                                <CircularProgress color="inherit" size={16} />
                              ) : null}
                              {params.InputProps.endAdornment}
                            </React.Fragment>
                          ),
                        }}
                      />
                    )}
                  />
                )}
              </PlacesAutocomplete>
            </Grid>
            <Grid item xs={12}>
              <TextField
                autoComplete="Phone Number"
                name="Phone Number"
                variant="outlined"
                value={phoneNumber}
                required
                fullWidth
                id="phoneNumber"
                label="N° Mobile"
                autoFocus
                onChange={(e) => setPhoneNumber(e.target.value)}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => setOpenEditProfileDialog(false)}
            color="primary"
          >
            Annuler
          </Button>
          <Button
            disabled={
              lastName === user?.name.last &&
              firstName === user?.name.first &&
              address === user?.address &&
              phoneNumber === user?.phoneNumber
            }
            onClick={handleChange}
            color="primary"
            autoFocus
          >
            Valider
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={openMessageDialog}
        onClose={() => setOpenMessageDialog(false)}
        aria-labelledby="send-message"
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle id="send-message" className="translate">
          Envoyer un message vers l'admin
        </DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            value={message}
            onChange={({ target: { value } }) => setMessage(value)}
            label={<span className="translate">Votre message</span>}
            multiline
            rows={6}
            InputProps={{ disableUnderline: true }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenMessageDialog(false)} color="primary">
            Annuler
          </Button>
          <Button
            disabled={!message.length}
            onClick={validateMessage}
            color="primary"
            autoFocus
          >
            Valider
          </Button>
        </DialogActions>
      </Dialog>

      <Loading open={refreshingProfile} />

      <Footer mini />
    </>
  );
};

const mapStateToProps: MapStateToProps<
  ProfilePageStateProps,
  ProfilePageOwnProps,
  RootState
> = ({ auth: { user, refreshingProfile } }) => ({
  user,
  refreshingProfile,
});

const mapDispatchToProps: (
  dispatch: ThunkDispatch<RootState, undefined, RootActionTypes>
) => ProfilePageDispatchProps = (dispatch) => ({
  refreshProfile: () => dispatch(refreshProfile()),
});

const ConnectedProfilePage = connect<
  ProfilePageStateProps,
  ProfilePageDispatchProps,
  ProfilePageOwnProps,
  RootState
>(
  mapStateToProps,
  mapDispatchToProps
)(ProfilePage);

export default ConnectedProfilePage;
