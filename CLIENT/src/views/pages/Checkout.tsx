import React, { createRef, useCallback, useEffect, useMemo, useState } from 'react';
import StripeCheckout, { Token } from 'react-stripe-checkout';
import {
  Avatar,
  Box,
  Button,
  Checkbox,
  Chip,
  CircularProgress,
  Container,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  FormControl,
  FormControlLabel,
  Grid,
  IconButton,
  InputLabel,
  ListItem,
  ListItemAvatar,
  ListItemText,
  makeStyles,
  MenuItem,
  Paper,
  Select,
  Step,
  StepButton,
  StepContent,
  Stepper,
  TextField,
  Theme,
  Typography,
  Tooltip,
  useMediaQuery,
  useTheme,
} from '@material-ui/core';
import PlacesAutocomplete, { geocodeByAddress, getLatLng, geocodeByPlaceId } from 'react-places-autocomplete';
import { CartActionTypes, CartState } from '../../redux/types/cart';
import commands, { sendCode, confirmCode } from '../../services/commands';
import { connect, MapStateToProps } from 'react-redux';
import RootState from '../../redux/types';
import { Link, useHistory } from 'react-router-dom';
import Command, {
  CommandType,
  DeliveryOption,
} from '../../models/Command.model';
import Api from '../../services/Api';
import { ThunkDispatch } from 'redux-thunk';
import {
  removeFoodFromCart,
  removeMenuFromCart,
  resetCart,
} from '../../redux/actions/cart';
import { Lang } from '../../redux/types/setting';
import { useSnackbar } from 'notistack';
import User from '../../models/User.model';
import Footer from '../../components/layouts/Footer';
import Navbar from '../../components/layouts/Navbar';
import {
  Close as CloseIcon,
  Delete as DeleteIcon,
  DirectionsRun,
  ExitToApp as ExitToAppIcon,
  Home as HomeIcon,
  LocalShipping as LocalShippingIcon,
  LocationOn as LocationOnIcon,
  MeetingRoom as MeetingRoomIcon,
  ShoppingBasket as ShoppingBasketIcon,
} from '@material-ui/icons';
import clsx from 'clsx';
import {
  estimateMenuPrice,
  estimateTotalPrice,
} from '../../services/cart';
import { SlideTransition } from '../../components/transition';
import moment from 'moment';
import DialogAlert from './Dialog';
import 'moment/locale/fr';
import { Autocomplete } from '@material-ui/lab';
import { useSelector } from '../../utils/redux';
import MuiAlert, { AlertProps } from '@material-ui/lab/Alert';
import { getGeoLocation } from '../../services/location';


function Alert(props: AlertProps) {
  return <MuiAlert elevation={6} variant="filled" {...props} />;
}

const useStyles = makeStyles((theme) => ({
  logoContainer: {
    display: 'flex',
    alignItems: 'center',
  },
  logo: {
    width: '40px',
    marginRight: theme.spacing(2),
  },
  menu: {
    fontFamily: 'Cool Sans',
    fontSize: '1em',
  },
  advisor: {
    fontFamily: 'Golden Ranger',
    color: theme.palette.primary.main,
    fontSize: '1.5em',
  },
  root: {
    padding: theme.spacing(6, 10),
    [theme.breakpoints.down('sm')]: {
      padding: theme.spacing(2, 4),
    },
  },
  product: {
    pointerEvents: 'none',
    backgroundSize: 'containe',
    backgroundRepeat: 'no-repeat',
    backgroundPosition: '50%',
    transition: 'opacity 0.2s',
    transform: 'translateZ(0)',
    opacity: 1,
  },
  icon: {
    paddingRight: theme.spacing(1),
  },
  divider: {
    margin: theme.spacing(2, 0),
  },
  itemContainer: {
    display: 'flex',
    flexDirection: 'column',
  },
  itemName: {
    fontSize: 16,
    fontFamily: 'Work Sans',
  },
  itemPrice: {
    fontSize: 14,
    fontFamily: 'Work Sans',
  },
  itemTotalPrice: {
    fontSize: 16,
    fontWeight: 600,
    fontFamily: 'Work Sans',
    paddingLeft: theme.spacing(8),
  },
  stepper: {
    padding: 0,
    backgroundColor: 'transparent',
    [theme.breakpoints.down('md')]: {
      marginBottom: theme.spacing(2),
    },
  },
  chips: {
    margin: theme.spacing(1),
    '&.active': {
      backgroundColor: theme.palette.primary.main,
      color: theme.palette.getContrastText(theme.palette.primary.main),
    },
  },
  shippingDate: {
    width: 200,
  },
}));

// Init moment to fr locale
moment.locale('fr');

const getWeekday: (day?: number) => string = (day = 0) => {
  return moment().add(day, 'days').format('dddd');
};

interface CheckoutStateProps {
  authenticated: boolean;
  user: User | null;
  cart: CartState;
  lang: Lang;
}

interface CheckoutDispatchProps {
  resetCart: () => void;
  removeFood: (id: string) => void;
  removeMenu: (id: string) => void;
}

interface CheckoutOwnProps { }

type CheckoutProps = CheckoutStateProps &
  CheckoutDispatchProps &
  CheckoutOwnProps;

