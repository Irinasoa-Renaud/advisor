import React, { useEffect, useState } from 'react';
import RestaurantCard from '../../components/restaurant/RestaurantCard';
import Grid from '@material-ui/core/Grid';
import { getRestoRecommander } from '../../services/restoRecommander'
import RestoRecommander from '../../models/RestoRecommander.model';
import {
    Theme,
    useMediaQuery,
} from '@material-ui/core';
import { SliderContainer, SliderSection } from '../../components/Slider';
import { getChunks } from '../../utils/array';
import { useSnackbar } from 'notistack';
import Loader from '../../components/Loader';
import NoResult from '../../components/NoResult';
import { useHistory } from 'react-router-dom';

const RestoRecommnader: React.FC = () => {

    const { enqueueSnackbar } = useSnackbar();

    //Resto recommander
    const [loadingRestoRecommander, setLoadingRestoRecommander] = useState(false);
    const [newRestoRecoSection, setRestoRecoSection] = useState(0);
    const [restoReco, setRestoReco] = useState<RestoRecommander[]>([]);

    //restoReco
    useEffect(() => {
        setLoadingRestoRecommander(true)
        setRestoReco([])
        setRestoRecoSection(0)

        getRestoRecommander()
            .then((data) => {
                console.log("RESTO RECOMMANDER ICI........", data)
                setRestoReco(data)
                setLoadingRestoRecommander(false)

            })
            .catch(() => {
                enqueueSnackbar('Erreur lors du chargement des restaurants recommander');
            });
    }, [enqueueSnackbar]);

    // PlatReco

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


    return (
        <>{loadingRestoRecommander ? (
            <Loader />
        ) : !restoReco.length ? (
            <NoResult />
        ) : (
            <SliderContainer
                direction="horizontal"
                position={newRestoRecoSection}
            >

                {getChunks<RestoRecommander>(restoReco, chunkSize).map(
                    (restaurants, i) => (
                        <SliderSection index={i} key={i}>
                            <Grid container spacing={4} style={{ padding: '24px' }}>
                                {restaurants
                                    .sort((a: any, b: any) => a.priority - b.priority)
                                    .map((restaurant) => (
                                        <Grid
                                            key={restaurant._id}
                                            item
                                            xs={12}
                                            sm={6}
                                            md={4}
                                            lg={3}
                                        >
                                            <RestaurantCard item={restaurant?.restaurant} />
                                        </Grid>
                                    ))}
                            </Grid>
                        </SliderSection>
                    )
                )}
            </SliderContainer>
        )}

        </>
    );
};

export default RestoRecommnader;
