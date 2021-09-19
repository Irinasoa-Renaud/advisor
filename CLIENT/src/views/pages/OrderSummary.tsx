import React from 'react';
import Footer from '../../components/layouts/Footer';
import Navbar from '../../components/layouts/Navbar';
import {
  Avatar,
  Chip,
  Container,
  Divider,
  Grid,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  ListSubheader,
  Typography,
  useTheme,
} from '@material-ui/core';
import { CartState } from '../../redux/types/cart';
import { Redirect } from 'react-router';
import { makeStyles } from '@material-ui/core/styles';
import { LocationOn, Phone } from '@material-ui/icons';
import { green, orange, red } from '@material-ui/core/colors';
import { estimateMenuPrice } from '../../services/cart';
import PlatRecommander from '../../components/PlatRecommander'
import clsx from 'clsx';
import { Link } from 'react-router-dom';
import moment from 'moment';

const useStyles = makeStyles((theme) => ({
  root: {
    marginTop: theme.spacing(2),
    marginBottom: theme.spacing(14),
  },
  restaurantImage: {
    width: 140,
    height: 140,
  },
  divider: {
    margin: theme.spacing(2, 0),
  },
  commandId: {
    color: theme.palette.primary.main,
  },
  status: {
    backgroundColor: orange[400],
    color: 'white',
    '&.active': {
      backgroundColor: green[400],
    },
    '&.revoked': {
      backgroundColor: red[400],
    },
  },
  itemPrice: {
    fontSize: 14,
    fontFamily: 'Work Sans',
  },
  totalPrice: {
    fontSize: 18,
    color: theme.palette.primary.main,
    fontFamily: 'Work Sans',
  },
}));

export interface OrderSummaryProps extends CartState {
  code: number;
  commandType: any;
  validated: boolean;
  revoked: boolean;
  comment: string;
  shippingTime: Date;
  priceLivraison: any;

}

