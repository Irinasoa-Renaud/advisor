import React, { useCallback, useEffect, useRef, useState } from 'react';
import { makeStyles, Paper, TableCell } from '@material-ui/core';
import PageHeader from '../components/Admin/PageHeader';
import { List as ListIcon } from '@material-ui/icons';
import MenuTitle from '../models/MenuTitle.model';
import {
    addMenuTitle,
    deleteMenuTitle,
    getMenuTitles,
    updateMenuTitle,
} from '../services/menuTitle';
import { useSnackbar } from 'notistack';
import EventEmitter from '../services/EventEmitter';
import useDeleteSelection from '../hooks/useDeleteSelection';
import FormDialog from '../components/Common/FormDialog';
import MenuTitleForm, {
    MenuTitleFormType,
} from '../components/Forms/MenuTitleForm';
import EditButton from '../components/Common/EditButton';
import DeleteButton from '../components/Common/DeleteButton';
import useDelete from '../hooks/useDelete';
import TableContainer, { HeadCell } from '../components/Table/TableContainer';
import { Loading } from '../components/Common';
import { useAuth } from '../providers/authentication';
import { updateRestaurant } from '../services/restaurant';


const useStyles = makeStyles((theme) => ({
    root: {
        padding: theme.spacing(2),
    },
}));


const headCells: HeadCell<MenuTitle>[] = [
    {
        id: 'name',
        label: 'Nom',
        disableSorting: true,
    },
    {
        id: 'restaurant',
        label: 'Restaurant',
        disableSorting: true,
    },
];

