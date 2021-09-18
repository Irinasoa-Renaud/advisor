import React, { useCallback, useEffect, useState } from 'react';
import {
  Box,
  Button,
  FormControl,
  FormControlLabel,
  IconButton,
  InputLabel,
  lighten,
  makeStyles,
  Menu,
  MenuItem,
  Select,
  TextField,
  Toolbar,
  Tooltip,
  Typography,
} from '@material-ui/core';
import clsx from 'clsx';
import {
  AddCircle as AddCircleIcon,
  Close,
  Delete as DeleteIcon,
  FilterList as FilterListIcon,
} from '@material-ui/icons';
import RotateLeftIcon from '@material-ui/icons/RotateLeft';
import IOSSwitch from '../Common/IOSSwitch';
import CustomScrollbar from 'react-custom-scrollbars';
import DateRangeFilter from './DateRangeFilter';
import moment from 'moment';
import { getRestaurants } from '../../services/restaurant';
import EuroSymbolIcon from '@material-ui/icons/EuroSymbol';

const useToolbarStyles = makeStyles((theme) => ({
  root: {
    paddingLeft: theme.spacing(2),
    paddingRight: theme.spacing(1),
  },
  highlight:
    theme.palette.type === 'light'
      ? {
        color: theme.palette.secondary.main,
        backgroundColor: lighten(theme.palette.secondary.light, 0.85),
      }
      : {
        color: theme.palette.text.primary,
        backgroundColor: theme.palette.secondary.dark,
      },
  title: {
    flex: '1 1 100%',
  },
  addBtn: {
    flexShrink: 0,
    marginRight: theme.spacing(2),
    textTransform: 'none',
  },
  filterContainer: {
    '&>:first-child': {
      display: 'flex',
      flexWrap: 'nowrap',
      alignItems: 'center',
    },
    '&>:first-child>*': {
      flexShrink: 0,
    },
  },
}));


export type FilterType =
  | 'STRING'
  | 'DATE'
  | 'BOOLEAN'
  | 'SWITCH'
  | 'NUMBER'
  | 'NUMBER_INTERVAL'
  | 'COMMAND_TYPE'
  | 'CATEGORY'
  | 'ATTRIBUTES'
  | 'RESTAURANT'
  | 'TYPE_PLAT'
  | 'PRICE'
  | 'ALLERGENE'
  ;

export type FilterSwitchOption = {
  label: string;
  value: string;
};

type Filter<T> = {
  id: any;
  label: string;
  alwaysOn?: boolean;
} & (
    | {
      type: 'STRING' |
      'DATE' |
      'NUMBER' |
      'CATEGORY' |
      'COMMAND_TYPE' |
      'RESTAURANT' |
      'ATTRIBUTES' |
      'TYPE_PLAT' |
      'PRICE' |
      'ALLERGENE'

    }
    | {
      type: 'BOOLEAN';
    }
    | {
      type: 'SWITCH';
      options: FilterSwitchOption[];
    }
    | {
      type: 'NUMBER_INTERVAL';
      minLabel?: string;
      maxLabel?: string
    }
    | {
      type: 'PRICE';
      minLabel?: string;
      maxLabel?: string
    }
  );

export type Filters<T> = Filter<T>[];

export type FilterValue = {
  value?: string | number | boolean;
  category?: string;
  startDate?: Date;
  endDate?: Date;
  price?: Number;
  min?: Number;
  max?: Number;
  restaurant?: string;
  attributes?: string;
  allergene?: string;
};

export type FilterValues<T> = {
  [key in keyof T]?: FilterValue;
};

interface TableToolbarProps<T> {
  showAddButton?: boolean;
  addButtonLabel?: string;
  numSelected: number;
  onAddClick?: React.MouseEventHandler<HTMLButtonElement> | undefined;
  onDeleteClick?: React.MouseEventHandler<HTMLButtonElement> | undefined;
  filters?: Filters<T>;
  onFilterValuesChange?: (id: string, value: FilterValue) => void;
  activatedFilters?: string[];
  onActivateFilter?: (id: string, type: FilterType) => void;
  onDeactivateFilter?: (id: string) => void;
  filterValues: FilterValues<T>;
  setFilterValues: (e: any) => void;
}