const OrderSummary: React.FC<OrderSummaryProps> = ({
  children,
  priceLivraison,
  ...command
}) => {
  const classes = useStyles();

  const theme = useTheme();

  if (!command) return <Redirect to="/home" />;

  return (
    <>
      <Navbar hideCart hideSearchField />
      <Container maxWidth="md" className={classes.root}>
        <Grid container direction="column">
          <Divider className={classes.divider} />

          <Grid item container spacing={2} alignItems="center">
            <Grid item>
              <Avatar
                className={classes.restaurantImage}
                src={command.restaurant?.imageURL}
                alt={command.restaurant?.name}
              />
            </Grid>
            <Grid item xs container direction="column">
              <Grid item>
                <Typography
                  component={Link}
                  to={`/restaurants/${command.restaurant?._id}`}
                  style={{ color: 'black' }}
                  variant="h5"
                >
                  {command.restaurant?.name}
                </Typography>
              </Grid>
              <Grid item container alignItems="center">
                <Grid item>
                  <LocationOn fontSize="small" />
                </Grid>
                <Grid item xs>
                  <Typography
                    variant="h6"
                    component={Link}
                    to={`/restaurants/${command.restaurant?._id}/route`}
                    style={{ color: 'black' }}
                  >
                    {command.restaurant?.address}
                  </Typography>
                </Grid>
              </Grid>
              <Grid container alignItems="center">
                <Grid item>
                  <Phone fontSize="small" />
                </Grid>
                <Grid item xs>
                  <Typography
                    variant="h6"
                    component="a"
                    style={{ color: 'black' }}
                    href={`tel:${command.restaurant?.phoneNumber}`}
                  >
                    {command.restaurant?.phoneNumber}
                  </Typography>
                </Grid>
              </Grid>
            </Grid>
          </Grid>

          <Divider className={classes.divider} />

          <Grid item container justify="space-between">
            <Grid item>
              <Typography variant="h6" component="p">
                {'ID de commande: '}
                <span className={classes.commandId}>{command.code}</span>
              </Typography>
            </Grid>
            <Grid item>
              <Chip
                className={clsx(classes.status, {
                  active: !!command.validated,
                  revoked: !!command.revoked,
                })}
                label={
                  <span className="translate">
                    {command.validated
                      ? 'Validée'
                      : command.revoked
                        ? 'Refusée'
                        : 'En attente'}
                  </span>
                }
              />
            </Grid>
          </Grid>

          <Divider className={classes.divider} />

          {!!command.foods?.length && (
            <List
              subheader={
                <ListSubheader className="translate">
                  Liste des plats commandés
                </ListSubheader>
              }
            >
              {command.foods.map((food) => {
                const {
                  item: {
                    imageURL,
                    name,
                    price: { amount },
                  },
                  options,
                  quantity,
                } = food;

                let quantity_food = quantity;

                return (
                  <>
                    <ListItem>
                      <ListItemAvatar>
                        <Grid container alignItems="center">
                          <Typography style={{ width: 40 }} align="center">
                            {quantity} X
                          </Typography>
                          <Avatar src={imageURL} alt={name} />
                        </Grid>
                      </ListItemAvatar>
                      <ListItemText style={{ marginLeft: theme.spacing(2) }}>
                        <Grid item container justify="space-between">
                          <Grid item>
                            <Typography
                              align="left"
                            >
                              {name}<br />
                              {(amount || 0) !== 0 && (
                                <Typography>{`€${(
                                  ((amount || 0)) /
                                  100
                                ).toLocaleString(undefined, {
                                  minimumFractionDigits: 1,
                                })}`}</Typography>
                              )}
                            </Typography>
                          </Grid>
                          <Grid item>
                            {(amount || 0) * quantity !== 0 && (
                              <Typography>{`€${(
                                ((amount || 0) * quantity) /
                                100
                              ).toLocaleString(undefined, {
                                minimumFractionDigits: 1,
                              })}`}</Typography>
                            )}
                          </Grid>
                        </Grid>
                      </ListItemText>
                    </ListItem>

                    <Divider />

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
                              <Typography style={{ fontWeight: 'bold' }}>
                                {title}
                              </Typography>
                              <Grid
                                container
                                alignItems="center"
                                justify="space-between"
                              >
                                <Grid item container xs direction="column">
                                  {items.map(({ item, quantity }) => (
                                    <Grid
                                      item
                                      xs
                                      container
                                      style={{
                                        paddingLeft: theme.spacing(4),
                                      }}
                                    >
                                      <Grid item style={{ fontWeight: 'bold' }}>
                                        {quantity} X
                                      </Grid>
                                      <Grid
                                        item
                                        style={{
                                          marginLeft: theme.spacing(2),
                                        }}
                                      >
                                        <Typography
                                          align="left"
                                          className={classes.itemPrice}
                                        >
                                          {item.name}<br />
                                          {`€${(item.price?.amount / 100).toLocaleString(undefined, { minimumFractionDigits: 1 })}`}
                                        </Typography>
                                      </Grid>
                                    </Grid>
                                  ))}
                                </Grid>
                                {(items.reduce((p, c) => p + c.quantity * (c.item.price?.amount || 0), 0) / 100) !== 0 && (<Grid item>
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
                                      <Typography
                                        align="left"
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
                                    )}
                                </Grid>)}
                              </Grid>
                            </Grid>
                          )
                      )}
                    </Grid>
                  </>
                );
              })}
            </List>
          )}

          <Divider className={classes.divider} />

          {!!command.menus.length && (
            <>
              <List
                subheader={
                  <ListSubheader className="translate">
                    Liste des menus commandés
                  </ListSubheader>
                }
              >
                {command.menus.map((menu) => {
                  const {
                    item: { imageURL, name },
                    quantity,
                  } = menu;

                  return (
                    <>
                      <ListItem>
                        <ListItemAvatar>
                          <Grid container alignItems="center">
                            <Typography style={{ width: 40 }} align="center">
                              {quantity}
                            </Typography>
                            <Avatar src={imageURL} alt={name} />
                          </Grid>
                        </ListItemAvatar>
                        <ListItemText style={{ marginLeft: theme.spacing(2) }}>
                          <Grid container justify="space-between">
                            <Grid item>
                              <Typography>{name}</Typography>
                            </Grid>
                            <Grid item>
                              {estimateMenuPrice(menu, menu.item.type === 'fixed_price' ? true : false) !== 0 && (
                                <Typography>{`€${(
                                  estimateMenuPrice(menu, menu.item.type === 'fixed_price' ? true : false) / 100
                                ).toLocaleString(undefined, {
                                  minimumFractionDigits: 1,
                                })}`}</Typography>
                              )}
                            </Grid>
                          </Grid>
                        </ListItemText>
                      </ListItem>

                      <Divider />

                      <div style={{ marginLeft: theme.spacing(14) }}>
                        {menu.foods.map(
                          ({
                            options,
                            food: {
                              imageURL,
                              name,
                              price: { amount: price },
                            },
                          }) => (
                            <>
                              <ListItem>
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
                                    {price && price !== 0 && (
                                      <Grid item>
                                        <Typography>{`€${(
                                          price / 100
                                        ).toLocaleString(undefined, {
                                          minimumFractionDigits: 1,
                                        })}`}</Typography>
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
                                          style={{ fontWeight: 'bold' }}
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
                                                  style={{ fontWeight: 'bold' }}
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
                                          {(items.reduce((p, c) => p + c.quantity * (c.item.price?.amount || 0), 0) / 100) !== 0 && <Grid item>
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
                                          </Grid>}
                                        </Grid>
                                      </Grid>
                                    )
                                )}
                              </Grid>
                            </>
                          )
                        )}
                      </div>
                    </>
                  );
                })}
              </List>
              <Divider className={classes.divider} />
            </>
          )}


          {command.commandType === 'delivery' && (<Grid container justify="space-between" alignItems="center">
            <Grid item>
              <Typography className="translate">Frais de livraison</Typography>
            </Grid>
            <Grid item>
              <Typography>{`€${(
                (priceLivraison || 0)
              ).toLocaleString(undefined, {
                minimumFractionDigits: 1,
              })}`}</Typography>
            </Grid>
          </Grid>)}

          {command.totalPrice !== 0 && <Grid container justify="space-between" alignItems="center">
            <Grid item>
              <Typography className="translate">Total</Typography>
            </Grid>
            <Grid item>
              <Typography className={classes.totalPrice}>{`€${(
                command.totalPrice / 100
              ).toLocaleString(undefined, {
                minimumFractionDigits: 1,
              })}`}</Typography>
            </Grid>
          </Grid>}

          <Divider className={classes.divider} />

          {(command.commandType === 'delivery' || command.commandType === 'takeaway') && <Grid container justify="space-between" alignItems="center">
            <Grid item>
              <Typography className="translate">{command.commandType === 'delivery' ? "Heure de livraison" : "Heure de retrait"}</Typography>
            </Grid>
            <Grid item>
              <Typography
                variant="h6"
                component="p"
              >
                {moment(command.shippingTime).format('MMMM Do YYYY, h:mm')}
              </Typography>
            </Grid>
          </Grid>}

          <Grid container justify="space-between" alignItems="center">
            <Grid item>
              <Typography className="translate">Type de commande</Typography>
            </Grid>
            <Grid item>
              <Typography
                variant="h6"
                component="p"
                style={{ textTransform: 'uppercase' }}
              >
                {command.commandType === 'delivery'
                  ? 'Livraison'
                  : command.commandType === 'on_site'
                    ? 'Sur place'
                    : 'À emporter'}
              </Typography>
            </Grid>
          </Grid>

          <Divider className={classes.divider} />

          <Typography
            variant="h6"
            className="translate"
            gutterBottom
            style={{ textDecoration: 'underline' }}
          >
            Commentaire
          </Typography>

          <Typography style={{ color: !command.comment ? 'grey' : 'black' }}>
            {command.comment || 'Aucun commentaire'}
          </Typography>
        </Grid>
      </Container>
      <div style={{
        margin: '2vh auto',
        width: '90%'
      }}>
        <PlatRecommander
          clsx={clsx}
          Link={Link}
          title="Plats recommander"
        />
      </div>
      <Footer mini />
    </>
  );
};

export default OrderSummary;
