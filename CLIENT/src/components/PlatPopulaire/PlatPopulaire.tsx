import React, { useEffect, useState } from 'react';
import Grid from '@material-ui/core/Grid';
import { getPlatPopulaire } from '../../services/platPopulaire';
import Food from '../../models/Food.model';
import { SliderContainer, SliderSection } from '../Slider';
import { getChunks } from '../../utils/array';
import FoodCard from '../foods/FoodCard';
import { useSnackbar } from 'notistack';
import Loader from '../Loader';
import NoResult from '../NoResult';
import { useHistory } from 'react-router-dom';
import useStyles from './style';
import Typography from '@material-ui/core/Typography';
import { getFoods } from '../../services/food';
import {
    KeyboardArrowLeft,
    KeyboardArrowRight,
} from '@material-ui/icons';
import {
    Box,
    Fab,
    Theme,
    useMediaQuery,
} from '@material-ui/core';

interface IPlatPopulaire {
    clsx: any;
    Link: any;
    title: string;
}

const PlatPopulaire: React.FC<any> = (props) => {

    const { clsx, Link, title } = props as IPlatPopulaire;
    const { enqueueSnackbar } = useSnackbar();
    const classes = useStyles();

    const [loadingPopularFoods, setLoadingPopularFoods] = useState(false);
    const [popularFoods, setPopularFoods] = useState<Food[]>([]);
    const [foodsId, setFoodsId] = useState<any[]>([]);
    const [popularFoodSection, setPopularFoodSection] = useState(0);

    const abovelg = useMediaQuery((theme: Theme) => theme.breakpoints.up('lg'));

    const betweenMdAndLg = useMediaQuery((theme: Theme) =>
        theme.breakpoints.between('md', 'lg')
    );

    const betweenSmAndMd = useMediaQuery((theme: Theme) =>
        theme.breakpoints.between('sm', 'md')
    );

    const [chunkSize, setChunkSize] = useState(() =>
        abovelg ? 4 : betweenMdAndLg ? 3 : betweenSmAndMd ? 2 : 1
    );

    const history = useHistory();

    useEffect(() => {
        setChunkSize(abovelg ? 4 : betweenMdAndLg ? 3 : betweenSmAndMd ? 2 : 1);
    }, [abovelg, betweenMdAndLg, betweenSmAndMd]);

    useEffect(() => {
        getFoods({
            lang: 'fr',
        })
            .then((data) => {
                setPopularFoods(data);
            })
            .catch(() => {
                enqueueSnackbar('Erreur lors du chargement des plat populaires');
            });
    }, [enqueueSnackbar]);

    // PlatReco

    useEffect(() => {
        if (!loadingPopularFoods) {
            setLoadingPopularFoods(true);
            setPopularFoods([]);
            getPlatPopulaire()
                .then((data: any) => {
                    const array = data
                        .sort((a: any, b: any) => a.priority - b.priority)
                        .map((item: any) => item.food._id)
                    const recommande = [].concat(...array);
                    setFoodsId(recommande);
                    setLoadingPopularFoods(false);
                })
                .catch(() => {
                    enqueueSnackbar('Erreur lors du chargement des plats recommander');
                });
        }

    }, [enqueueSnackbar]);

    const filter = (array: any[], id: any[]) => {

        const arrayNew = [];

        for (let i = 0; i < id.length; i++) {
            arrayNew.push(array.filter((items: any) => items._id === id[i])[0])
        }


        return arrayNew

    }

    return (
        <>
            <div className={classes.heading}>
                <Typography
                    component="h2"
                    variant="h4"
                    align="left"
                    className={clsx(classes.title, 'translate')}
                >
                    {title}
                </Typography>
                <div className={classes.sliderControls}>
                    <Typography
                        variant="h6"
                        component={Link}
                        to="/search?type=food&searchCategory=popular"
                        className="translate"
                    >
                        Voir tout
                    </Typography>
                    {popularFoods.length > chunkSize && (
                        <>
                            <div>
                                <Fab
                                    size="small"
                                    disabled={!popularFoodSection}
                                    onClick={() => setPopularFoodSection((v) => v - 1)}
                                >
                                    <KeyboardArrowLeft />
                                </Fab>
                            </div>
                            <Box width={10} />
                            <div>
                                <Fab
                                    size="small"
                                    disabled={
                                        popularFoodSection ===
                                        Math.ceil(popularFoods.length / chunkSize) - 1
                                    }
                                    onClick={() => setPopularFoodSection((v) => v + 1)}
                                >
                                    <KeyboardArrowRight />
                                </Fab>
                            </div>
                        </>
                    )}
                </div>
            </div>

            {loadingPopularFoods ? (
                <Loader />
            ) : !popularFoods.length ? (
                <NoResult />
            ) : (
                <SliderContainer direction="horizontal" position={popularFoodSection}>
                    {getChunks(filter(popularFoods, foodsId), chunkSize)
                        .map((foods, i) => (
                            <SliderSection index={i} key={i}>
                                <Grid container spacing={4} style={{ padding: '24px' }}>
                                    {foods
                                        .map((food) => (
                                            <Grid key={food._id} item xs={12} sm={6} md={4} lg={3}>
                                                <FoodCard popular item={food} />
                                            </Grid>
                                        ))}
                                </Grid>
                            </SliderSection>
                        ))}
                </SliderContainer>
            )}
        </>
    );
};

export default PlatPopulaire;