function TableToolbar<T>(props: TableToolbarProps<T>) {
  const {
    numSelected,
    showAddButton = true,
    addButtonLabel = 'Ajouter',
    onAddClick,
    onDeleteClick,
    filters = [],
    activatedFilters = [],
    onActivateFilter,
    onDeactivateFilter,
    filterValues,
    onFilterValuesChange,
    setFilterValues
  } = props;

  const classes = useToolbarStyles();

  const [filterAnchor, setFilterAnchor] = useState<HTMLButtonElement>();
  const [activeButtonId, setActiveButtonId] = useState<number>(2);

  const [restoOptions, setRestoOptions] = useState<any[]>([]);
  const [activeType, setActiveType] = useState<boolean>(false);
  const [restaurantSelected, setRestaurantSelected] = useState<any>(false);
  const [foodType, setFoodType] = useState<any[]>([]);

  const noDuplicate = (foods: any[]) => {

    const listFoods: any[] = [];

    for (let i = 0; i < foods.length; i++) {

      for (let a = 0; a < foods[i].foodTypes.length; a++) {
        listFoods.push({
          ...foods[i].foodTypes[a],
          restoName: foods[i].name
        });
      }

    }

    return listFoods
      .map((items: any) => listFoods
        .includes(items) ? items : null)
      .filter((items: any) => items !== null)

  }

  useEffect(() => {

    getRestaurants()
      .then((data: any) => {
        setFoodType(noDuplicate(data).map((d: any) => ({ label: d.name.fr, value: d.name.fr, restoName: d.restoName })));
        setRestoOptions(data.map((d: any) => ({ label: d.name, value: d.name })) || [])
      });

    filters
      .filter(({ alwaysOn }) => !!alwaysOn)
      .forEach(({ id, type }) => {
        onActivateFilter?.(id as string, type);
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [setRestaurantSelected]);

  const autoDate = (id: any, setActiveButtonId: any) => {
    onFilterValuesChange?.(id as string, {
      startDate: moment().subtract(6, 'days').toDate(),
      endDate: new Date(),
    })
    setActiveButtonId(2)
  }

  const renderFilters = useCallback(() => {
    const commandTypeOptions = [
      { label: 'Livraison', value: 'delivery' },
      { label: 'À emporter', value: 'takeaway' },
      { label: 'Sur place', value: 'on_site' }
    ]
    return (
      <CustomScrollbar
        style={{
          width: '100%',
        }}
        autoHide
        className={classes.filterContainer}
      >
        {activatedFilters
          .map((id) => filters.find(({ id: d }) => d === id))
          .map((filter: any) => {
            if (filter) {
              const { id, label, alwaysOn } = filter;

              if (filter.type === 'ATTRIBUTES') {
                return (
                  <React.Fragment key={id as string}>
                    <TextField
                      placeholder={label}
                      value={
                        filterValues[id as keyof T]?.attributes || ''
                      }
                      onChange={({ target: { value } }) => {
                        onFilterValuesChange?.(id as string, {
                          attributes: value,
                        })
                      }
                      }
                    />
                    {!alwaysOn && (
                      <IconButton
                        onClick={() => onDeactivateFilter?.(id as string)}
                      >
                        <Close />
                      </IconButton>
                    )}
                  </React.Fragment>
                );
              }


              if (filter.type === 'ALLERGENE') {
                return (
                  <React.Fragment key={id as string}>
                    <TextField
                      placeholder={label}
                      value={
                        filterValues[id as keyof T]?.allergene || ''
                      }
                      onChange={({ target: { value } }) => {
                        onFilterValuesChange?.(id as string, {
                          allergene: value,
                        })
                      }
                      }
                    />
                    {!alwaysOn && (
                      <IconButton
                        onClick={() => onDeactivateFilter?.(id as string)}
                      >
                        <Close />
                      </IconButton>
                    )}
                  </React.Fragment>
                );
              }

              if (filter.type === 'STRING' || filter.type === 'CATEGORY')
                return (
                  <React.Fragment key={id as string}>
                    <TextField
                      placeholder={label}
                      value={
                        filter.type === 'STRING'
                          ? filterValues[id as keyof T]?.value || ''
                          : filterValues[id as keyof T]?.category || ''
                      }
                      onChange={({ target: { value } }) => {
                        filter.type === 'STRING'
                          ? onFilterValuesChange?.(id as string, { value })
                          : onFilterValuesChange?.(id as string, { category: value })
                      }
                      }
                    />
                    {!alwaysOn && (
                      <IconButton
                        onClick={() => onDeactivateFilter?.(id as string)}
                      >
                        <Close />
                      </IconButton>
                    )}
                  </React.Fragment>
                );
              else if (filter.type === 'BOOLEAN')
                return (
                  <FormControlLabel
                    key={id as string}
                    label={
                      <>
                        {label}
                        {!alwaysOn && (
                          <IconButton
                            onClick={() => onDeactivateFilter?.(id as string)}
                          >
                            <Close />
                          </IconButton>
                        )}
                      </>
                    }
                    control={
                      <IOSSwitch
                        checked={
                          (filterValues[id as keyof T]?.value as
                            | boolean
                            | undefined) || false
                        }
                        onChange={(_, c) =>
                          onFilterValuesChange?.(id as string, { value: c })
                        }
                      />
                    }
                  />
                );
              else if (filter.type === 'SWITCH')
                return (
                  <React.Fragment key={id as string}>
                    <Select
                      value={
                        (filterValues[id as keyof T]?.value as
                          | string
                          | undefined) || ''
                      }
                      onChange={({ target: { value } }) =>
                        onFilterValuesChange?.(id as string, {
                          value: value as string,
                        })
                      }
                    >
                      <MenuItem value="" disabled>
                        Sélectionner une option
                      </MenuItem>
                      {(filter.options as any).map((item: any) => (
                        <MenuItem key={item.value} value={item.value}>
                          {item.label}
                        </MenuItem>
                      ))}
                    </Select>
                    {!alwaysOn && (
                      <IconButton
                        onClick={() => onDeactivateFilter?.(id as string)}
                      >
                        <Close />
                      </IconButton>
                    )}
                  </React.Fragment>
                );
              else if (filter.type === 'NUMBER')
                return (
                  <React.Fragment key={id as string}>
                    <TextField
                      type="number"
                      placeholder={label}
                      value={filterValues[id as keyof T]?.value || ''}
                      onChange={({ target: { value } }) =>
                        onFilterValuesChange?.(id as string, {
                          value: Number(value),
                        })
                      }
                    />
                    {!alwaysOn && (
                      <IconButton
                        onClick={() => onDeactivateFilter?.(id as string)}
                      >
                        <Close />
                      </IconButton>
                    )}
                  </React.Fragment>
                );

              else if (filter.type === 'PRICE')
                return (
                  <React.Fragment key={id as string}>
                    <TextField
                      type="number"
                      variant="outlined"
                      style={{
                        margin: '0 0.25vh'
                      }}
                      placeholder={
                        filter.minLabel ? filter.minLabel : `Min ${label}`
                      }
                      value={(Number(filterValues[id as keyof T]?.min) / 100) || ''}
                      onChange={({ target: { value } }) =>
                        onFilterValuesChange?.(id as string, {
                          min: Number(value) * 100,
                          max: Number(filterValues[id as keyof T]?.max),
                        })
                      }
                      InputProps={{
                        startAdornment: <EuroSymbolIcon />,
                      }}
                    />
                    <TextField
                      type="number"
                      variant="outlined"
                      style={{
                        margin: '0 0.25vh'
                      }}
                      placeholder={
                        filter.maxLabel ? filter.maxLabel : `Max ${label}`
                      }
                      value={((Number(filterValues[id as keyof T]?.max)) / 100) || ''}
                      onChange={({ target: { value } }) => onFilterValuesChange?.(id as string, {
                        min: Number(filterValues[id as keyof T]?.min),
                        max: Number(value) * 100,
                      })}
                      InputProps={{
                        startAdornment: <EuroSymbolIcon />,
                      }}
                    />
                    {!alwaysOn && (
                      <IconButton
                        onClick={() => onDeactivateFilter?.(id as string)}
                      >
                        <Close />
                      </IconButton>
                    )}
                  </React.Fragment>
                );
              else if (filter.type === 'NUMBER_INTERVAL')
                return (
                  <React.Fragment key={id as string}>
                    <TextField
                      type="number"
                      variant="outlined"
                      placeholder={
                        filter.minLabel ? filter.minLabel : `Min ${label}`
                      }
                      value={filterValues[id as keyof T]?.min || ''}
                      onChange={({ target: { value } }) =>
                        onFilterValuesChange?.(id as string, {
                          min: Number(value),
                          max: filterValues[id as keyof T]?.max,
                        })
                      }
                    />
                    <TextField
                      type="number"
                      variant="outlined"
                      placeholder={
                        filter.maxLabel ? filter.maxLabel : `Max ${label}`
                      }
                      value={filterValues[id as keyof T]?.max || ''}
                      onChange={({ target: { value } }) =>
                        onFilterValuesChange?.(id as string, {
                          min: filterValues[id as keyof T]?.min,
                          max: Number(value),
                        })
                      }
                    />
                    {!alwaysOn && (
                      <IconButton
                        onClick={() => onDeactivateFilter?.(id as string)}
                      >
                        <Close />
                      </IconButton>
                    )}
                  </React.Fragment>
                );
              else if (filter.type === 'DATE')
                return (

                  <React.Fragment key={id as string}>

                    <DateRangeFilter
                      key={id as string}
                      value={{
                        startDate: moment().subtract(6, 'days').toDate(),
                        endDate: new Date(),
                      }}
                      onChange={(value) =>
                        onFilterValuesChange?.(id as string, value)
                      }
                    />
                    <div>
                      <Button
                        variant={activeButtonId === 0 ? 'contained' : 'outlined'}
                        color='primary'
                        size='small'
                        style={{ marginRight: '8px' }}
                        onClick={() => {
                          onFilterValuesChange?.(id as string, {
                            startDate: moment({ day: new Date().getDate(), hour: 0, minute: 0 }).toDate(),
                            endDate: moment().subtract(0, 'days').toDate(),
                          })
                          setActiveButtonId(0)
                        }}
                      >
                        <span>Aujourd'hui</span>
                      </Button>
                      <Button
                        variant={activeButtonId === 1 ? 'contained' : 'outlined'}
                        color='primary'
                        size='small'
                        style={{ marginRight: '8px' }}
                        onClick={() => {
                          onFilterValuesChange?.(id as string, {
                            startDate: moment({ day: new Date(new Date().setDate(new Date().getDate() - 1)).getDate(), hour: 0, minute: 0 }).toDate(),
                            endDate: moment({ day: new Date(new Date().setDate(new Date().getDate() - 1)).getDate(), hour: 0, minute: 0 }).toDate(),
                          })
                          setActiveButtonId(1)
                        }}
                      >
                        <span>Hier</span>
                      </Button>
                      <Button
                        variant={activeButtonId === 2 ? 'contained' : 'outlined'}
                        color='primary'
                        size='small'
                        style={{ marginRight: '8px' }}
                        onClick={() => {
                          onFilterValuesChange?.(id as string, {
                            startDate: moment().subtract(6, 'days').toDate(),
                            endDate: new Date(),
                          })
                          setActiveButtonId(2)
                        }}
                      >
                        <span>Derniers 7 jours</span>
                      </Button>
                      <Button
                        variant={activeButtonId === 3 ? 'contained' : 'outlined'}
                        color='primary'
                        size='small'
                        style={{ marginRight: '8px' }}
                        onClick={() => {
                          onFilterValuesChange?.(id as string, {
                            startDate: moment().subtract(29, 'days').toDate(),
                            endDate: new Date(),
                          })
                          setActiveButtonId(3)
                        }}
                      >
                        <span>Derniers 30 jours</span>
                      </Button>
                    </div>
                    {!alwaysOn && (
                      <IconButton
                        onClick={() => onDeactivateFilter?.(id as string)}
                      >
                        <Close />
                      </IconButton>
                    )}
                  </React.Fragment>
                );
              else if (filter.type === 'COMMAND_TYPE')
                return (
                  <React.Fragment key={id as string}>
                    <FormControl variant="filled" style={{ width: '200px' }}>
                      <InputLabel id="demo-simple-select-outlined-label" >Type de commande</InputLabel>
                      <Select
                        labelId="demo-simple-select-outlined-label"
                        id="demo-simple-select-outlined"
                        value={filterValues[id as keyof T]?.value || ''}
                        onChange={({ target: { value } }) =>
                          onFilterValuesChange?.(id as string, {
                            value: value as string,
                          })
                        }
                      >
                        {commandTypeOptions.map(({ label, value }, index) => (
                          <MenuItem key={index} value={value}>{label}</MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                    {!alwaysOn && (
                      <IconButton
                        onClick={() => onDeactivateFilter?.(id as string)}
                      >
                        <Close />
                      </IconButton>
                    )}
                  </React.Fragment>
                )
              else if (filter.type === 'RESTAURANT')
                return (
                  <React.Fragment key={id as string}>
                    <FormControl variant="filled" style={{ width: '200px', marginRight: '8px' }}>
                      <InputLabel id="demo-simple-select-outlined-label" >Nom du restaurant</InputLabel>
                      <Select
                        labelId="demo-simple-select-outlined-label"
                        id="demo-simple-select-outlined"
                        value={filterValues[id as keyof T]?.restaurant || ''}
                        onChange={({ target: { value } }) => {
                          onFilterValuesChange?.(id as string, {
                            restaurant: value as string,
                          })
                          setRestaurantSelected(value)
                          setActiveType(true)
                        }
                        }
                      >
                        {restoOptions.map(({ label, value }: any, index: number) => (
                          <MenuItem key={index} value={value}>{label}</MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                    {!alwaysOn && (
                      <IconButton
                        onClick={() => onDeactivateFilter?.(id as string)}
                      >
                        <Close />
                      </IconButton>
                    )}
                  </React.Fragment>
                )

              else if (filter.type === 'TYPE_PLAT')
                return (
                  <React.Fragment key={id as string}>

                    {activeType && (
                      <>
                        <FormControl variant="filled" style={{ width: '200px', marginRight: '8px' }}>
                          <InputLabel id="demo-simple-select-outlined-label" >Type</InputLabel>
                          <Select
                            labelId="demo-simple-select-outlined-label"
                            id="demo-simple-select-outlined"
                            value={filterValues[id as keyof T]?.restaurant || ''}
                            onChange={({ target: { value } }) =>
                              onFilterValuesChange?.(id as string, {
                                restaurant: value as string,
                              })
                            }
                          >
                            {foodType.filter((items: any) => items.restoName === restaurantSelected).map(({ label, value }: any, index: number) => (
                              <MenuItem key={index} value={value}>{label}</MenuItem>
                            ))}
                          </Select>
                        </FormControl>
                        {!alwaysOn && (
                          <IconButton
                            onClick={() => onDeactivateFilter?.(id as string)}
                          >
                            <Close />
                          </IconButton>
                        )}
                      </>
                    )}

                  </React.Fragment>
                )
            }

            return null;
          })}
      </CustomScrollbar>
    );
  }, [
    activatedFilters,
    classes.filterContainer,
    filterValues,
    filters,
    onDeactivateFilter,
    onFilterValuesChange,
    activeButtonId,
    restoOptions
  ]);

  return (
    <Toolbar
      className={clsx(classes.root, {
        [classes.highlight]: numSelected > 0,
      })}
    >
      {numSelected > 0 ? (
        <>
          <Typography
            className={classes.title}
            color="primary"
            variant="subtitle1"
            component="div"
          >
            {`${numSelected} ligne${numSelected > 1 ? 's' : ''} sélectionnée${numSelected > 1 ? 's' : ''
              }`}
          </Typography>
          <Tooltip title="Supprimer">
            <IconButton aria-label="delete" onClick={onDeleteClick}>
              <DeleteIcon />
            </IconButton>
          </Tooltip>
        </>
      ) : (
        <>
          {renderFilters()}
          <Box flex={1} />
          {showAddButton && (
            <Button
              variant="contained"
              color="primary"
              startIcon={<AddCircleIcon />}
              className={classes.addBtn}
              onClick={onAddClick}
            >
              {addButtonLabel}
            </Button>
          )}

          {(Object.keys(filterValues).length > 0) && (
            <Button
              variant="contained"
              color="secondary"
              startIcon={<RotateLeftIcon />}
              className={classes.addBtn}
              onClick={() => setFilterValues({})}

            >
              Reset
            </Button>
          )}

          <Tooltip title="Filtrer la liste">
            <IconButton
              aria-label="filter list"
              onClick={(e) => {
                !!filters.filter(
                  ({ id }) => !activatedFilters.find((k) => k === id),
                ).length && setFilterAnchor(e.currentTarget);
              }}
            >
              <FilterListIcon />
            </IconButton>
          </Tooltip>
          <Menu
            open={!!filterAnchor}
            onClose={() => setFilterAnchor(undefined)}
            anchorEl={filterAnchor}
          >

            {filters
              ?.filter(({ id }) => !activatedFilters.find((k) => k === id))
              .map(({ id, label, type }) => (
                <MenuItem
                  key={id as string}
                  onClick={() => {
                    setFilterAnchor(undefined);
                    onActivateFilter?.(id as string, type);
                  }}
                >
                  {label}
                </MenuItem>
              ))}
          </Menu>
        </>
      )}
    </Toolbar>
  );
}

export default TableToolbar;
