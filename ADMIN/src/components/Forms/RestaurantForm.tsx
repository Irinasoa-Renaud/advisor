import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  Button,
  capitalize,
  CircularProgress,
  Collapse,
  Divider,
  FormControlLabel,
  Grid,
  IconButton,
  InputAdornment,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  makeStyles,
  TextField,
  Tooltip,
  Typography,
  useTheme,
} from '@material-ui/core';
import { Autocomplete } from '@material-ui/lab';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import useForm, { FormError, FormValidationHandler } from '../../hooks/useForm';
import Category from '../../models/Category.model';
// import FoodType from '../../models/FoodType.model';
import { getCategories } from '../../services/categories';
// import { getFoodTypes } from '../../services/foodTypes';
import IOSSwitch from '../Common/IOSSwitch';
import { DropzoneArea } from 'material-ui-dropzone';
import {
  ExpandMore as ExpandMoreIcon,
  LocationOn as LocationOnIcon,
} from '@material-ui/icons';
import EmailIcon from '@material-ui/icons/Email';
import { KeyboardTimePicker } from '@material-ui/pickers';
import AddCircleIcon from '@material-ui/icons/AddCircle';
import moment from 'moment';
import Chip from '@material-ui/core/Chip';
import 'moment/locale/fr';
import FormValidation from '../../utils/FormValidation';
import User from '../../models/User.model';
import { getUsers, getUsersById } from '../../services/user';
import { getGeoLocation } from '../../utils/location';
import { useSnackbar } from 'notistack';
import { daysOfWeek } from '../../constants/days';
import AddressInput from '../Common/AddressInput';
import { geocodeByAddress, getLatLng, geocodeByPlaceId } from 'react-places-autocomplete';
import { useAuth } from '../../providers/authentication';

moment.locale('fr');

const listParametreLivraison: any[] = [
  {
    key: 'freeCP',
    type: 'number',
    titre: 'Les code postal gratuit',
    placeholder: 'code Postal gratuit'
  },
  {
    key: 'freeCity',
    type: 'text',
    titre: 'Les villes gratuit',
    placeholder: 'Ville gratuit'
  },
  {
    key: 'MATRIX',
    type: 'number',
    titre: 'Distance maximum de livraison',
    placeholder: 'Distance maximum'
  },
]

type OpeningTime = {
  activated: boolean;
  openings: {
    begin: {
      hour: string;
      minute: string;
    };
    end: {
      hour: string;
      minute: string;
    };
  }[];
};

export type RestaurantFormType = {
  _id?: string;
  name: string;
  minPriceIsDelivery?: string,
  address: string;
  phoneNumber: string;
  fixedLinePhoneNumber: string;
  categories: string[];
  city: string;
  postalCode: string;
  description: string;
  foodTypes: string[];
  delivery: boolean;
  deliveryFixed: boolean;
  surPlace: boolean;
  aEmporter: boolean;
  referencement: boolean;
  status: boolean;
  paiementLivraison: boolean;
  deliveryPrice: string;
  longitude: string;
  latitude: string;
  openingTimes: Map<string, OpeningTime>;
  admin: string;
  priority?: number;
  image?: File;
  imageURL?: any;
  customerStripeKey: string;
  customerSectretStripeKey: string;
  paiementCB: boolean;
  cbDirectToAdvisor: boolean;
  isMenuActive: boolean;
  isBoissonActive: boolean;
  discount: string;
  livraison: any;
  priceByMiles: any;
  couvertureWeb?: File;
  couvertureMobile?: File;
  logo?: File;
};

interface RestaurantFormProps {
  modification?: boolean;
  initialValues?: RestaurantFormType;
  saving?: boolean;
  onSave?: (data: RestaurantFormType) => void;
  onCancel?: () => void;
}

const useStyles = makeStyles(() => ({
  dropzone: {
    height: '100%',
    margin: '1vh'
  },
  marginTop: {
    marginTop: '20px'
  },
  padding: {
    padding: '0 5vh'
  },
  paddingStripe: {
    padding: '2vh 5vh',
    backgroundColor: '#DCDCDC',
    margin: '1vh',
    borderRadius: '2vh'
  },
  input: {
    width: '100%',
    border: '1px solid #CDCDCD',
    borderRadius: '0.5vh'
  },
  inputForm: {
    height: '5vh',
    margin: '1vh',
    border: 'none'
  }
}));