const Checkout: React.FC<CheckoutProps> = ({
  authenticated,
  user,
  cart,
  // lang,
  resetCart,
  removeFood,
  removeMenu,
}) => {
  const classes = useStyles();

  const { totalPrice, restaurant, totalCount, foods, menus, priceless } = cart;

  const { priceType }: any = useSelector(({ setting: { price } }: any) => ({
    priceType: price
  }))

  // useEffect(() => {
  //   if (
  //     (menus.length === 0) &&
  //     (foods.length === 0)
  //   ) {
  //     history.push('/home')
  //   }
  // })

  const [commandType, setCommandType] = useState<CommandType>(() =>
    authenticated &&
      restaurant &&
      restaurant.delivery &&
      priceType !== 'priceless' &&
      menus.findIndex(({ item: { type } }) => type === 'priceless') === -1 ? 'delivery'
      : restaurant && restaurant.surPlace
        ? 'on_site'
        : 'takeaway'
  );


  const [shipAsSoonAsPossible, setShipAsSoonAsPossible] = useState(true);

  const [name, setName] = useState(
    (user && `${user.name.first} ${user.name.last}`) || ''
  );
  const [phoneNumber, setPhoneNumber] = useState(user?.phoneNumber || '');
  const [address] = useState(user?.address || '');
  const [payAfterDelivery, setPayAfterDelivery] = useState(false);
  const [shippingAddress, setShippingAddress] = useState('');
  const [shippingTime, setShippingTime] = useState(new Date());
  const [shippingDay, setShippingDay] = useState<number>(0);
  const [shippingHour, setShippingHour] = useState<number>();
  const [shippingMinute, setShippingMinute] = useState<number>();
  const [appartment, setAppartment] = useState('');
  const [shippingAppartementNumero, setShippingAppartementNumero] = useState<string>('');
  const [floor, setFloor] = useState('');
  const [deliveryOption, setDeliveryOption] = useState<DeliveryOption>('behind_the_door');


  const hourOptions = useMemo<string[]>(() => {
    const res = [];

    if (restaurant) {
      const weekday = getWeekday(shippingDay);
      const openingTime = restaurant.openingTimes.find(
        ({ day }) => day.toLowerCase() === weekday
      );
      if (openingTime) {
        const { openings } = openingTime;
        for (let opening of openings) {
          for (let i = opening.begin.hour; i <= opening.end.hour; i++) {
            res.push(
              i.toLocaleString('fr-FR', {
                minimumIntegerDigits: 2,
              })
            );
          }
        }
      }
    }

    return res;

  }, [restaurant, shippingDay]);

  const minutesOptions = useMemo<string[]>(() => {
    const res = [];

    for (let i = 0; i < 60; i += 5)
      res.push(
        i.toLocaleString('fr-FR', {
          minimumIntegerDigits: 2,
        })
      );

    return res;
  }, []);

  useEffect(() => {
    const date = moment()
      .second(0)
      .add(shippingDay, 'days')
      .hour(shippingHour || new Date().getHours())
      .minute(shippingMinute || Math.ceil(new Date().getMinutes() / 5) * 5)
      .toDate();

    setShippingTime(date);
  }, [shippingDay, shippingHour, shippingMinute]);

  const [openConfirmation, setOpenConfirmation] = useState(false);
  const [openDialog, setopenDialog] = useState<boolean>(false);
  const [sendingConfirmationCode, setSendingConfirmationCode] = useState(false);
  const [confirmationCode, setConfirmationCode] = useState('');
  const [blockDelivery, setblockDelivery] = useState(false);

  const [activeStep, setActiveStep] = useState(0);

  const [comment, setComment] = useState('');
  const [email, setEmail] = useState(user?.email || '');
  const [deliveryPriceAmount, setDeliveryPrice] = useState(0);

  const [inProgress, setInProgress] = useState(false);

  const [otherFees, setOtherFees] = useState<number>(0);

  const [openPayementType, setOpentPayementType] = useState(false);

  useEffect(() => {

    if (commandType !== 'delivery') {
      setOtherFees(0);
    } else {
      if (restaurant && restaurant.deliveryFixed) {
        setOtherFees(restaurant?.deliveryPrice?.amount || 0);
        setDeliveryPrice(restaurant?.deliveryPrice?.amount || 0);
      }
    }


    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [commandType, deliveryPriceAmount]);

  const { enqueueSnackbar } = useSnackbar();

  const history = useHistory();

  const smDown = useMediaQuery((theme: Theme) => theme.breakpoints.down('sm'));

  const stripeCheckoutRef = createRef<any>();

  const sendCommand = useCallback(
    async () => {


      const { restaurant, foods, menus, totalPrice } = cart;

      const data: Command = {
        relatedUser: authenticated ? user?._id : undefined,
        customer: !authenticated
          ? {
            name,
            address,
            phoneNumber,
            email,
          }
          : undefined,
        commandType,
        items: foods.map(({ item: { _id: item }, options, quantity }) => ({
          item,
          comment: comment || '',
          options: options.map(({ title, maxOptions, items }) => ({
            title,
            maxOptions,
            items: items.map(({ item: { _id: item }, quantity }) => ({
              item,
              quantity,
            })),
          })),
          quantity,
        })),
        menus: menus.map(({ foods, item: { _id: item }, quantity }) => ({
          item,
          quantity,
          foods: foods.map(({ food: { _id: food }, options }) => ({
            food,
            options: options.map(({ title, maxOptions, items }) => ({
              title,
              maxOptions,
              items: items.map(({ item: { _id: item }, quantity }) => ({
                item,
                quantity,
              })),
            })),
          })),
        })),
        shipAsSoonAsPossible:
          commandType === 'delivery' ? shipAsSoonAsPossible : undefined,
        shippingAddress: commandType === 'delivery' ? shippingAddress : undefined,
        shippingTime:
          commandType === 'delivery' && !shipAsSoonAsPossible
            ? shippingTime.getTime()
            : undefined,
        appartement: commandType === 'delivery' ? appartment : undefined,
        etage: commandType === 'delivery' ? Number(floor) : undefined,
        optionLivraison: commandType === 'delivery' ? deliveryOption : undefined,
        comment,
        totalPrice: totalPrice + otherFees,
        priceLivraison: deliveryPriceAmount,
        restaurant: restaurant?._id,
        priceless,
        confirmationCode,
        codeAppartement: commandType === 'delivery' ? shippingAppartementNumero : undefined,
        paiementLivraison:
          commandType === 'delivery' ? payAfterDelivery : undefined,
      }

      setInProgress(true);

      try {
        const { code } = await commands(data);

        enqueueSnackbar(
          'Votre commande a éte bien envoyé, Menu advisor vous remercie',
          {
            variant: 'success',
          }
        );

        const listCart = {
          ...cart,
          totalPrice: totalPrice + deliveryPriceAmount,
          priceLivraison: (deliveryPriceAmount / 100),
        }

        history.push('/order-summary', { ...listCart, code, comment, commandType, shippingTime });

        //  window.location.reload();

        resetCart();
      } catch (e) {
        enqueueSnackbar('Erreur...', { variant: 'error' });
      }

      setInProgress(false);
    }, [address, appartment, authenticated, cart, commandType, comment, confirmationCode, deliveryOption, email, enqueueSnackbar, floor, history, name, otherFees, payAfterDelivery, phoneNumber, priceless, resetCart, shipAsSoonAsPossible, shippingAddress, shippingTime, user, shippingAppartementNumero])

  const handleToken: (token: Token) => Promise<void> = async (token) => {
    try {
      setInProgress(true);

      const response = await Api.post('/checkout', {
        token,
        cart: { ...cart, restaurant: cart.restaurant?._id },
      });

      const { chargeId } = response.data as { chargeId: string };
      const { restaurant, foods, menus, totalPrice } = cart;

      const command: Command = {
        commandType,
        relatedUser: (user && user._id) || undefined,
        payed: {
          status: true,
          paymentChargeId: chargeId,
        },
        items: foods.map(({ item: { _id: item }, options, quantity }) => ({
          item,
          comment: comment || '',
          options: options.map(({ title, maxOptions, items }) => ({
            title,
            maxOptions,
            items: items.map(({ item: { _id: item }, quantity }) => ({
              item,
              quantity,
            })),
          })),
          quantity,
        })),
        menus: menus.map(({ foods, item: { _id: item }, quantity }) => ({
          item,
          quantity,
          foods: foods.map(({ food: { _id: food }, options }) => ({
            food,
            options: options.map(({ title, maxOptions, items }) => ({
              title,
              maxOptions,
              items: items.map(({ item: { _id: item }, quantity }) => ({
                item,
                quantity,
              })),
            })),
          })),
        })),
        totalPrice: totalPrice + otherFees,
        priceLivraison: deliveryPriceAmount,
        shipAsSoonAsPossible:
          commandType === 'delivery' ? shipAsSoonAsPossible : undefined,
        shippingAddress:
          commandType === 'delivery' ? shippingAddress : undefined,
        shippingTime:
          ((commandType === 'delivery' && !shipAsSoonAsPossible) || commandType === 'takeaway')
            ? shippingTime.getTime()
            : undefined,
        appartement: commandType === 'delivery' ? appartment : undefined,
        etage: commandType === 'delivery' ? Number(floor) : undefined,
        optionLivraison:
          commandType === 'delivery' ? deliveryOption : undefined,
        comment,
        confirmationCode,
        codeAppartement: commandType === 'delivery' ? shippingAppartementNumero : undefined,
        restaurant: restaurant?._id,
        priceless,
      };

      const { code } = await commands(command);

      setInProgress(false);

      enqueueSnackbar(
        'Votre commande a éte bien envoyé, Menu advisor vous remercie',
        { variant: 'success' }
      );

      history.push('/order-summary', { ...cart, code, comment, commandType, shippingTime });

      resetCart();
    } catch (error) {
      setInProgress(false);
      enqueueSnackbar('Erreur...', { variant: 'error' });
    }
  };

  const payAfter = useCallback(
    () => {
      setPayAfterDelivery(true);
      sendCommand();
    },
    [sendCommand]
  )

  const validateCode = useCallback(
    async () => {
      setSendingConfirmationCode(true);

      try {
        const res = await confirmCode(confirmationCode);
      } catch (error) {
        setSendingConfirmationCode(false);
        return enqueueSnackbar('Erreur, code invalide...', {
          variant: 'error',
        });
      }

      setSendingConfirmationCode(false);
      setOpenConfirmation(false);
      setInProgress(true);
      if (commandType === 'delivery') {
        if (restaurant?.paiementCB && !restaurant?.paiementLivraison) {
          (document.querySelector('.StripeCheckout') as HTMLButtonElement)?.click();
        } else if (!restaurant?.paiementCB && restaurant?.paiementLivraison) {
          payAfter()
        } else if (restaurant?.paiementCB && restaurant?.paiementLivraison) {
          setOpentPayementType(true);
        }
      } else if (commandType === 'takeaway') {
        sendCommand();
      }

      // if (commandType === 'delivery' && !payAfterDelivery) {
      //   (document.querySelector('.StripeCheckout') as HTMLButtonElement).click();
      // } else sendCommand();
    }, [commandType, confirmationCode, enqueueSnackbar, payAfter, restaurant, sendCommand]);


  const checkout = async () => {
    if (commandType === 'delivery' || commandType === 'takeaway') {

      if (restaurant &&
        (
          restaurant.delivery &&
          (+restaurant.minPriceIsDelivery) >= (estimateTotalPrice(cart) / 100) && commandType === 'delivery')
      ) {
        return enqueueSnackbar(
          ` ${restaurant.minPriceIsDelivery} € minimun pour effectuer une livraison`,
          { variant: 'info' }
        );
      }

      if (!authenticated) {
        return enqueueSnackbar(
          'Vous devez vous connecter pour pouvoir commander',
          { variant: 'info' }
        );
      }

      setInProgress(true);

      try {
        await sendCode({
          commandType,
          relatedUser: user ? user._id : undefined,
          customer: !authenticated
            ? {
              name,
              address,
              phoneNumber,
              email,
            }
            : undefined,
        });

        setOpenConfirmation(true);
      } catch (err) {
        setInProgress(false);
        return enqueueSnackbar(
          "Une erreur s'est produite. Veuillez réessayer s'il vous plaît",
          {
            variant: 'error',
          }
        );
      }
    } else sendCommand();
  };

  const handleSelectShippingAddress = async (data: any) => {

    const results = await geocodeByAddress(data.description);
    const { lng, lat } = await getLatLng(results[0]);

    console.log("data.placeId", data.placeId);

    const [place] = await geocodeByPlaceId(data.placeId);
    const address = place.formatted_address;
    const { long_name: postalCode = '' } = place.address_components.find(c => c.types.includes('postal_code')) || {};
    const { long_name: city = '' } = place.address_components.find(c => c.types.includes('locality')) || {};

    if (restaurant) {

      if ((restaurant.livraison.freeCP as any[])?.includes(postalCode.trim().toLowerCase())) {
        enqueueSnackbar('Livraison gratuite', {
          variant: 'success',
        });
        return;
      }

      if ((restaurant.livraison.freeCity as any[])?.includes(city.trim().toLowerCase())) {
        enqueueSnackbar('Livraison gratuite pour cette ville', {
          variant: 'success',
        });
        return;
      }

      let directionsService = new google.maps.DirectionsService();
      let directionsRenderer = new google.maps.DirectionsRenderer();

      const route: any = {
        origin: {
          lat: restaurant.location.coordinates[1],
          lng: restaurant.location.coordinates[0],
        },
        destination: {
          lat: lat,
          lng: lng,
        },
        travelMode: 'DRIVING'
      }

      directionsService.route(route,
        function (response: any, status: any) { // anonymous function to capture directions
          if (status !== 'OK') {
            enqueueSnackbar('ERROR', {
              variant: 'error',
            });
            setblockDelivery(true);

            return;
          } else {
            directionsRenderer.setDirections(response); // Add route to the map
            var directionsData = response.routes[0].legs[0]; // Get data about the mapped route
            if (!directionsData) {
              enqueueSnackbar('ERROR', {
                variant: 'error',
              });
              setblockDelivery(true);

              return;
            }
            else {

              const distance = Math.ceil((directionsData.distance.value / 1000));

              if (
                restaurant.livraison?.MATRIX &&
                (restaurant.livraison?.MATRIX as any[])[0] <= distance) {

                enqueueSnackbar(`vous êtes à ${distance} Km du restaurant, il ne peut pas faire de livraison à cette ville distance maximal est ${(restaurant.livraison?.MATRIX as any[])[0]} KM`, {
                  variant: 'error',
                });
                setblockDelivery(true);
                return;

              }

              if (!restaurant.deliveryFixed) {
                setblockDelivery(false);
                setOtherFees(distance * restaurant.priceByMiles * 100)
                setDeliveryPrice(distance * restaurant.priceByMiles * 100);
              }

            }
          }

        })

    }

  }

  const theme = useTheme();

  return (
    <>
      <DialogAlert
        openDialog={openDialog}
        setOpen={setopenDialog}
        message="Le restaurant ne peut pas faire de livraison à cette endroit"
      />
      <Navbar alwaysVisible />
      <Container maxWidth="xl" className={classes.root}>
        <Grid
          container
          justify="space-between"
          direction={smDown ? 'column-reverse' : 'row'}
        >
          <Grid item xs={12} md={5}>
            <Stepper
              nonLinear
              activeStep={activeStep}
              orientation="vertical"
              className={classes.stepper}
            >
              <Step>
                <StepButton
                  className="translate"
                  onClick={() => setActiveStep(0)}
                >
                  Type de commande
                </StepButton>
                <StepContent>
                  <div>
                    {restaurant && restaurant.delivery && (
                      <Chip
                        className={clsx(classes.chips, {
                          active: commandType === 'delivery',
                        })}
                        avatar={<LocalShippingIcon color="inherit" />}
                        label={<span className="translate">Livraison</span>}
                        onClick={() => {
                          if (!authenticated) {
                            return enqueueSnackbar(
                              'Vous devez vous connecter pour pouvoir commander une livraison...',
                              { variant: 'info' }
                            );
                          }

                          if (priceType === 'priceless' || menus.filter(({ item: { type } }) => type === 'priceless').length) {
                            return enqueueSnackbar(
                              'Le menu est sans prix, donc pas de livraison',
                              { variant: 'info' }
                            );
                          }
                          setCommandType('delivery');
                        }}
                      />
                    )}
                    {restaurant && restaurant.surPlace && (
                      <Chip
                        className={clsx(classes.chips, {
                          active: commandType === 'on_site',
                        })}
                        avatar={<LocationOnIcon color="inherit" />}
                        label={<span className="translate">Sur place</span>}
                        onClick={() => setCommandType('on_site')}
                      />
                    )}
                    {restaurant && restaurant.aEmporter && (
                      <Chip
                        className={clsx(classes.chips, {
                          active: commandType === 'takeaway',
                        })}
                        avatar={<DirectionsRun color="inherit" />}
                        label={<span className="translate">À emporter</span>}
                        onClick={() => {

                          if (priceType === 'priceless' || menus.filter(({ item: { type } }) => type === 'priceless').length) {
                            return enqueueSnackbar(
                              'Le menu est sans prix, donc pas de livraison',
                              { variant: 'info' }
                            );
                          }

                          setCommandType('takeaway')
                        }}
                      />
                    )}
                  </div>

                  <Box height={12} />

                  {(commandType === 'delivery') && (priceType) && (
                    <>
                      {
                        restaurant && ((+restaurant.minPriceIsDelivery) >= (estimateTotalPrice(cart) / 100))
                          ? (
                            <>
                              <Alert severity="error">
                                <b>{restaurant.minPriceIsDelivery} € </b> minimun pour la livraison.
                              </Alert>
                            </>
                          ) : (
                            <>
                              <Typography className="translate" gutterBottom>
                                Option de livraison
                              </Typography>

                              <div>
                                <Chip
                                  className={clsx(classes.chips, {
                                    active: deliveryOption === 'behind_the_door',
                                  })}
                                  avatar={<HomeIcon color="inherit" />}
                                  label={
                                    <span className="translate">Derrière la porte</span>
                                  }
                                  onClick={() => setDeliveryOption('behind_the_door')}
                                />
                                <Chip
                                  className={clsx(classes.chips, {
                                    active: deliveryOption === 'on_the_door',
                                  })}
                                  avatar={<MeetingRoomIcon color="inherit" />}
                                  label={
                                    <span className="translate">Devant la porte</span>
                                  }
                                  onClick={() => setDeliveryOption('on_the_door')}
                                />
                                <Chip
                                  className={clsx(classes.chips, {
                                    active: deliveryOption === 'out',
                                  })}
                                  avatar={<ExitToAppIcon color="inherit" />}
                                  label={
                                    <span className="translate">À l'extérieur</span>
                                  }
                                  onClick={() => setDeliveryOption('out')}
                                />
                              </div>
                            </>
                          )}

                    </>
                  )}

                  {commandType !== 'on_site' &&
                    (restaurant &&
                      (+restaurant.minPriceIsDelivery) < (estimateTotalPrice(cart) / 100))

                    && (
                      <Button
                        variant="contained"
                        color="primary"
                        size="small"
                        onClick={() => setActiveStep(1)}
                        className="translate"
                        style={{ marginLeft: 8, marginTop: 8 }}
                      >
                        Suivant
                      </Button>
                    )}

                </StepContent>
              </Step>
              {commandType !== 'on_site' && (
                <Step>
                  <StepButton
                    className="translate"
                    onClick={() => setActiveStep(1)}
                  >
                    Vos informations
                  </StepButton>
                  <StepContent>
                    <form noValidate>
                      <Grid container spacing={2}>
                        <Grid item xs={12}>
                          <TextField
                            required
                            variant="outlined"
                            fullWidth
                            value={name}
                            onChange={({ target: { value } }) => setName(value)}
                            label={<span className="translate">Votre nom</span>}
                          />
                        </Grid>
                        <Grid item xs={12}>
                          <TextField
                            required
                            variant="outlined"
                            fullWidth
                            value={phoneNumber}
                            onChange={({ target: { value } }) =>
                              setPhoneNumber(value)
                            }
                            label={
                              <span className="translate">
                                Votre numéro de téléphone
                              </span>
                            }
                          />
                        </Grid>
                        <Grid item xs={12}>
                          <TextField
                            required
                            variant="outlined"
                            fullWidth
                            value={email}
                            onChange={({ target: { value } }) =>
                              setEmail(value)
                            }
                            label={
                              <span className="translate">
                                Votre adresse mail
                              </span>
                            }
                          />
                        </Grid>
                        {commandType === 'takeaway' && (
                          <Grid item container xs={12} spacing={2}>
                            <Grid item>
                              <FormControl
                                variant="outlined"
                                className={classes.shippingDate}
                              >
                                <InputLabel id="shipping-day-label">
                                  Date
                                </InputLabel>
                                <Select
                                  labelId="shipping-day-label"
                                  id="shipping-day"
                                  value={shippingDay}
                                  onChange={(e) =>
                                    setShippingDay(Number(e.target.value))
                                  }
                                  label={
                                    <span className="translate">Jour</span>
                                  }
                                >
                                  <MenuItem value="">
                                    <em className="translate">Selectionner la date</em>
                                  </MenuItem>
                                  <MenuItem value="0" className="translate">
                                    Aujourd'hui
                                  </MenuItem>
                                  <MenuItem
                                    value="1"
                                    disabled={
                                      !!restaurant &&
                                      !restaurant.openingTimes.find(
                                        ({ day }) =>
                                          day.toLowerCase() === getWeekday(1)
                                      )
                                    }
                                  >
                                    {moment().add(1, 'day').format('D MMMM')}
                                  </MenuItem>
                                  <MenuItem
                                    value="2"
                                    disabled={
                                      !!restaurant &&
                                      !restaurant.openingTimes.find(
                                        ({ day }) =>
                                          day.toLowerCase() === getWeekday(2)
                                      )
                                    }
                                  >
                                    {moment().add(2, 'day').format('D MMMM')}
                                  </MenuItem>
                                  <MenuItem
                                    value="3"
                                    disabled={
                                      !!restaurant &&
                                      !restaurant.openingTimes.find(
                                        ({ day }) =>
                                          day.toLowerCase() === getWeekday(1)
                                      )
                                    }
                                  >
                                    {moment().add(3, 'day').format('D MMMM')}
                                  </MenuItem>
                                  <MenuItem
                                    value="4"
                                    disabled={
                                      !!restaurant &&
                                      !restaurant.openingTimes.find(
                                        ({ day }) =>
                                          day.toLowerCase() === getWeekday(2)
                                      )
                                    }
                                  >
                                    {moment().add(4, 'day').format('D MMMM')}
                                  </MenuItem>
                                  <MenuItem
                                    value="5"
                                    disabled={
                                      !!restaurant &&
                                      !restaurant.openingTimes.find(
                                        ({ day }) =>
                                          day.toLowerCase() === getWeekday(1)
                                      )
                                    }
                                  >
                                    {moment().add(5, 'day').format('D MMMM')}
                                  </MenuItem>
                                  <MenuItem
                                    value="6"
                                    disabled={
                                      !!restaurant &&
                                      !restaurant.openingTimes.find(
                                        ({ day }) =>
                                          day.toLowerCase() === getWeekday(2)
                                      )
                                    }
                                  >
                                    {moment().add(6, 'day').format('D MMMM')}
                                  </MenuItem>
                                </Select>
                              </FormControl>
                            </Grid>
                            <Grid item>
                              <FormControl
                                variant="outlined"
                                style={{ width: 100 }}
                              >
                                <InputLabel className="translate" id="shipping-hour-label">
                                  Heure
                                </InputLabel>
                                <Select
                                  labelId="shipping-hour-label"
                                  id="shipping-hour"
                                  label={
                                    <span className="translate">Heure</span>
                                  }
                                  value={shippingHour}
                                  onChange={(e) =>
                                    setShippingHour(Number(e.target.value))
                                  }
                                >
                                  <MenuItem value="">
                                    <em className="translate">Heure</em>
                                  </MenuItem>
                                  {hourOptions.map((hour) => (
                                    <MenuItem value={hour}>{hour}</MenuItem>
                                  ))}
                                </Select>
                              </FormControl>
                            </Grid>
                            <Grid item>
                              <FormControl
                                variant="outlined"
                                style={{ width: 100 }}
                              >
                                <InputLabel className='translate' id="shipping-hour-label">
                                  Minute
                                </InputLabel>
                                <Select
                                  labelId="shipping-hour-label"
                                  id="shipping-hour"
                                  label={
                                    <span className="translate">Minute</span>
                                  }
                                  value={shippingMinute}
                                  onChange={(e) =>
                                    setShippingMinute(Number(e.target.value))
                                  }
                                >
                                  <MenuItem value="">
                                    <em className='translate'>Minute</em>
                                  </MenuItem>
                                  {minutesOptions.map((minute) => (
                                    <MenuItem value={minute}>{minute}</MenuItem>
                                  ))}
                                </Select>
                              </FormControl>
                            </Grid>
                          </Grid>
                        )}
                        {commandType === 'delivery' && (
                          <>
                            <Grid item xs={12}>
                              <Grid container={true}>
                                <Grid item>

                                  <PlacesAutocomplete
                                    value={shippingAddress}
                                    onChange={(address) => setShippingAddress(address)}
                                  >
                                    {({ getInputProps, suggestions, loading }) => (
                                      <Autocomplete
                                        noOptionsText="Aucune adresse trouvée"
                                        options={suggestions.map((v) => v)}
                                        loading={loading}
                                        getOptionLabel={(option: any) => option.description}
                                        onChange={(_: any, value: any) => value && handleSelectShippingAddress?.(value)}
                                        inputValue={shippingAddress}
                                        onInputChange={(_, value) =>
                                          getInputProps().onChange({ target: { value } })
                                        }
                                        renderInput={(params) => (
                                          <TextField
                                            {...params}
                                            fullWidth
                                            variant="outlined"
                                            name="address"
                                            label={
                                              <span className="translate">Adresse</span>
                                            }
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

                                <Grid item>
                                  <Tooltip title="Utiliser votre position actuelle">
                                    <IconButton
                                      onClick={() => {
                                        getGeoLocation()
                                          .then((position) => {
                                            console.log("position", position);
                                            // setValues((values) => {
                                            //   values.longitude = `${position.coords.longitude}`;
                                            //   values.latitude = `${position.coords.latitude}`;
                                            //   return { ...values };
                                            // });
                                          })
                                          .catch(() => {
                                            enqueueSnackbar('Erreur lors la localisation', {
                                              variant: 'error',
                                            });
                                          });
                                      }}
                                    >
                                      <LocationOnIcon />
                                    </IconButton>
                                  </Tooltip>
                                </Grid>
                              </Grid>
                            </Grid>
                            <Grid item xs={12}>
                              <TextField
                                fullWidth
                                id="shipping-address"
                                label={
                                  <span className="translate">Appartement</span>
                                }
                                value={appartment}
                                variant="outlined"
                                onChange={({ target: { value } }) =>
                                  setAppartment(value)
                                }
                              />
                            </Grid>
                            <Grid item xs={12}>
                              <TextField
                                fullWidth
                                id="shipping-appartement"
                                label={<span className="translate">N° Appartement</span>}
                                value={shippingAppartementNumero}
                                variant="outlined"
                                onChange={({ target: { value } }) => {
                                  setShippingAppartementNumero(value)
                                }}
                              />
                            </Grid>
                            <Grid item xs={12}>
                              <TextField
                                fullWidth
                                id="floor"
                                label={<span className="translate">Étage</span>}
                                type="number"
                                value={floor}
                                variant="outlined"
                                onChange={({ target: { value } }) =>
                                  setFloor(value)
                                }
                              />
                            </Grid>
                            <Grid item xs={12}>
                              <FormControlLabel
                                control={
                                  <Checkbox
                                    checked={shipAsSoonAsPossible}
                                    onChange={(_, value) =>
                                      setShipAsSoonAsPossible(value)
                                    }
                                    name="shipAsSooonAsPossible"
                                  />
                                }
                                label={
                                  <span className="translate">
                                    Livré le plus tôt possible
                                  </span>
                                }
                              />
                            </Grid>
                          </>
                        )}
                        {/* {!shipAsSoonAsPossible && (
                          <Grid item xs={12}>
                            <MuiPickersUtilsProvider
                              utils={DateFnsUtils}
                              locale={localeMap[lang]}
                            >
                              <KeyboardDateTimePicker
                                fullWidth
                                format="d MMM yyyy HH:mm"
                                id="shipping-time"
                                ampm={false}
                                label={
                                  <span className="translate">
                                    Moment de livraison
                                  </span>
                                }
                                minDate={new Date()}
                                maxDate={moment().add(3, 'days').toDate()}
                                minDateMessage={
                                  <span className="translate">
                                    La date doit être ultérieure à la date
                                    courante
                                  </span>
                                }
                                maxDateMessage={
                                  <span className="translate">
                                    La date ne devrait pas se situer après 3
                                    jours
                                  </span>
                                }
                                value={shippingTime}
                                onChange={(date: Date | null) =>
                                  date && setShippingTime(date)
                                }
                              />
                            </MuiPickersUtilsProvider>
                          </Grid>
                        )} */}
                        {!shipAsSoonAsPossible && (
                          <Grid item container xs={12} spacing={2}>
                            <Grid item>
                              <FormControl
                                variant="outlined"
                                className={classes.shippingDate}
                              >
                                <InputLabel id="shipping-day-label">
                                  Date
                                </InputLabel>
                                <Select
                                  labelId="shipping-day-label"
                                  id="shipping-day"
                                  value={shippingDay}
                                  onChange={(e) =>
                                    setShippingDay(Number(e.target.value))
                                  }
                                  label={
                                    <span className="translate">Jour</span>
                                  }
                                >
                                  <MenuItem value="">
                                    <em>Sélectionner la date</em>
                                  </MenuItem>
                                  <MenuItem value="0" className="translate">
                                    Ajourd'hui
                                  </MenuItem>
                                  <MenuItem
                                    value="1"
                                    disabled={
                                      !!restaurant &&
                                      !restaurant.openingTimes.find(
                                        ({ day }) =>
                                          day.toLowerCase() === getWeekday(1)
                                      )
                                    }
                                  >
                                    {moment().add(1, 'day').format('D MMMM')}
                                  </MenuItem>
                                  <MenuItem
                                    value="2"
                                    disabled={
                                      !!restaurant &&
                                      !restaurant.openingTimes.find(
                                        ({ day }) =>
                                          day.toLowerCase() === getWeekday(2)
                                      )
                                    }
                                  >
                                    {moment().add(2, 'day').format('D MMMM')}
                                  </MenuItem>
                                  <MenuItem
                                    value="3"
                                    disabled={
                                      !!restaurant &&
                                      !restaurant.openingTimes.find(
                                        ({ day }) =>
                                          day.toLowerCase() === getWeekday(1)
                                      )
                                    }
                                  >
                                    {moment().add(3, 'day').format('D MMMM')}
                                  </MenuItem>
                                  <MenuItem
                                    value="4"
                                    disabled={
                                      !!restaurant &&
                                      !restaurant.openingTimes.find(
                                        ({ day }) =>
                                          day.toLowerCase() === getWeekday(2)
                                      )
                                    }
                                  >
                                    {moment().add(4, 'day').format('D MMMM')}
                                  </MenuItem>
                                  <MenuItem
                                    value="5"
                                    disabled={
                                      !!restaurant &&
                                      !restaurant.openingTimes.find(
                                        ({ day }) =>
                                          day.toLowerCase() === getWeekday(1)
                                      )
                                    }
                                  >
                                    {moment().add(5, 'day').format('D MMMM')}
                                  </MenuItem>
                                  <MenuItem
                                    value="6"
                                    disabled={
                                      !!restaurant &&
                                      !restaurant.openingTimes.find(
                                        ({ day }) =>
                                          day.toLowerCase() === getWeekday(2)
                                      )
                                    }
                                  >
                                    {moment().add(6, 'day').format('D MMMM')}
                                  </MenuItem>
                                </Select>
                              </FormControl>
                            </Grid>
                            <Grid item>
                              <FormControl
                                variant="outlined"
                                style={{ width: 100 }}
                              >
                                <InputLabel id="shipping-hour-label">
                                  Heure
                                </InputLabel>
                                <Select
                                  labelId="shipping-hour-label"
                                  id="shipping-hour"
                                  label={
                                    <span className="translate">Heure</span>
                                  }
                                  value={shippingHour}
                                  onChange={(e) =>
                                    setShippingHour(Number(e.target.value))
                                  }
                                >
                                  <MenuItem value="">
                                    <em>Heure</em>
                                  </MenuItem>
                                  {hourOptions.map((hour) => (
                                    <MenuItem value={hour}>{hour}</MenuItem>
                                  ))}
                                </Select>
                              </FormControl>
                            </Grid>
                            <Grid item>
                              <FormControl
                                variant="outlined"
                                style={{ width: 100 }}
                              >
                                <InputLabel id="shipping-hour-label">
                                  Minute
                                </InputLabel>
                                <Select
                                  labelId="shipping-hour-label"
                                  id="shipping-hour"
                                  label={
                                    <span className="translate">Minute</span>
                                  }
                                  value={shippingMinute}
                                  onChange={(e) =>
                                    setShippingMinute(Number(e.target.value))
                                  }
                                >
                                  <MenuItem value="">
                                    <em>Minute</em>
                                  </MenuItem>
                                  {minutesOptions.map((minute) => (
                                    <MenuItem value={minute}>{minute}</MenuItem>
                                  ))}
                                </Select>
                              </FormControl>
                            </Grid>
                          </Grid>
                        )}
                      </Grid>
                    </form>
                  </StepContent>
                </Step>
              )}
            </Stepper>
            {!blockDelivery && (
              <>
                {
                  (restaurant && restaurant.aEmporter) ||
                  (restaurant && (restaurant.delivery) ||
                    (restaurant && restaurant.surPlace)
                  ) && smDown && (
                    <Button
                      variant="contained"
                      size="large"
                      className="translate"
                      color="primary"
                      fullWidth
                      style={{ marginTop: 8, marginBottom: 16 }}
                      onClick={checkout}
                    >
                      {inProgress ? (
                        <CircularProgress size={24} color="inherit" />
                      ) : (
                        'Passer ma commande'
                      )}
                    </Button>
                  )}
              </>
            )}

          </Grid>
          <Grid item xs={12} md={6} lg={5}>
            {restaurant && (
              <>
                <Grid container alignItems="center">
                  <Grid item className={classes.icon}>
                    <ShoppingBasketIcon />
                  </Grid>
                  <Grid item xs>
                    <Typography variant="body1" className={clsx('notranslate')}>
                      <span className="translate">Provient de</span>{' '}
                      <Link to={`/restaurants/${restaurant._id}`}>
                        {restaurant.name}
                      </Link>
                    </Typography>
                  </Grid>
                </Grid>
                <Divider className={classes.divider} />
              </>
            )}
            {!!totalCount && !!foods.length && (
              <div className={classes.itemContainer}>
                <Grid container spacing={1} alignItems="center">
                  <Grid item>
                    <Typography variant="h6" gutterBottom className="translate">
                      Les plats
                    </Typography>
                  </Grid>
                  <Grid item>

                  </Grid>
                </Grid>

                {foods.map((food) => {
                  const {
                    id,
                    item: {
                      imageURL,
                      name,
                      price: { amount: price },
                    },
                    options,
                    quantity,
                  } = food;
                  let quantity_food = quantity;

                  {/**
----------------------------------------------------------------------------------------------------------------
*/}
                  return (
                    <Button fullWidth key={id} style={{ display: 'block' }}>

                      <IconButton onClick={() => {
                        removeFood(id)
                        if (foods.length === 1) {
                          restaurant && history.push(`/restaurants/${restaurant._id}`);
                        }
                      }
                      }  >
                        <DeleteIcon />
                      </IconButton>
                      <Grid container spacing={1} alignItems="center">
                        <Grid item>
                          <Box width={50} textAlign="center" alignSelf="center">
                            <span>
                              {quantity} X
                            </span>
                          </Box>
                        </Grid>
                        <Grid item>
                          <Avatar src={imageURL} alt={name} />
                        </Grid>
                        <Grid item xs>
                          <Typography
                            variant="h6"
                            className={clsx(classes.itemName, 'translate')}
                            align="left"
                          >
                            {name}
                            {price && priceType !== 'priceless' && price !== 0 && (
                              <Typography
                                align="left"
                                className={clsx(classes.itemPrice)}
                              >
                                {`€${(price / 100).toLocaleString(undefined, {
                                  minimumFractionDigits: 1,
                                })}`}
                              </Typography>
                            )}
                          </Typography>

                        </Grid>
                        <Grid item>
                          {price && priceType !== 'priceless' && price !== 0 && (
                            <Typography
                              align="left"
                              className={clsx(classes.itemPrice)}
                            >
                              {`€${((price * quantity) / 100).toLocaleString(undefined, {
                                minimumFractionDigits: 1,
                              })}`}
                            </Typography>
                          )}

                        </Grid>
                      </Grid>

                      {!!options.length &&
                        options.every(({ items }) => !!items.length) && (
                          <>
                            <Divider className={classes.divider} />

                            <Grid
                              item
                              container
                              style={{
                                marginTop: theme.spacing(1),
                                paddingLeft: theme.spacing(14),
                              }}
                              direction="column"
                            >
                              {options.map(
                                ({ items, title }) =>
                                  !!items.length && (
                                    <Grid item container>
                                      <Typography
                                        style={{
                                          fontWeight: 'bold',
                                          textDecoration: 'underline',
                                        }}
                                      >
                                        {title}
                                      </Typography>
                                      <Grid
                                        container
                                        alignItems="center"
                                        justify="space-between"
                                      >
                                        <Grid
                                          item
                                          container
                                          xs
                                          direction="column"
                                        >

                                          {items.map(({ item, quantity }) => (
                                            <Grid
                                              item
                                              xs
                                              container
                                              style={{
                                                paddingLeft: theme.spacing(4),
                                              }}
                                            >
                                              <Grid
                                                item
                                                style={{
                                                  fontWeight: 'bold',
                                                  textDecoration: 'none',
                                                }}
                                              >
                                                <span>
                                                  {quantity} X
                                                </span>
                                              </Grid>

                                              {
                                                (item.price.amount !== 0) && (
                                                  <Grid
                                                    item
                                                    style={{
                                                      marginLeft: theme.spacing(2),
                                                    }}
                                                  >

                                                    <Typography
                                                      className={clsx(classes.itemPrice)}
                                                      align="left"
                                                    >
                                                      {item.name}<br />
                                                      {`€${(item.price.amount / 100).toLocaleString(undefined, {
                                                        minimumFractionDigits: 1,
                                                      })}`}
                                                    </Typography>
                                                  </Grid>
                                                )
                                              }

                                            </Grid>
                                          ))}
                                        </Grid>

                                        {priceType !== 'priceless' &&
                                          (items.reduce((p, c) => p + c.quantity * (c.item.price?.amount || 0), 0) / 100) !== 0 && (<Grid item>
                                            {!!(
                                              items.reduce(
                                                (p, c) =>
                                                  p +
                                                  c.quantity *
                                                  quantity_food *
                                                  (c.item.price?.amount || 0),
                                                0
                                              ) / 100
                                            ) && (
                                                <>
                                                  <Typography
                                                    className={classes.itemPrice}
                                                  >{`€${(
                                                    items.reduce(
                                                      (p, c) =>
                                                        p +
                                                        c.quantity *
                                                        quantity_food *
                                                        (c.item.price?.amount || 0),
                                                      0
                                                    ) / 100
                                                  ).toLocaleString(undefined, {
                                                    minimumFractionDigits: 1,
                                                  })}`}</Typography>
                                                </>
                                              )}
                                          </Grid>)
                                        }
                                      </Grid>
                                    </Grid>
                                  )
                              )}
                            </Grid>
                          </>
                        )}

                      <Divider className={classes.divider} />

                    </Button>
                  );

                  {/**
----------------------------------------------------------------------------------------------------------------
*/}
                })}
              </div>
            )}

            {!!totalCount && !!menus.length && (
              <div className={classes.itemContainer}>
                <Typography variant="h6" gutterBottom className="translate">
                  Les menus
                </Typography>
                {menus.map((menu) => {
                  const {
                    id,
                    item: { name },
                    foods,
                    quantity,
                  } = menu;

                  return (
                    <React.Fragment key={id}>
                      <Button fullWidth>
                        <Grid container spacing={1} alignItems="center">
                          <Grid item>
                            <Box
                              width={50}
                              textAlign="center"
                              alignSelf="center"
                            >
                              {quantity} X
                            </Box>
                          </Grid>
                          <Grid item xs>
                            <Typography
                              variant="h6"
                              className={clsx(classes.itemName, 'translate')}
                              align="left"
                            >
                              {name}
                            </Typography>
                            {estimateMenuPrice(menu, menu.item.type === 'fixed_price' ? true : false) !== 0 && <Typography
                              align="left"
                              className={clsx(classes.itemPrice)}
                            >
                              <span>Total: </span>
                              <span>{`€${(
                                estimateMenuPrice(menu, menu.item.type === 'fixed_price' ? true : false) / 100
                              ).toLocaleString(undefined, {
                                minimumFractionDigits: 1,
                              })}`}</span>
                            </Typography>}
                          </Grid>
                          <Grid item>
                            <IconButton onClick={() => {
                              removeMenu(id)
                              if (menus.length === 1) {
                                restaurant && history.push(`/restaurants/${restaurant._id}`);
                              }
                            }}>
                              <DeleteIcon />
                            </IconButton>
                          </Grid>
                        </Grid>
                      </Button>

                      <Divider />

                      <div style={{ marginLeft: theme.spacing(4) }}>
                        {foods.map(
                          ({
                            options,
                            food: {
                              _id,
                              imageURL,
                              name,
                              price: { amount: price },
                            },
                          }) => (
                            <React.Fragment key={_id}>
                              <ListItem style={{ paddingRight: 0 }}>
                                <ListItemAvatar>
                                  <Avatar src={imageURL} alt={name} />
                                </ListItemAvatar>
                                <ListItemText
                                  style={{ marginLeft: theme.spacing(2) }}
                                >
                                  <Grid container justify="space-between">
                                    <Grid item>
                                      <Typography>{name}</Typography>
                                    </Grid>
                                    {(priceType && (price && +price !== 0)) && (
                                      <Grid item>
                                        <Typography>{`€ ${(price / 100)}`}</Typography>
                                      </Grid>
                                    )}
                                  </Grid>
                                </ListItemText>
                              </ListItem>

                              <Grid
                                item
                                container
                                style={{ paddingLeft: theme.spacing(6) }}
                                direction="column"
                              >
                                {options.map(
                                  ({ items, title }) =>
                                    !!items.length && (
                                      <Grid item container>
                                        <Typography
                                          style={{
                                            fontWeight: 'bold',
                                            textDecoration: 'underline',
                                          }}
                                        >
                                          {title}
                                        </Typography>
                                        <Grid
                                          container
                                          alignItems="center"
                                          justify="space-between"
                                        >
                                          <Grid
                                            item
                                            container
                                            xs
                                            direction="column"
                                          >
                                            {items.map(({ item, quantity }) => (
                                              <Grid
                                                item
                                                xs
                                                container
                                                style={{
                                                  paddingLeft: theme.spacing(4),
                                                }}
                                              >
                                                <Grid
                                                  item
                                                  style={{
                                                    fontWeight: 'bold',
                                                  }}
                                                >
                                                  {quantity} X
                                                </Grid>
                                                <Grid
                                                  item
                                                  style={{
                                                    marginLeft: theme.spacing(
                                                      2
                                                    ),
                                                  }}
                                                >
                                                  {item.name}
                                                </Grid>
                                              </Grid>
                                            ))}
                                          </Grid>
                                          {(priceType !== 'priceless'
                                            && (items.reduce((p, c) => p + c.quantity * (c.item.price?.amount || 0), 0) / 100) !== 0) &&
                                            (<Grid item>
                                              {!!(
                                                items.reduce(
                                                  (p, c) =>
                                                    p +
                                                    c.quantity *
                                                    (c.item.price?.amount || 0),
                                                  0
                                                ) / 100
                                              ) && (
                                                  <Typography
                                                    className={classes.itemPrice}
                                                  >{`€${(
                                                    items.reduce(
                                                      (p, c) =>
                                                        p +
                                                        c.quantity *
                                                        (c.item.price?.amount ||
                                                          0),
                                                      0
                                                    ) / 100
                                                  ).toLocaleString(undefined, {
                                                    minimumFractionDigits: 1,
                                                  })}`}</Typography>
                                                )}
                                            </Grid>)
                                          }
                                        </Grid>
                                      </Grid>
                                    )
                                )}
                              </Grid>
                            </React.Fragment>
                          )
                        )}
                      </div>
                    </React.Fragment>
                  );
                })}
              </div>
            )}

            <Divider className={classes.divider} />

            {commandType === 'delivery' && estimateTotalPrice(cart) !== 0 && (
              <>
                <Grid
                  container
                  justify="space-between"
                  alignItems="center"
                  style={{ padding: '8px 0' }}
                >
                  <Typography className="translate">
                    {'Sous-total '}
                    <span>&bull;</span>{' '}
                    {`${totalCount} type${totalCount > 1 ? 's' : ''
                      } de produits`}
                  </Typography>
                  <Typography className="notranslate">
                    {`€${(
                      estimateTotalPrice(cart) / 100
                    ).toLocaleString(undefined, {
                      minimumFractionDigits: 1,
                    })}`}
                  </Typography>
                </Grid>
                <Grid
                  container
                  justify="space-between"
                  alignItems="center"
                  style={{ padding: '8px 0' }}
                >
                  <Typography className="translate">
                    Frais de livraison
                  </Typography>
                  <Typography className="notranslate">{`€${(
                    deliveryPriceAmount / 100
                  ).toLocaleString(undefined, {
                    minimumFractionDigits: 1,
                  })}`}</Typography>
                </Grid>
              </>
            )}

            {priceType !== 'priceless' && estimateTotalPrice(cart) !== 0 && <Grid
              container
              justify="space-between"
              alignItems="center"
              style={{ padding: '8px 0' }}
            >
              <Typography
                variant="h6"
                component="p"
                className="translate"
                style={{ fontWeight: 700 }}
              >
                Total à payer
              </Typography>
              <Typography
                className="notranslate"
                style={{ fontWeight: 700 }}
              >{`€${(
                (estimateTotalPrice(cart) + (otherFees)) /
                100
              ).toLocaleString(undefined, {
                minimumFractionDigits: 1,
              })}`}</Typography>
            </Grid>}

            <Divider className={classes.divider} />

            <Paper
              elevation={3}
              style={{ padding: 16, marginTop: 16, marginBottom: 6 }}
            >
              <TextField
                fullWidth
                value={comment}
                onChange={({ target: { value } }) => setComment(value)}
                label={<span className="translate">Votre commentaire</span>}
                multiline
                rows={6}
                InputProps={{ disableUnderline: true }}
              />
            </Paper>
            {!blockDelivery && (
              <>
                {
                  (
                    (restaurant && restaurant.aEmporter) ||
                    (restaurant && restaurant.delivery) ||
                    (restaurant && restaurant.surPlace)
                  ) && !smDown && (
                    <Button
                      variant="contained"
                      size="large"
                      className="translate"
                      color="primary"
                      fullWidth
                      style={{ marginTop: 8, marginBottom: 16 }}
                      onClick={checkout}
                    >
                      {inProgress ? (
                        <CircularProgress size={24} color="inherit" />
                      ) : (
                        'Passer ma commande'
                      )}
                    </Button>
                  )}
              </>)}

            {smDown && <Divider className={classes.divider} />}
          </Grid>
        </Grid>
      </Container>

      <Footer mini />

      <Dialog
        open={openConfirmation}
        TransitionComponent={SlideTransition}
        keepMounted
        onClose={() => {
          if (inProgress) setInProgress(false);
          if (sendingConfirmationCode) setSendingConfirmationCode(false);
          setOpenConfirmation(false);
        }}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle className="translate" disableTypography>
          <Typography
            variant="h5"
            component="h3"
            style={{ display: 'flex', justifyContent: 'space-between' }}
          >
            <span className="translate">Confirmation</span>
            <IconButton size="small" onClick={() => setOpenConfirmation(false)}>
              <CloseIcon />
            </IconButton>
          </Typography>
        </DialogTitle>
        <DialogContent>
          <Typography className="translate" align="center" gutterBottom>
            Veuillez entrer le code à 4 chiffres envoyé à votre mobile
          </Typography>
          <TextField
            fullWidth
            value={confirmationCode}
            onChange={({ target: { value } }) => setConfirmationCode(value)}
            variant="outlined"
            label={<span className="translate">Code de confirmation</span>}
            placeholder="1234"
          />
        </DialogContent>
        <DialogActions>
          <Button
            autoFocus
            onClick={() => {
              setInProgress(false);
              setOpenConfirmation(false);
            }}
          >
            Annuler
          </Button>
          <Button color="primary" onClick={validateCode}>
            {!sendingConfirmationCode ? (
              'Valider'
            ) : (
              <CircularProgress size={24} color="inherit" />
            )}
          </Button>
        </DialogActions>
      </Dialog>

      <div style={{ display: 'none' }}>

      </div>
      <Dialog
        open={openPayementType}
        TransitionComponent={SlideTransition}
        keepMounted
        onClose={() => {
          if (inProgress) setInProgress(false);
          if (sendingConfirmationCode) setSendingConfirmationCode(false);
          setOpenConfirmation(false);
        }}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle className="translate" disableTypography>
          <Typography
            variant="h5"
            component="h3"
            style={{ display: 'flex', justifyContent: 'space-between' }}
          >
            <span className="translate">Payement</span>
            <IconButton size="small" onClick={() => setOpentPayementType(false)}>
              <CloseIcon />
            </IconButton>
          </Typography>
        </DialogTitle>
        <DialogContent>
          <Typography className="translate" align="center" gutterBottom>
            Veuillez choisir votre moyen de payement
          </Typography>
        </DialogContent>
        <div style={{ display: 'none' }}>
          <StripeCheckout
            stripeKey={process.env.REACT_APP_STRIPE_PRIVATE_KEY || ''}
            token={handleToken}
            amount={totalPrice * 100 + otherFees * 100}
            currency="EUR"
            name="Menu Advisor"
            ref={stripeCheckoutRef}
          />
        </div>
        {restaurant?.paiementCB && restaurant.paiementLivraison && (
          <DialogActions>
            <StripeCheckout
              stripeKey={restaurant.cbDirectToAdvisor ? (process.env.REACT_APP_STRIPE_PRIVATE_KEY || '') : (restaurant.customerStripeKey || '')}
              token={handleToken}
              amount={totalPrice * 100 + otherFees * 100}
              currency="EUR"
              name="Menu Advisor"
              ref={stripeCheckoutRef}
            />
            <Button color="primary" className='translate' onClick={payAfter}>
              apres la livraison
            </Button>
          </DialogActions>
        )}
      </Dialog>
    </>
  );
};

const mapStateToProps: MapStateToProps<
  CheckoutStateProps,
  CheckoutOwnProps,
  RootState
> = ({ auth: { authenticated, user }, cart, setting: { lang } }) => ({
  authenticated,
  cart,
  user,
  lang,
});

const mapDispatchToProps: (
  dispatch: ThunkDispatch<RootState, undefined, CartActionTypes>,
  ownProps: CheckoutOwnProps
) => CheckoutDispatchProps = (dispatch) => ({
  resetCart: () => dispatch(resetCart()),
  removeFood: (id) => dispatch(removeFoodFromCart(id)),
  removeMenu: (id) => dispatch(removeMenuFromCart(id)),
});

const ConnectedCheckout = connect<
  CheckoutStateProps,
  CheckoutDispatchProps,
  CheckoutOwnProps,
  RootState
>(
  mapStateToProps,
  mapDispatchToProps
)(Checkout);

export default ConnectedCheckout;
