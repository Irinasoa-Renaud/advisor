
import {
    Button,
    FormControlLabel,
    Grid,
    makeStyles,
    Paper,
} from '@material-ui/core';
import { AspectRatioOutlined } from '@material-ui/icons';
import { useSnackbar } from 'notistack';
import React, { useCallback, useEffect, useState } from 'react';
import PageHeader from '../components/Admin/PageHeader';
import IOSSwitch from '../components/Common/IOSSwitch';
import View from '../models/View.model';
import { useAuth } from '../providers/authentication';
import EventEmitter from '../services/EventEmitter';
import { getView, updateView } from '../services/View';

const useStyles = makeStyles((theme) => ({
    root: {
        padding: theme.spacing(2),
    },
}));

const ViewList: React.FC = () => {
    const classes = useStyles();

    const [loading, setLoading] = useState<boolean>(false);
    const [view, setView] = useState<View>()

    const { user, isAdmin } = useAuth();

    const { enqueueSnackbar } = useSnackbar();

    const fetch = useCallback(() => {
        setLoading(true);
        getView()
            .then((data) => {
                setView(data);
            })
            .catch(() => {
                enqueueSnackbar('Erreur lors du chargement des données...', {
                    variant: 'error',
                });
            })
            .finally(() => {
                setLoading(false);
            });
    }, [enqueueSnackbar]);

    useEffect(() => {
        const onRefresh = () => {
            fetch();
        };

        EventEmitter.on('REFRESH', onRefresh);
        return () => {
            EventEmitter.removeListener('REFRESH', onRefresh);
        };
    }, [fetch]);

    const handleChange = useCallback(
        (e) => {
            setView((v) => {
                return {
                    _id: view?._id,
                    [e.target.name]: e.target.checked,
                    [e.target.name === 'grid' ? 'list' : 'grid']: !e.target.checked
                } as any
            })
        },
        [view]
    )

    const handleUpdate = useCallback(
        () => {
            setLoading(true);
            updateView(view?._id || '', { grid: view?.grid, list: view?.list })
                .then(() => {
                    enqueueSnackbar('Style updaté', {
                        variant: 'success',
                    });
                    setLoading(false);
                })
        },
        [view, enqueueSnackbar]
    )

    useEffect(() => {
        fetch();
    }, [fetch]);

    return (
        <>
            <PageHeader
                title="Style"
                subTitle="Style d'affichage en Grille ou en Liste"
                icon={AspectRatioOutlined}
            />
            <Paper className={classes.root}>
                <Grid container spacing={2}>
                    {view && <Grid item xs={12} md={6}>
                        <FormControlLabel
                            control={
                                <IOSSwitch
                                    checked={view?.grid}
                                    onChange={handleChange}
                                    name="grid"
                                />
                            }
                            label="Vue en GRID"
                        />
                        <FormControlLabel
                            control={
                                <IOSSwitch
                                    checked={view?.list}
                                    onChange={handleChange}
                                    name="list"
                                />
                            }
                            label="Vue en LISTE"
                        />
                    </Grid>}
                    <Grid item container justify="flex-end" alignItems="center" xs={12}>
                        <Button
                            variant="contained"
                            color="secondary"
                            size="large"
                            style={{ textTransform: 'none' }}
                            onClick={handleUpdate}
                            disabled={loading}
                        >
                            Modifier
                        </Button>
                    </Grid>
                </Grid>
            </Paper>
        </>
    );
};

export default ViewList;