const RestaurantForm: React.FC<RestaurantFormProps> = ({
  initialValues = {
    deliveryFixed: false,
    priceByMiles: '0',
    name: '',
    address: '',
    phoneNumber: '',
    fixedLinePhoneNumber: '',
    categories: [],
    city: '',
    postalCode: '',
    description: '',
    foodTypes: [],
    delivery: false,
    surPlace: true,
    aEmporter: true,
    referencement: true,
    status: true,
    minPriceIsDelivery: '',
    paiementLivraison: true,
    deliveryPrice: '0',
    longitude: '',
    latitude: '',
    admin: '',
    customerStripeKey: '',
    customerSectretStripeKey: '',
    paiementCB: false,
    cbDirectToAdvisor: true,
    isMenuActive: true,
    isBoissonActive: true,
    livraison: {},
    openingTimes: new Map(
      daysOfWeek.map((day) => [
        day,
        {
          activated: true,
          openings: [
            {
              begin: { hour: '06', minute: '00' },
              end: { hour: '12', minute: '00' },
            },
            {
              begin: { hour: '13', minute: '00' },
              end: { hour: '20', minute: '00' },
            },
          ],
        },
      ]),
    ),
    discount: '0'
  },
  saving,
  modification,
  onSave,
  onCancel,
}) => {
  const { isAdmin, isRestaurantAdmin, user } = useAuth();
  const { enqueueSnackbar } = useSnackbar();

  const validation = useCallback<FormValidationHandler<RestaurantFormType>>(
    (data) => {
      const errors: FormError<RestaurantFormType> = {};

      if (!data.name.length) errors.name = 'Ce champ ne doit pas être vide';
      if (!data.description.length)
        errors.description = 'Ce champ ne doit pas être vide';
      if (!data.address.length)
        errors.address = 'Ce champ ne doit pas être vide';
      if (!data.categories.length)
        errors.categories = 'Vous devez au moins ajouter une catégorie';
      // if (!data.foodTypes.length)
      //   errors.foodTypes = 'Vous devez au moins ajouter un type';
      if (!data.phoneNumber.length)
        errors.phoneNumber = 'Ce champ ne doit pas être vide';
      else if (!FormValidation.isPhoneNumber(data.phoneNumber))
        errors.phoneNumber = 'Téléphone non valide';
      if (!data.city.length) errors.city = 'Ce champ ne doit pas être vide';
      if (!data?.postalCode?.length) errors.postalCode = 'Ce champ ne doit pas être vide';
      if (!data.admin.length) errors.admin = 'Ce champ ne doit pas être vide';
      if (data.delivery && data.paiementCB && !data.cbDirectToAdvisor && !data.customerStripeKey.length) {
        errors.customerStripeKey = 'Ce champ ne doit pas être vide'
        enqueueSnackbar('Clé stripe ne doit pas être vide', {
          variant: 'error',
        });
      }

      if (data.delivery && data.paiementCB && !data.cbDirectToAdvisor && !data.customerSectretStripeKey.length) {
        errors.customerSectretStripeKey = 'Ce champ ne doit pas être vide';
        enqueueSnackbar('Client clé stripe ne doit pas être vide', {
          variant: 'error',
        });
      }

      return errors;
    },
    [enqueueSnackbar],
  );

  const {
    values,
    setValues,
    handleInputBlur,
    handleInputChange,
    handleSwitchChange,
    validate,
    errors,
    setLivraison,
    addnewLivraison
  } = useForm<RestaurantFormType>(
    {
      ...initialValues,
      admin: isRestaurantAdmin && user ? user._id : initialValues.admin,
    },
    false,
    validation,
  );

  const [categoryOptions, setCategoryOptions] = useState<Category[]>([]);
  const [loadingCategories, setLoadingCategories] = useState<boolean>(false);

  // const [typeOptions, setTypeOptions] = useState<FoodType[]>([]);
  // const [loadingTypes, setLoadingTypes] = useState<boolean>(false);

  const [userOptions, setUserOptions] = useState<User[]>([]);
  const [livraisonValue, setLivraisonValue] = useState<any>({});
  const [loadingUsers, setLoadingUsers] = useState<boolean>(false);

  const [openingTimes, setOpeningTimes] = useState<Map<string, OpeningTime>>(
    initialValues.openingTimes,
  );

  const [isDelivery, setIsDelivery] = useState<boolean>(values.delivery);
  const [isAEmporter, setIsAEmporter] = useState<boolean>(values.aEmporter);
  const [deliveryFixed, setDeliveryFixed] = useState<boolean>(values.deliveryFixed);
  const [isCB, setIsCB] = useState<boolean>(values.paiementCB);
  const [isDirectToAdvisor, setIsDirectToAdvisor] = useState<boolean>(values.cbDirectToAdvisor);

  const [existAdmin, setExistAdmin] = useState<any>(null);

  const isDayActivated = useCallback(
    (day: string) => !!openingTimes.get(day)?.activated,
    [openingTimes],
  );

  const getOpenings = useCallback(
    (day: string) => (openingTimes.get(day) as OpeningTime).openings,
    [openingTimes],
  );

  const getOpeningTime = useCallback(
    (day: string) => openingTimes.get(day) as OpeningTime,
    [openingTimes],
  );

  const applyToAll = useCallback(
    (day: string) => {
      setOpeningTimes((values) => {
        const openingTime = getOpeningTime(day);
        daysOfWeek.forEach((d) => {
          if (d !== day) values.set(d, { ...openingTime });
        });

        return new Map(values);
      });
    },
    [getOpeningTime],
  );

  const applyToNext = useCallback(
    (day: string) => {
      setOpeningTimes((values) => {
        const openingTimes = getOpeningTime(day),
          index = daysOfWeek.indexOf(day),
          nextDay = daysOfWeek[index + 1];

        nextDay && values.set(nextDay, { ...openingTimes });

        return new Map(values);
      });
    },
    [getOpeningTime],
  );

  const classes = useStyles();
  const theme = useTheme();

  useEffect(() => {
    setLoadingCategories(true);
    getCategories()
      .then((data) => setCategoryOptions(data))
      .finally(() => setLoadingCategories(false));

    setLoadingUsers(true);
    getUsers({ role: 'ROLE_RESTAURANT_ADMIN', alreadyRestaurantAdmin: false })
      .then((data) => {
        setUserOptions(data)
      })
      .finally(() => setLoadingUsers(false));

    getUsersById(values.admin)
      .then((data: any) => {
        setExistAdmin(data._doc);
      })
  }, [values.admin]);

  useEffect(() => {

    if (errors.image) {
      enqueueSnackbar('Veuillez ajouter une image', {
        variant: 'warning',
      });
    }

    addnewLivraison(initialValues.livraison)


  }, [enqueueSnackbar, errors]);

  const onChangeAddress = async (data: any) => {
    const results = await geocodeByAddress(data.description);
    const { lng, lat } = await getLatLng(results[0]);
    const [place] = await geocodeByPlaceId(data.placeId);
    const address = place.formatted_address;
    const { long_name: postalCode = '' } =
      place.address_components.find(c => c.types.includes('postal_code')) || {};
    const { long_name: city = '' } =
      place.address_components.find(c => c.types.includes('locality')) || {};

    setValues((values) => ({
      ...values,
      address,
      city,
      postalCode,
      latitude: String(lat),
      longitude: String(lng),
    }))
  }

  const handleSwitchDelivery = (e: any) => {
    const { name, checked } = e.target;

    if (name === 'delivery') {
      setIsDelivery(checked);
    }

    if (name === 'paiementCB') {
      setIsCB(checked);
    }

    if (name === 'deliveryFixed') {
      setDeliveryFixed(checked);
    }

    if (name === 'cbDirectToAdvisor') {
      setIsDirectToAdvisor(checked)
    }

    if (name === 'aEmporter') {
      setIsAEmporter(checked)
    }

    setValues((values) => ({
      ...values,
      [name]: checked
    }));
  }

  const handleChangeLiraison = (e: any) => {

    setLivraisonValue({
      ...livraisonValue,
      [e.target.name]: e.target.value.trim().toLowerCase()
    });

  }

  const handleAddArray = (key: string) => {

    const list: any[] = values.livraison[key] || [];

    if (livraisonValue[key] !== '') {

      list.push(livraisonValue[key])

      setLivraison(list, key);

      setLivraisonValue({
        ...livraisonValue,
        [key]: ''
      });

    }

  }

  return (
    <form
      noValidate
      autoComplete="off"
      onSubmit={(e) => {
        e.preventDefault();
        e.stopPropagation();
        (
          e.currentTarget.querySelector('[type=submit]') as HTMLInputElement
        ).focus();
        if (validate()) onSave?.({ ...values, openingTimes });
      }}
    >
      <Grid container spacing={2} justify="center">
        <Grid item xs={12}>
          <Typography variant="h4" style={{ fontWeight: 'bold' }} gutterBottom>
            Général
          </Typography>
        </Grid>
        <Grid item xs={12} md={6}>
          <Typography variant="h5" gutterBottom>
            Nom
          </Typography>
          <TextField
            name="name"
            placeholder="Nom"
            variant="outlined"
            fullWidth
            defaultValue={initialValues.name}
            error={!!errors.name}
            helperText={errors.name}
            onBlur={handleInputBlur}
            required
          />
          <Box height={theme.spacing(2)} />
          <Typography variant="h5" gutterBottom>
            Adresse
          </Typography>
          <AddressInput
            defaultValue={initialValues.address}
            error={!!errors.address}
            helperText={errors.address}
            onChange={onChangeAddress}
          />
          <Box height={theme.spacing(2)} />
          <Grid container spacing={1}>
            <Grid item xs={12}>
              <Typography variant="h5" gutterBottom>
                Localisation
              </Typography>
            </Grid>
            <Grid item xs>
              <TextField
                name="longitude"
                type="number"
                placeholder="Longitude"
                variant="outlined"
                fullWidth
                value={values.longitude}
                error={!!errors.longitude}
                helperText={errors.longitude}
                disabled
              />
            </Grid>
            <Grid item xs>
              <TextField
                name="latitude"
                type="number"
                placeholder="Latitude"
                variant="outlined"
                fullWidth
                value={values.latitude}
                error={!!errors.latitude}
                helperText={errors.latitude}
                disabled
              />
            </Grid>
            <Grid item>
              <Tooltip title="Utiliser votre position actuelle">
                <IconButton
                  onClick={() => {
                    getGeoLocation()
                      .then((position) => {
                        setValues((values) => {
                          values.longitude = `${position.coords.longitude}`;
                          values.latitude = `${position.coords.latitude}`;
                          return { ...values };
                        });
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
        <Grid
          item
          xs={12}
          md={6}
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'stretch',
          }}
        >
          <Grid container={true}>
            <Grid
              item
              xs={12}
              md={4}
              style={{
                padding: '1vh'
              }}
            >
              <DropzoneArea
                inputProps={{
                  name: '',
                }}
                previewGridProps={{
                  container: { spacing: 2, justify: 'center' },
                }}
                dropzoneText="Logo"
                acceptedFiles={['image/*']}
                filesLimit={1}
                classes={{ root: classes.dropzone }}
                getFileAddedMessage={() => 'Fichier ajouté'}
                getFileRemovedMessage={() => 'Fichier enlevé'}
                onChange={(files) => {
                  if (files.length) setValues((v) => ({ ...v, logo: files[0] }));
                }}
                initialFiles={[initialValues.logo ?? ""]}
              />
            </Grid>

            <Grid
              item
              xs={12}
              md={4}
              style={{
                padding: '1vh'
              }}
            >
              <DropzoneArea
                inputProps={{
                  name: 'couvertureWeb',
                }}
                previewGridProps={{
                  container: { spacing: 2, justify: 'center' },
                }}
                dropzoneText="Image de couverture"
                acceptedFiles={['image/*']}
                filesLimit={1}
                classes={{ root: classes.dropzone }}
                getFileAddedMessage={() => 'Fichier ajouté'}
                getFileRemovedMessage={() => 'Fichier enlevé'}
                onChange={(files) => {
                  if (files.length) setValues((v) => ({ ...v, couvertureWeb: files[0] }));
                }}
                initialFiles={[initialValues.couvertureWeb ?? ""]}
              />

            </Grid>
            <Grid
              item
              xs={12}
              md={4}
              style={{
                padding: '1vh'
              }}
            >

              <DropzoneArea
                inputProps={{
                  name: 'couvertureMobile',
                }}
                previewGridProps={{
                  container: { spacing: 2, justify: 'center' },
                }}
                dropzoneText="Image de couverture mobile"
                acceptedFiles={['image/*']}
                filesLimit={1}
                classes={{ root: classes.dropzone }}
                getFileAddedMessage={() => 'Fichier ajouté'}
                getFileRemovedMessage={() => 'Fichier enlevé'}
                onChange={(files) => {
                  if (files.length) setValues((v) => ({ ...v, couvertureMobile: files[0] }));
                }}
                initialFiles={[initialValues.couvertureMobile ?? ""]}
              />
            </Grid>
          </Grid>

        </Grid>
        <Grid item xs={12}>
          <Typography variant="h5" gutterBottom>
            Ville
          </Typography>
          <TextField
            name="city"
            placeholder="Ville"
            variant="outlined"
            fullWidth
            value={values.city}
            error={!!errors.city}
            helperText={errors.city}
            onChange={handleInputChange}
            required
          />
        </Grid>
        <Grid item xs={12}>
          <Typography variant="h5" gutterBottom>
            Code Postal
          </Typography>
          <TextField
            name="postalCode"
            placeholder="Code Postal"
            variant="outlined"
            fullWidth
            value={values.postalCode}
            error={!!errors.postalCode}
            helperText={errors.postalCode}
            onChange={handleInputChange}
            required
          />
        </Grid>
        {isAdmin && (
          <Grid item xs={12}>
            <Typography variant="h5" gutterBottom>
              Administrateur
            </Typography>
            <Autocomplete
              loadingText="Chargement"
              noOptionsText="Aucun utilisateur trouvé"
              loading={loadingUsers}
              filterSelectedOptions
              options={userOptions}
              value={
                userOptions.find(({ _id }) => _id === values.admin) || existAdmin || null
              }
              onChange={(_, v) => {
                if (v)
                  setValues((old) => {
                    old.admin = v._id;
                    return { ...old };
                  });
              }}
              getOptionLabel={(option) =>
                option.name.first || option.name.last
                  ? `${option.name.first} ${option.name.last}`
                  : `Aucun nom - ${option.phoneNumber}`
              }
              renderInput={(params) => (
                <TextField
                  {...params}
                  variant="outlined"
                  placeholder="Administrateur"
                  error={!!errors.admin}
                  helperText={errors.admin}
                />
              )}
            />
          </Grid>
        )}
        <Grid item xs={12}>
          <Typography variant="h5" gutterBottom>
            Mobile
          </Typography>
          <TextField
            type="tel"
            name="phoneNumber"
            placeholder="Mobile"
            variant="outlined"
            fullWidth
            defaultValue={initialValues.phoneNumber}
            error={!!errors.phoneNumber}
            helperText={errors.phoneNumber}
            onBlur={handleInputBlur}
            required
          />
        </Grid>
        <Grid item xs={12}>
          <Typography variant="h5" gutterBottom>
            Téléphone fixe
          </Typography>
          <TextField
            type="tel"
            name="fixedLinePhoneNumber"
            placeholder="Téléphone fixe"
            variant="outlined"
            fullWidth
            defaultValue={initialValues.fixedLinePhoneNumber}
            error={!!errors.fixedLinePhoneNumber}
            helperText={errors.fixedLinePhoneNumber}
            onBlur={handleInputBlur}
            required
          />
        </Grid>
        <Grid item xs={12}>
          <Typography variant="h5" gutterBottom>
            Description
          </Typography>
          <TextField
            name="description"
            placeholder="Description"
            variant="outlined"
            fullWidth
            multiline
            rows={6}
            defaultValue={initialValues.description}
            error={!!errors.description}
            helperText={errors.description}
            onBlur={handleInputBlur}
          />
        </Grid>
        <Grid item xs={12}>
          <Typography variant="h5" gutterBottom>
            Catégories
          </Typography>
          <Autocomplete
            loadingText="Chargement"
            noOptionsText="Aucune catégorie disponible"
            multiple
            disableCloseOnSelect
            loading={loadingCategories}
            filterSelectedOptions
            options={categoryOptions}
            value={categoryOptions.filter(
              ({ _id }) => !!values.categories.find((d) => _id === d),
            )}
            onChange={(_, v) => {
              setValues((old) => {
                old.categories = v.map(({ _id }) => _id);
                return { ...old };
              });
            }}
            getOptionLabel={(option) => option.name.fr}
            renderInput={(params) => (
              <TextField
                {...params}
                variant="outlined"
                placeholder="Catégories"
                error={!!errors.categories}
                helperText={errors.categories}
              />
            )}
          />
        </Grid>
        {/* <Grid item xs={12}>
          <Typography variant="h5" gutterBottom>
            Types de plats
          </Typography>
          <Autocomplete
            loadingText="Chargement"
            noOptionsText="Aucun type disponible"
            multiple
            disableCloseOnSelect
            loading={loadingTypes}
            filterSelectedOptions
            options={typeOptions}
            value={typeOptions.filter(
              ({ _id }) => !!values.foodTypes.find((d) => _id === d),
            )}
            onChange={(_, v) => {
              setValues((old) => {
                old.foodTypes = v.map(({ _id }) => _id);
                return { ...old };
              });
            }}
            getOptionLabel={(option) => option.name.fr}
            renderInput={(params) => (
              <TextField
                {...params}
                variant="outlined"
                placeholder="Types de plats"
                error={!!errors.foodTypes}
                helperText={errors.foodTypes}
              />
            )}
          />
        </Grid> */}
        <Grid item xs={12}>
          <Box height={theme.spacing(6)} />
          <Typography variant="h4" style={{ fontWeight: 'bold' }} gutterBottom>
            Paramètres du restaurant
          </Typography>
        </Grid>
        <Grid item xs={12}>
          <Accordion>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography variant="h5">Heures d'ouvertures</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <List style={{ width: '100%' }}>
                {daysOfWeek.map((day, i) => (
                  <React.Fragment key={day}>
                    <ListItem button>
                      <ListItemIcon>
                        <IOSSwitch
                          onClick={(e) => e.stopPropagation()}
                          checked={isDayActivated(day)}
                          onChange={(_, checked) =>
                            setOpeningTimes((values) => {
                              getOpeningTime(day).activated = checked;
                              return new Map(values);
                            })
                          }
                        />
                      </ListItemIcon>
                      <ListItemText
                        primary={`${capitalize(day)} - ${getOpeningTime(day).activated ? 'Ouvert' : 'Fermé'
                          }`}
                        secondary={
                          <>
                            <span
                              style={{
                                cursor: 'pointer',
                                backgroundColor: 'transparent',
                                outline: 'none',
                                padding: 0,
                                border: 'none',
                                color: theme.palette.primary.main,
                                textDecoration: 'underline',
                              }}
                              onClick={(e) => {
                                e.stopPropagation();
                                applyToAll(day);
                              }}
                            >
                              Appliquer à tous
                            </span>
                            <span style={{ margin: theme.spacing(0, 1) }}>
                              -
                            </span>
                            <span
                              style={{
                                cursor: 'pointer',
                                backgroundColor: 'transparent',
                                outline: 'none',
                                padding: 0,
                                border: 'none',
                                color: theme.palette.primary.main,
                                textDecoration: 'underline',
                              }}
                              onClick={(e) => {
                                e.stopPropagation();
                                applyToNext(day);
                              }}
                            >
                              Appliquer au suivant
                            </span>
                          </>
                        }
                      />
                    </ListItem>
                    <Collapse in={getOpeningTime(day).activated}>
                      <Box padding={theme.spacing(1, 3)}>
                        <Grid container spacing={1}>
                          {getOpenings(day).map((openingTime, i, a) => {
                            const {
                              begin: { hour: bh, minute: bm },
                              end: { hour: eh, minute: em },
                            } = openingTime;

                            return (
                              <Grid
                                key={i}
                                item
                                container
                                xs
                                alignItems="center"
                                justify="center"
                              >
                                <span>
                                  {i === 0 ? 'Matinée: ' : 'Après-midi: '}
                                </span>

                                <Box width={theme.spacing(1)} />

                                <span>De</span>

                                <Box width={theme.spacing(1)} />

                                <KeyboardTimePicker
                                  ampm={false}
                                  margin="none"
                                  inputVariant="outlined"
                                  style={{ width: 130 }}
                                  value={moment(`2020-01-01 ${bh}:${bm}`)}
                                  onChange={(date) => {
                                    openingTime.begin = {
                                      hour: (date as moment.Moment).format(
                                        'HH',
                                      ),
                                      minute: (date as moment.Moment).format(
                                        'mm',
                                      ),
                                    };
                                    setOpeningTimes((v) => new Map(v));
                                  }}
                                />

                                <Box width={theme.spacing(1)} />

                                <span>à</span>

                                <Box width={theme.spacing(1)} />

                                <KeyboardTimePicker
                                  ampm={false}
                                  margin="none"
                                  inputVariant="outlined"
                                  style={{ width: 130 }}
                                  value={moment(`2020-01-01 ${eh}:${em}`)}
                                  onChange={(date) => {
                                    openingTime.end = {
                                      hour: (date as moment.Moment).format(
                                        'HH',
                                      ),
                                      minute: (date as moment.Moment).format(
                                        'mm',
                                      ),
                                    };
                                    setOpeningTimes((v) => new Map(v));
                                  }}
                                />
                              </Grid>
                            );
                          })}
                        </Grid>
                      </Box>
                    </Collapse>
                    {i < 6 && <Divider />}
                  </React.Fragment>
                ))}
              </List>
            </AccordionDetails>
          </Accordion>
        </Grid>

        <Grid container={true} justify="center" className={classes.padding}>

          <Grid item={true} md={4} xs={12}>
            <FormControlLabel
              control={
                <IOSSwitch
                  defaultChecked={initialValues.delivery}
                  onChange={handleSwitchDelivery}
                  name="delivery"
                />
              }
              label="Livraison"
            />
          </Grid>
          <Grid item={true} md={4} xs={12}>

            <FormControlLabel
              control={
                <IOSSwitch
                  defaultChecked={initialValues.surPlace}
                  onChange={handleSwitchChange}
                  name="surPlace"
                />
              }
              label="Sur place"
            />
          </Grid>
          <Grid item={true} md={4} xs={12}>

            <FormControlLabel
              control={
                <IOSSwitch
                  defaultChecked={initialValues.aEmporter}
                  onChange={handleSwitchDelivery}
                  name="aEmporter"
                />
              }
              label="À emporter"
            />
          </Grid>
        </Grid>
        {
          isDelivery && (
            <Grid container={true} className={classes.padding}>

              <Grid item={true} md={4} xs={12}>
                <FormControlLabel
                  control={
                    <IOSSwitch
                      defaultChecked={values.paiementCB}
                      onChange={handleSwitchDelivery}
                      name="paiementCB"
                    />
                  }
                  label="Paiement par CB"
                />
              </Grid>

              <Grid item={true} md={4} xs={12}>
                <FormControlLabel
                  control={
                    <IOSSwitch
                      defaultChecked={values.deliveryFixed}
                      onChange={handleSwitchDelivery}
                      name="deliveryFixed"
                    />
                  }
                  label="Prix de livraison fixe"
                />
              </Grid>

              <Grid item={true} md={4} xs={12}>
                <FormControlLabel
                  control={
                    <IOSSwitch
                      defaultChecked={values.paiementLivraison}
                      onChange={handleSwitchChange}
                      name="paiementLivraison"
                    />
                  }
                  label="Paiement à la livraison"
                />
              </Grid>

              {
                (isAdmin && isCB && isDelivery) && (
                  <Grid item={true} md={4} xs={12}>
                    <FormControlLabel
                      control={
                        <IOSSwitch
                          defaultChecked={values.cbDirectToAdvisor}
                          onChange={handleSwitchDelivery}
                          name="cbDirectToAdvisor"
                        />
                      }
                      label="Paiement directement a MENU ADVISOR"
                    />
                  </Grid>
                )}
            </Grid>
          )}

        {
          (isAdmin && isDelivery && isCB && !isDirectToAdvisor) && (
            <Grid container={true} className={classes.paddingStripe}>
              <Grid item xs={12}>
                <Typography variant="h5" gutterBottom>
                  Clé stripe public du restaurateur
                </Typography>
                <TextField
                  name="customerStripeKey"
                  placeholder="Clé stripe public du restaurateur"
                  variant="outlined"
                  fullWidth
                  defaultValue={initialValues.customerStripeKey}
                  error={!!errors.customerStripeKey}
                  helperText={errors.customerStripeKey}
                  onBlur={handleInputBlur}
                  required
                />
              </Grid>
              <Grid item xs={12} className={classes.marginTop}>
                <Typography variant="h5" gutterBottom>
                  Clé stripe privé du restaurateur
                </Typography>
                <TextField
                  name="customerSectretStripeKey"
                  placeholder="Clé stripe privé du restaurateur"
                  variant="outlined"
                  fullWidth
                  defaultValue={initialValues.customerSectretStripeKey}
                  error={!!errors.customerSectretStripeKey}
                  helperText={errors.customerSectretStripeKey}
                  onBlur={handleInputBlur}
                  required
                />
              </Grid>
            </Grid>

          )
        }
        <Grid container={true} className={classes.padding}>

          <Grid item={true} md={4} xs={12}>
            <FormControlLabel
              control={
                <IOSSwitch
                  defaultChecked={initialValues.isMenuActive}
                  onChange={handleSwitchChange}
                  name="isMenuActive"
                />
              }
              label="Activer le menu"
            />
          </Grid>
          <Grid item={true} md={4} xs={12}>

            <FormControlLabel
              control={
                <IOSSwitch
                  defaultChecked={initialValues.isBoissonActive}
                  onChange={handleSwitchChange}
                  name="isBoissonActive"
                />
              }
              label="Activer la boisson"
            />
          </Grid>
        </Grid>

        {/**
 * -------------------------------------------------------------------------------------
 */}

        {(isDelivery && !deliveryFixed) && (<>
          <Grid item xs={12}>
            <Typography variant="h4" style={{ fontWeight: 'bold' }} gutterBottom>
              Paramètres du livraison
            </Typography>
          </Grid>
          {listParametreLivraison.map((listParametreLivraison: any) => {
            return (<Grid container={true} >

              <Grid item xs={12}>
                <div
                  className={classes.input}
                >
                  <div
                    style={{
                      width: '93%',
                      display: 'inline-block',
                    }}
                  >

                    <div
                      style={{
                        display: 'inline-block'
                      }}
                    >
                      {values.livraison[listParametreLivraison.key] && values.livraison[listParametreLivraison.key].map((items: any, index: any) => {
                        return <Chip
                          icon={<EmailIcon />}
                          label={items}
                          key={items}
                          onDelete={() => setLivraison(items, values.livraison?.[listParametreLivraison.key].splice(index, 1))}
                          style={{
                            margin: '0.5vh 0.5vh'
                          }}
                        />
                      })}
                    </div>

                    <div
                      style={{
                        display: 'inline-block'
                      }}
                    >
                      <input
                        className={classes.inputForm}
                        name={listParametreLivraison.key}
                        placeholder={listParametreLivraison.placeholder}
                        type={listParametreLivraison.type}
                        value={livraisonValue[listParametreLivraison.key] || ""}
                        onChange={handleChangeLiraison}
                        required
                      />
                    </div>

                  </div>

                  <div
                    style={{
                      width: '5%',
                      display: 'inline-block',
                    }}
                  >
                    <Button
                      variant="contained"
                      color="primary"
                      component="span"
                      onClick={() => {
                        handleAddArray(listParametreLivraison.key)
                      }}>
                      <AddCircleIcon />
                    </Button>
                  </div>

                </div>

                <br />

              </Grid>

            </Grid>)
          })}

          <Grid item xs={12}>
            <Typography variant="h5" gutterBottom>
              Prix par kilomètre
            </Typography>
            <TextField
              name="priceByMiles"
              type="number"
              placeholder="Prix par kilomètre "
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">€</InputAdornment>
                ),
              }}
              variant="outlined"
              fullWidth
              defaultValue={initialValues.priceByMiles}
              error={!!errors.priceByMiles}
              helperText={errors.priceByMiles}
              onBlur={handleInputBlur}
            />
          </Grid>


        </>)
        }

        {
          (isDelivery && deliveryFixed) && (
            <>
              <Grid item xs={12}>
                <Typography variant="h5" gutterBottom>
                  Prix de livraison
                </Typography>
                <TextField
                  name="deliveryPrice"
                  type="number"
                  placeholder="Prix de livraison "
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">€</InputAdornment>
                    ),
                  }}
                  variant="outlined"
                  fullWidth
                  defaultValue={initialValues.deliveryPrice}
                  error={!!errors.deliveryPrice}
                  helperText={errors.deliveryPrice}
                  onBlur={handleInputBlur}
                />
              </Grid>
            </>
          )}

        {isDelivery && (
          <Grid item xs={12}>
            <Typography variant="h5" gutterBottom>
              Prix minimun de livraison
            </Typography>
            <TextField
              name="minPriceIsDelivery"
              type="number"
              placeholder="Prix minimun de livraison"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">€</InputAdornment>
                ),
              }}
              variant="outlined"
              fullWidth
              defaultValue={initialValues.minPriceIsDelivery}
              onBlur={handleInputBlur}
            />
          </Grid>
        )}

        {/**
 * -------------------------------------------------------------------------------------
       */}

        {(isDelivery || isAEmporter) && <Grid item xs={12}>
          <Typography variant="h5" gutterBottom>
            Remise
          </Typography>
          <TextField
            name="discount"
            type="number"
            placeholder="Remise"
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">%</InputAdornment>
              ),
            }}
            variant="outlined"
            fullWidth
            defaultValue={initialValues.discount}
            error={!!errors.discount}
            helperText={errors.discount}
            onBlur={handleInputBlur}
          />
        </Grid>}

        <Grid item container justify="flex-end" alignItems="center" xs={12}>
          <Button
            variant="contained"
            color="default"
            disabled={saving}
            size="large"
            onClick={onCancel}
          >
            Annuler
          </Button>
          <Box width={theme.spacing(2)} />
          <Button
            variant="contained"
            color="primary"
            size="large"
            type="submit"
          >
            {!saving ? (
              'Enregistrer'
            ) : (
              <CircularProgress color="inherit" size="25.45px" />
            )}
          </Button>
        </Grid>
      </Grid>
    </form>
  );
};

export default RestaurantForm;
