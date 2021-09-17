import React, { useCallback, useEffect, useState } from 'react';
import {
  Box,
  Button,
  CircularProgress,
  Grid,
  makeStyles,
  MenuItem,
  Select,
  Typography,
  useTheme,
  TextField
} from '@material-ui/core';
import useForm, { FormError, FormValidationHandler } from '../../hooks/useForm';
import Restaurant from '../../models/Restaurant.model';
import { getRestaurants } from '../../services/restaurant';
import { useSnackbar } from 'notistack';
import { useAuth } from '../../providers/authentication';
import { Autocomplete } from '@material-ui/lab';

const useStyles = makeStyles((theme) => ({
  root: {
    padding: theme.spacing(2),
  },
}));

export type RestoRecommandedFormType = {
  _id?: string;
  priority?: number;
  restaurant: any;
};

interface RestoRecommandedFormProps {
  initialValues?: RestoRecommandedFormType;
  onSave?: (data: RestoRecommandedFormType) => void;
  onCancel?: () => void;
  saving?: boolean;
  isUpdate?: boolean;
  records: any[]
}

const RestoRecommanderForm: React.FC<RestoRecommandedFormProps> = ({
  initialValues = {
    restaurant: [],
  },
  onSave,
  records,
  onCancel,
  saving,
  isUpdate
}) => {
  const classes = useStyles();

  const theme = useTheme();
  const { enqueueSnackbar } = useSnackbar();
  const { isRestaurantAdmin, restaurant } = useAuth();

  const validation = useCallback<FormValidationHandler<RestoRecommandedFormType>>(
    (data) => {
      const errors: FormError<RestoRecommandedFormType> = {};

      if (!data.restaurant) errors.restaurant = 'Ce champ ne doit pas être vide';

      return errors;
    },
    [],
  );

  const [restoOptions, setRestoOptions] = useState<Restaurant[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const {
    values,
    setValues,
    validate,
    handleSelectChange
  } = useForm<RestoRecommandedFormType>(initialValues, false, validation);

  useEffect(() => {
    if (isRestaurantAdmin) {
      setValues((old) => {
        old.restaurant = restaurant || undefined;
        return { ...old };
      });
    }

    setLoading(true)
    getRestaurants()
      .then(data => {
        setRestoOptions(data.filter((items: any) => !records.map((item: any) => item.restaurant._id).includes(items._id)))
        setLoading(false)
      })
      .catch(e => {
        enqueueSnackbar('Erreur lors du chargement des restos', { variant: 'error' })
      })
  }, [enqueueSnackbar, isRestaurantAdmin, restaurant, setValues])

  return (
    <form
      noValidate
      className={classes.root}
      onSubmit={(e) => {
        e.preventDefault();
        (e.currentTarget.querySelector(
          '[type=submit]',
        ) as HTMLInputElement).focus();

        if (validate()) onSave?.(values);
      }}
    >
      <Grid container spacing={2}>
        {!isRestaurantAdmin && (<Grid item xs={12}>
          <Typography variant="h5" gutterBottom>
            Restaurant
          </Typography>
          <Autocomplete
            loadingText="Chargement"
            noOptionsText="Aucun Plat disponible"
            loading={loading}
            options={restoOptions}
            multiple
            filterSelectedOptions
            value={restoOptions?.filter((items: any) => { return values.restaurant.includes(items._id) }) || []}
            getOptionLabel={(option) => option.name}
            onChange={(_, v: any) => {
              if (v) {

                setValues((old) => ({
                  ...old, restaurant: v.map((items: any) => items._id)
                })

                );
              }
            }}
            renderInput={(params) => (
              <TextField
                {...params}
                variant="outlined"
                placeholder="Plat"
              />
            )}
          />
        </Grid>)}
        <Grid item container justify="flex-end" alignItems="center" xs={12}>
          <Button
            variant="contained"
            color="default"
            disabled={saving}
            onClick={onCancel}
          >
            Annuler
          </Button>
          <Box width={theme.spacing(2)} />
          <Button variant="contained" color="primary" type="submit">
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

export default RestoRecommanderForm;
