import {
    makeStyles,
    Paper,
    Typography,
    Button,
    TextField,
    Grid,
    CircularProgress
} from '@material-ui/core';
import {
    ViewModule,
} from '@material-ui/icons';
import MapIcon from '@material-ui/icons/Map';
import EuroIcon from '@material-ui/icons/Euro';
import TimerIcon from '@material-ui/icons/Timer';
import { FC, useEffect, useState } from 'react';
import { geocodeByAddress, getLatLng, geocodeByPlaceId } from 'react-places-autocomplete';
import PageHeader from '../../components/Admin/PageHeader';
import AddressInput from '../../components/Common/AddressInput';
import { getRestaurants } from '../../services/restaurant';
import { Autocomplete } from '@material-ui/lab';
import { useSnackbar } from 'notistack';
import DialogAlert from './Dialog';

const useStyles = makeStyles((theme) => ({
    root: {
        padding: theme.spacing(2),
    },
    addBtn: {
        flexShrink: 0,
        marginRight: theme.spacing(2),
        textTransform: 'none',
        margin: '3vh'
    },
}));

let map

const SimulationLivraison: FC = () => {

    const classes = useStyles();
    const { enqueueSnackbar } = useSnackbar();

    const [Destination, setDestination] = useState<any>({});
    const [loading, setLoading] = useState(false);
    const [block, setBlock] = useState(false);
    const [openDialog, setopenDialog] = useState<boolean>(false);
    const [textDialog, setTestDialog] = useState<string>("");
    const [RestaurantSelected, setRestaurantSelected] = useState<any>({});
    const [RestaurantOrigin, steRestaurantOrigin] = useState<any>({});
    const [successResponse, setSuccessResponse] = useState<any>({});
    const [address, setAddress] = useState("");

    const [restaurantOptions, setRestaurantOptions] = useState<any[]>([]);
    const [loadingRestaurants, setLoadingRestaurants] = useState<boolean>(false);

    useEffect(() => {

        new window.google.maps.Map(document.getElementById("map") as HTMLElement, {
            center: { lat: 48.866667, lng: 2.333333 },
            zoom: 15,
        })

        setLoadingRestaurants(true);

        getRestaurants()
            .then((data) => setRestaurantOptions(data))
            .finally(() => setLoadingRestaurants(false));

    }, [setLoadingRestaurants, setRestaurantOptions])

    const onChangeAddress = async (data: any) => {

        setBlock(false);

        const results = await geocodeByAddress(data.description);
        const { lng, lat } = await getLatLng(results[0]);
        const [place] = await geocodeByPlaceId(data.placeId);

        const { long_name: postalCode = '' } =
            place.address_components.find(c => c.types.includes('postal_code')) || {};
        const { long_name: city = '' } =
            place.address_components.find(c => c.types.includes('locality')) || {};

        setAddress(place.formatted_address);

        if (RestaurantSelected.livraison?.freeCP && (RestaurantSelected.livraison?.freeCP as any[])?.includes(postalCode.trim().toLowerCase())) {
            setTestDialog("livraison gratuite à cette ville");
            setopenDialog(true);
            return;

        }

        if (RestaurantSelected.livraison?.freeCity && (RestaurantSelected.livraison?.freeCity as any[])?.includes(city.trim().toLowerCase())) {
            setTestDialog("livraison gratuite à cette ville");
            setopenDialog(true);
            return;
        }


        setBlock(true);

        setDestination({
            lat: lat,
            lng: lng
        });

    }

    const initMap = (origin: any, destination: any) => {

        setLoading(true);
        const options = { zoom: 20, scaleControl: true };
        map = new google.maps.Map(document.getElementById('map') as HTMLElement, options);

        let directionsService = new google.maps.DirectionsService();
        let directionsRenderer = new google.maps.DirectionsRenderer();
        directionsRenderer.setMap(map); // Existing map object displays directions

        const route: any = {
            origin: origin,
            destination: destination,
            travelMode: 'DRIVING'
        }

        directionsService.route(route,
            function (response: any, status: any) { // anonymous function to capture directions
                if (status !== 'OK') {
                    setTestDialog("Une erreur est survenue");
                    setopenDialog(true);
                    setLoading(false);
                    return;
                } else {
                    setLoading(false);
                    directionsRenderer.setDirections(response); // Add route to the map
                    var directionsData = response.routes[0].legs[0]; // Get data about the mapped route
                    if (!directionsData) {
                        setTestDialog("Directions request failed'");
                        setopenDialog(true);
                        return;
                    }
                    else {

                        const distance = Math.ceil((directionsData.distance.value / 1000));

                        if (
                            RestaurantSelected.DistanceMax &&
                            (+RestaurantSelected.DistanceMax) <= distance) {
                            setTestDialog(`Le restaurant ne peut pas faire de livraison à cette ville distance maximal est ${(RestaurantSelected.livraison?.MATRIX as any[])[0]}`);
                            setopenDialog(true);
                        }

                        setSuccessResponse({
                            distance: directionsData.distance.text,
                            price: distance * +RestaurantSelected.priceByMiles,
                            duration: directionsData.duration.text
                        });

                        return;

                    }
                }

            })
    }

    return (
        <>
            <DialogAlert
                openDialog={openDialog}
                setOpen={setopenDialog}
                message={textDialog}
            />
            <PageHeader
                title="Simulation de livaison"
                subTitle="Simulation de livraison"
                icon={ViewModule}
            />
            <Paper className={classes.root}>

                <Grid container spacing={1}>

                    <Grid item md={5} xs={12}>
                        <Typography variant="h5" gutterBottom>
                            Restaurant
                        </Typography>
                        <Autocomplete
                            noOptionsText="Aucun restaurant disponible"
                            loading={loadingRestaurants}
                            options={restaurantOptions}
                            getOptionLabel={(option) => option.name}
                            value={
                                restaurantOptions.find(
                                    ({ _id }) => _id === RestaurantSelected._id,
                                ) || null
                            }
                            onChange={(e: any, value: any) => {

                                setRestaurantSelected(value);

                                if ((value.deliveryFixed as boolean)) {
                                    setTestDialog(`Livraison est fixe ${(value.deliveryPrice.amount / 100)} €`);
                                    setopenDialog(true);
                                    return;
                                }

                                setBlock(true);

                                steRestaurantOrigin({
                                    lat: value.location.coordinates[1],
                                    lng: value.location.coordinates[0]
                                })
                            }}
                            renderInput={(params) => (
                                <TextField
                                    {...params}
                                    variant="outlined"
                                    placeholder="Restaurant"
                                />
                            )}
                        />
                    </Grid>

                    <Grid item md={5} xs={12}>
                        <Typography variant="h5" gutterBottom>
                            Destination
                        </Typography>
                        <AddressInput
                            defaultValue={address || ""}
                            onChange={onChangeAddress}
                        />
                    </Grid>
                    {
                        block && (<Grid item md={2} xs={12}>
                            <Button
                                variant="contained"
                                color="primary"
                                className={classes.addBtn}
                                onClick={() => {
                                    initMap(RestaurantOrigin, Destination)
                                }}
                            >
                                Calculer
                            </Button>
                        </Grid>)
                    }

                </Grid>
                {loading ? (<CircularProgress />) : (<div id="container">
                    <div id="sidebar">
                        <Grid container direction="row" alignItems="center">

                            <Grid item xs={4} style={{ padding: '2vh' }}>

                                <Paper elevation={3} style={{ padding: '1vh', alignItems: 'center', fontSize: '4vh' }} >
                                    <Typography variant="h2" gutterBottom>
                                        <Grid container direction="row" alignItems="center">
                                            <Grid item>
                                                <MapIcon />
                                            </Grid>
                                            <Grid item>
                                                {successResponse.distance}
                                            </Grid>
                                        </Grid>
                                    </Typography>
                                </Paper>

                            </Grid>

                            <Grid item xs={4} style={{ padding: '2vh' }} >

                                <Paper elevation={3} style={{ padding: '1vh', alignItems: 'center', fontSize: '4vh' }}  >
                                    <Typography variant="h2" gutterBottom>
                                        <Grid container direction="row" alignItems="center">

                                            <Grid item>
                                                <EuroIcon />
                                            </Grid>
                                            <Grid item>
                                                {successResponse.price}
                                            </Grid>
                                        </Grid>
                                    </Typography>
                                </Paper>

                            </Grid>

                            <Grid item xs={4} style={{ padding: '2vh' }}>

                                <Paper elevation={3} style={{ padding: '1vh', alignItems: 'center', fontSize: '4vh' }}  >
                                    <Typography variant="h5" gutterBottom>
                                        <Grid container direction="row" alignItems="center">
                                            <Grid item>
                                                <TimerIcon />
                                            </Grid>
                                            <Grid item>
                                                {successResponse.duration}
                                            </Grid>
                                        </Grid>

                                    </Typography>
                                </Paper>

                            </Grid>

                        </Grid>

                    </div>
                </div>)
                }
                <div id="map" style={{
                    flexBasis: 0,
                    flexGrow: 4,
                    border: '0.5px solid',
                    height: '50vh',
                    width: '100%',
                    margin: '1vh 0'
                }}></div>


            </Paper >
        </>
    );
};

export default SimulationLivraison;