const MenuTitleListPage: React.FC = () => {
    const classes = useStyles();

    const { isAdmin, isRestaurantAdmin, restaurant } = useAuth();

    const [loading, setLoading] = useState<boolean>(false);
    const [records, setRecords] = useState<MenuTitle[]>([]);
    const [openForm, setOpenForm] = useState<boolean>(false);
    const [saving, setSaving] = useState<boolean>(false);
    const [selected, setSelected] = useState<string[]>([]);
    const [updating, setUpdating] = useState<boolean>(false);
    const modif = useRef<MenuTitleFormType>();

    const { enqueueSnackbar } = useSnackbar();
    const { handleDeleteSelection } = useDeleteSelection(
        deleteMenuTitle,
        selected,
        {
            onDeleteRecord: (id) =>
                setRecords((v) => v.filter(({ _id }) => _id !== id)),
        },
    );
    const { handleDelete } = useDelete(deleteMenuTitle);

    const fetch = useCallback(() => {
        setLoading(true);
        setRecords([]);
        const filter = (isRestaurantAdmin && restaurant) ? { restaurant: restaurant._id } : undefined
        getMenuTitles(filter)
            .then((data: any) => {
                setRecords(data);
            })
            .catch(() => {
                enqueueSnackbar('Erreur lors du chargement...', { variant: 'error' });
            })
            .finally(() => {
                setLoading(false);
            });
    }, [enqueueSnackbar, isRestaurantAdmin, restaurant]);

    const saveData = useCallback(
        (data: MenuTitleFormType) => {
            setSaving(true);
            if (modif.current && data._id)
                updateMenuTitle(data._id, data)
                    .then(async () => {
                        enqueueSnackbar('Type modifié avec succès', {
                            variant: 'success',
                        });
                        setOpenForm(false);
                        EventEmitter.emit('REFRESH');
                    })
                    .catch(() => {
                        enqueueSnackbar('Erreur lors de la modification', {
                            variant: 'error',
                        });
                    })
                    .finally(() => {
                        modif.current = undefined;
                        setSaving(false);
                    });
            else
                addMenuTitle(data)
                    .then(async (res: any) => {
                        await updateRestaurant(res.data.restaurant, { foodTypes: [res.data._id] });
                        enqueueSnackbar('Type ajouté avec succès', {
                            variant: 'success',
                        });
                        setOpenForm(false);
                        EventEmitter.emit('REFRESH');
                    })
                    .catch(() => {
                        enqueueSnackbar("Erreur lors de l'ajout", {
                            variant: 'error',
                        });
                    })
                    .finally(() => {
                        modif.current = undefined;
                        setSaving(false);
                    });
        },
        [enqueueSnackbar],
    );

    const showModification = useCallback((menuTitle: MenuTitle) => {
        const {
            _id,
            priority,
            name: { fr: name },
            restaurant
        } = menuTitle;

        modif.current = {
            _id,
            priority,
            name,
            restaurant: restaurant?._id || ''
            // restaurant,

        };
        setOpenForm(true);
    }, []);

    useEffect(() => {
        const onRefresh = () => {
            fetch();
        };

        EventEmitter.on('REFRESH', onRefresh);

        return () => {
            EventEmitter.removeListener('REFRESH', onRefresh);
        };
    }, [fetch]);

    useEffect(() => {
        fetch();
    }, [fetch]);

    return (
        <>
            <PageHeader title="Titres" subTitle="Liste des titres" icon={ListIcon} />
            <Paper className={classes.root}>
                <TableContainer
                    headCells={headCells}
                    records={records}
                    selected={selected}
                    onSelectedChange={setSelected}
                    onDeleteClick={() => {
                        setUpdating(true);
                        handleDeleteSelection().finally(() => setUpdating(false));
                    }}
                    addButtonLabel="Ajouter un titre"
                    onAddClick={() => setOpenForm(true)}
                    loading={loading}
                    emptyPlaceholder="Aucun restaurant"
                    options={{
                        selectableRows: isAdmin,
                        orderBy: 'priority',
                        order: 'asc',
                        enableDragAndDrop: true,
                        hasActionsColumn: true,
                        customResolvers: {
                            name: (ft) => ft.name.fr,
                        },
                        filters: [
                            {
                                id: 'name',
                                label: 'Nom',
                                type: 'STRING',
                            },
                            {
                                id: 'restaurant',
                                label: 'Restaurant',
                                type: 'RESTAURANT',
                                alwaysOn: isRestaurantAdmin ? false : true,
                            },
                        ],
                        onDragEnd: (source, destination) =>
                            setRecords((records) => {
                                const p1 = source.priority,
                                    p2 = destination.priority;

                                if (p1 > p2) {
                                    // Queueing up
                                    records
                                        .filter(({ priority }) => priority >= p2 && priority < p1)
                                        .forEach((v) => {
                                            v.priority++;
                                            updateMenuTitle(v._id, { priority: v.priority });
                                        });
                                } else {
                                    // Queueing down
                                    records
                                        .filter(({ priority }) => priority > p1 && priority <= p2)
                                        .forEach((v) => {
                                            v.priority--;
                                            updateMenuTitle(v._id, { priority: v.priority });
                                        });
                                }
                                source.priority = p2;
                                updateMenuTitle(source._id, { priority: p2 });

                                return [...records];
                            }),
                        customComparators: {
                            name: (a, b) => b.name.fr.localeCompare(a.name.fr),
                        },
                        selectOnClick: false,
                        onRowClick: (_, foodType) => showModification(foodType),
                    }}
                >
                    {(foodType) => {
                        const {
                            _id,
                            name: { fr: name },
                            restaurant,
                        } = foodType;

                        return (
                            <React.Fragment key={_id}>
                                <TableCell>{name}</TableCell>
                                <TableCell>{restaurant?.name}</TableCell>
                                <TableCell>
                                    <EditButton
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            showModification(foodType);
                                        }}
                                    />
                                    <DeleteButton
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setUpdating(true);
                                            handleDelete(_id)
                                                .then(() =>
                                                    setRecords((v) =>
                                                        v.filter(({ _id: id }) => _id !== id),
                                                    ),
                                                )
                                                .finally(() => setUpdating(false));
                                        }}
                                    />
                                </TableCell>
                            </React.Fragment>
                        );
                    }}
                </TableContainer>
            </Paper>
            <FormDialog
                title={modif.current ? 'Modifier un titre' : 'Ajouter un titre'}
                onClose={() => {
                    setOpenForm(false);
                    if (modif) modif.current = undefined;
                }}
                open={openForm}
            >
                <MenuTitleForm
                    initialValues={modif.current}
                    isUpdate={modif.current ? true : false}
                    saving={saving}
                    onSave={saveData}
                    onCancel={() => setOpenForm(false)}
                />
            </FormDialog>

            <Loading
                open={updating}
                semiTransparent
                backgroundColor="rgba(0, 0, 0, .7)"
            />
        </>
    );
};

export default MenuTitleListPage;
