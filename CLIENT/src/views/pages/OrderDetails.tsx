import React, { useEffect, useState } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import { green, orange, red } from '@material-ui/core/colors';
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
import Command from '../../models/Command.model';
import { LocationOn, Phone } from '@material-ui/icons';
import Restaurant from '../../models/Restaurant.model';
import { FoodInCart, MenuInCart } from '../../redux/types/cart';
import { estimateMenuPrice } from '../../services/cart';
import clsx from 'clsx';
import Navbar from '../../components/layouts/Navbar';
import Footer from '../../components/layouts/Footer';
import { getCommandById } from '../../services/commands';
import Loading from '../../components/Loading';
import { Link } from 'react-router-dom';

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

interface OrderDetailsPageProps {
  id: string;
}

const OrderDetailsPage: React.FC<OrderDetailsPageProps> = ({ id }) => {
  const classes = useStyles();

  const theme = useTheme();

  const [command, setCommand] = useState<Command>();
  const [loading, setLoading] = useState(false);
  const [showPrice, setShowPrice] = useState<boolean>(true);

  useEffect(() => {
    setLoading(true);

    getCommandById(id).then((command) => {
      setCommand(command);
      setShowPrice(command.totalPrice === 0 ? false : true)
      setLoading(false);
    });
  }, [id]);

  return (
    <>
      <Navbar elevation={0} hideCart hideSearchField />
      {command && (
        <Container maxWidth="md" className={classes.root}>
          <Grid container direction="column">
            <Divider className={classes.divider} />

            <Grid item container spacing={2} alignItems="center">
              <Grid item>
                <Avatar
                  className={classes.restaurantImage}
                  src={(command.restaurant as Restaurant).imageURL}
                  alt={(command.restaurant as Restaurant).name}
                />
              </Grid>
              <Grid item xs container direction="column">
                <Grid item>
                  <Typography
                    component={Link}
                    to={`/restaurants/${(command.restaurant as Restaurant)._id
                      }`}
                    style={{ color: 'black' }}
                    variant="h5"
                  >
                    {(command.restaurant as Restaurant).name}
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
                      to={`/restaurants/${(command.restaurant as Restaurant)._id
                        }/route`}
                      style={{ color: 'black' }}
                    >
                      {(command.restaurant as Restaurant).address}
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
                      href={`tel:${(command.restaurant as Restaurant).phoneNumber
                        }`}
                    >
                      {(command.restaurant as Restaurant).phoneNumber}
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

            {!!command.items.length && (
              <List
                subheader={
                  <ListSubheader disableGutters className="translate">
                    Liste des plats commandés
                  </ListSubheader>
                }
              >
                {(command.items as FoodInCart[]).map((food) => {
                  const {
                    item: {
                      imageURL,
                      name,
                      price: { amount },
                    },
                    options,
                    quantity,
                  } = food as FoodInCart;

                  let quantity_food = quantity;
                  return (
                    <>
                      <ListItem disableGutters>
                        <ListItemAvatar>
                          <Grid container alignItems="center">
                            <Typography style={{ width: 40 }} align="center">
                              {quantity} X
                            </Typography>
                            <Avatar
                              src={imageURL}
                              alt={
                                ((name as unknown) as { [key: string]: string })
                                  .fr
                              }
                            />
                          </Grid>
                        </ListItemAvatar>
                        <ListItemText style={{ marginLeft: theme.spacing(2) }}>
                          <Grid item container justify="space-between">
                            <Grid item>
                              <Typography
                                align="left"
                              >
                                {
                                  ((name as unknown) as {
                                    [key: string]: string;
                                  }).fr
                                }
                                <br />
                                {showPrice && `€${(
                                  ((amount || 0)) /
                                  100
                                ).toLocaleString(undefined, {
                                  minimumFractionDigits: 1,
                                })}`}

                              </Typography>
                            </Grid>
                            <Grid item>
                              {showPrice && <Typography>{`€${(
                                ((amount || 0) * quantity) /
                                100
                              ).toLocaleString(undefined, {
                                minimumFractionDigits: 1,
                              })}`}</Typography>}
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
                                        <Grid
                                          item
                                          style={{ fontWeight: 'bold' }}
                                        >
                                          {quantity} X
                                        </Grid>
                                        <Grid
                                          item
                                          style={{
                                            marginLeft: theme.spacing(2),
                                          }}
                                        >
                                          <Typography
                                            className={classes.itemPrice}
                                          >
                                            {item.name}
                                            <br />
                                            {`€${(
                                              items.reduce(
                                                (p, c) =>
                                                  p +
                                                  (c.item.price?.amount || 0),
                                                0
                                              ) / 100
                                            ).toLocaleString(undefined, {
                                              minimumFractionDigits: 1,
                                            })}`}
                                          </Typography>
                                        </Grid>
                                      </Grid>
                                    ))}
                                  </Grid>
                                  {showPrice && <Grid item>
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
                                  </Grid>}
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
                    <ListSubheader disableGutters className="translate">
                      Liste des menus commandés
                    </ListSubheader>
                  }
                >
                  {(command.menus as MenuInCart[]).map((menu) => {
                    const {
                      item: { imageURL, name },
                      quantity,
                    } = menu;

                    return (
                      <>
                        <ListItem disableGutters>
                          <ListItemAvatar>
                            <Grid container alignItems="center">
                              <Typography style={{ width: 40 }} align="center">
                                {quantity} X
                              </Typography>
                              <Avatar
                                src={imageURL}
                                alt={
                                  ((name as unknown) as {
                                    [key: string]: string;
                                  }).fr
                                }
                              />
                            </Grid>
                          </ListItemAvatar>
                          <ListItemText
                            style={{ marginLeft: theme.spacing(2) }}
                          >
                            <Grid container justify="space-between">
                              <Grid item>
                                <Typography
                                  align="left"
                                >
                                  {
                                    ((name as unknown) as {
                                      [key: string]: string;
                                    }).fr
                                  }

                                </Typography>
                              </Grid>
                              <Grid item>
                                {showPrice && (
                                  <Typography>
                                    {`€${(
                                      estimateMenuPrice(menu) / 100
                                    ).toLocaleString(undefined, {
                                      minimumFractionDigits: 1,
                                    })}`}
                                  </Typography>)}
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
                                        <Typography>{name.fr}</Typography>
                                      </Grid>
                                      {price && showPrice && (
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
                                              {items.map(
                                                ({ item, quantity }) => (
                                                  <Grid
                                                    item
                                                    xs
                                                    container
                                                    style={{
                                                      paddingLeft: theme.spacing(
                                                        4
                                                      ),
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
                                                )
                                              )}
                                            </Grid>
                                            {showPrice && <Grid item>
                                              {!!(
                                                items.reduce(
                                                  (p, c) =>
                                                    p +
                                                    c.quantity *
                                                    (c.item.price?.amount ||
                                                      0),
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

            {(+command.discount > 0) && (
              <>
                <Grid
                  container
                  justify="space-between"
                  alignItems="center"
                  style={{ padding: '8px 0' }}
                >
                  <Typography className="translate">
                    Remise
                  </Typography>
                  <Typography className="notranslate">
                    {command.discountIsPrice ? `€ ${command.discount}` : `${command.discount} % `}
                  </Typography>
                </Grid>
              </>
            )}

            {command.commandType === 'delivery' && <Grid
              container
              justify="space-between"
              alignItems="center"
              style={{ padding: '8px 0' }}
            >
              <Typography className="translate">Frais de livraison</Typography>
              <Typography className="notranslate">{command.priceLivraison && `€${(command.priceLivraison).toLocaleString(undefined, {
                minimumFractionDigits: 1,
              })}`}</Typography>
            </Grid>}
            {showPrice && <Grid container justify="space-between" alignItems="center">
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
      )}
      <Footer mini />

      <Loading open={loading} />
    </>
  );
};

export default OrderDetailsPage;
