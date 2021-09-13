import React, { useEffect, useState } from 'react';
import { makeStyles, withStyles } from '@material-ui/core/styles';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';
import Button from '@material-ui/core/Button';
import IconButton from '@material-ui/core/IconButton';
import MenuIcon from '@material-ui/icons/Menu';
import logo from '../../assets/images/logo.png';
import {
  Avatar,
  Box,
  ClickAwayListener,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Divider,
  Fade,
  Grid,
  InputAdornment,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Menu,
  MenuItem,
  Paper,
  Popper,
  SwipeableDrawer,
  TextField,
  Theme,
  useMediaQuery,
  useScrollTrigger,
} from '@material-ui/core';
import Banner from '../Banner';
import AccountIcon from '@material-ui/icons/AccountCircle';
import ShoppingCartIcon from '@material-ui/icons/ShoppingCart';
import Badge from '@material-ui/core/Badge';

import { Link, useHistory, useLocation } from 'react-router-dom';
import { connect } from 'react-redux';
import RootState, { RootActionTypes } from '../../redux/types';
import { ThunkDispatch } from 'redux-thunk';
import { logout } from '../../redux/actions/auth';
import clsx from 'clsx';
import HideOnScroll from '../HideOnScroll';
import User from '../../models/User.model';
import {
  Close as CloseIcon,
  Delete,
  Delete as DeleteIcon,
  ExitToApp,
  Favorite,
  Receipt,
  Search as SearchIcon,
} from '@material-ui/icons';
import querystring from 'querystring';
import { Lang } from '../../redux/types/setting';
import { changeLanguage } from '../../redux/actions/setting';

import France from '../../assets/flags/France.png';
import UnitedStates from '../../assets/flags/United-States.png';
import Japan from '../../assets/flags/Japan.png';
import China from '../../assets/flags/China.png';
import Italy from '../../assets/flags/Italy.png';
import Spain from '../../assets/flags/Spain.png';
import Russia from '../../assets/flags/Russia.png';
import SouthKorea from '../../assets/flags/South-Korea.png';
import Netherlands from '../../assets/flags/Netherlands.png';
import Germany from '../../assets/flags/Germany.png';
import Portugal from '../../assets/flags/Portugal.png';
import India from '../../assets/flags/India.png';
import UnitedArabEmirates from '../../assets/flags/United-Arab-Emirates.png';
import { FoodInCart, MenuInCart } from '../../redux/types/cart';
import {
  removeFoodFromCart,
  removeMenuFromCart,
  resetCart,
  updateFoodInCart,
  updateMenuInCart,
} from '../../redux/actions/cart';
import { estimateFoodPrice, estimateMenuPrice } from '../../services/cart';
import Restaurant from '../../models/Restaurant.model';
import FoodDetailsDialog from '../foods/FoodDetailsDialog';
import useEffectOnUpdate from '../../hooks/useEffectOnUpdate';
import DialogLang from './dilogSelectLang';
import { isMobile } from 'react-device-detect';

const useStyles = makeStyles((theme) => ({
  menuButton: {
    marginRight: theme.spacing(2),
  },
  title: {
    fontFamily: 'Roboto',
    marginLeft: theme.spacing(2),
  },
  origin: {
    marginLeft: theme.spacing(2),
    marginBottom: theme.spacing(2),
  },
  logo: {
    width: '45px',
  },
  o: {
    width: '13px',
  },
  drawerContainer: {
    width: 300,
    padding: theme.spacing(2),
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  menu: {
    fontFamily: 'Cool Sans',
    fontSize: '1em',
    color: 'black !important',
  },
  advisor: {
    fontFamily: 'Golden Ranger',
    color: theme.palette.primary.main,
    fontSize: '1.5em',
  },
  drawerNav: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'stretch',
    justifyContent: 'flex-start',
    '& a': {
      color: 'black !important',
    },
  },
  seeAccountLink: {
    textDecoration: 'none',
    color: theme.palette.primary.main,
  },
  profileItemContainer: {
    alignItems: 'flex-start',
  },
  mobileSearchField: {
    margin: theme.spacing(2, 0),
  },
  searchField: {
    width: 400,
    marginRight: theme.spacing(2),
    [theme.breakpoints.down('sm')]: {
      display: 'none',
    },
  },
  cartDetailsContainer: {
    minWidth: 400,
    padding: theme.spacing(2),
    '&>div': {
      display: 'flex',
      flexDirection: 'column',
    },
  },
  close: {},
  cartDetailsHeading: {
    display: 'flex',
    margin: theme.spacing(0, 2),
  },
  cartDetailsTitle: {
    textTransform: 'capitalize',
  },
  totalCount: {
    backgroundColor: theme.palette.primary.main,
    color: theme.palette.getContrastText(theme.palette.primary.main),
    borderWidth: 2,
    borderColor: 'white',
    borderStyle: 'solid',
    '&:disabled': {
      backgroundColor: theme.palette.grey[300],
    },
  },
  checkout: {
    margin: theme.spacing(0, 2, 2, 2),
    justifyContent: 'flex-start',
    alignItems: 'center',
  },
  emptyCart: {
    margin: theme.spacing(2, 0),
  },
  itemContainer: {
    display: 'flex',
    flexDirection: 'column',
    margin: theme.spacing(0, 2),
    marginBottom: theme.spacing(1),
  },
  itemName: {
    fontSize: 16,
    fontFamily: 'Work Sans',
  },
  itemPrice: {
    fontSize: 14,
    fontFamily: 'Work Sans',
  },
  bottomCart: {
    position: 'fixed',
    bottom: 0,
    left: 0,
    zIndex: 1,
    width: '100%',
    padding: '8px',
    backgroundColor: 'white'
  },
  cartButton: {
    width: '100%',
    fontFamily: 'Raleway',
    justifyContent: 'flex-start',
    alignItems: 'center',
  },
  totalCountBottom: {
    backgroundColor: 'white',
    color: theme.palette.primary.main,
    borderWidth: 2,
    borderColor: theme.palette.primary.main,
    borderStyle: 'solid',
    '&:disabled': {
      backgroundColor: theme.palette.grey[300],
    },
  },
}));

const StyledBadge = withStyles((theme) => ({
  badge: {
    right: -3,
    top: 13,
    border: `2px solid ${theme.palette.background.paper}`,
    padding: '0 4px',
  },
}))(Badge);

type LangOption = {
  src: string;
  title: string;
};

const langs: { [key in Lang]: LangOption } = {
  fr: { src: France, title: 'Français' },
  en: { src: UnitedStates, title: 'English' },
  ja: { src: Japan, title: '日本人' },
  'zh-CN': { src: China, title: '中文' },
  it: { src: Italy, title: 'Italiano' },
  es: { src: Spain, title: 'Español' },
  ru: { src: Russia, title: 'Pусский' },
  ko: { src: SouthKorea, title: '한국어' },
  nl: { src: Netherlands, title: 'Nederlands' },
  de: { src: Germany, title: 'Deutsche' },
  pt: { src: Portugal, title: 'Português' },
  hi: { src: India, title: 'भारतीय' },
  ar: { src: UnitedArabEmirates, title: 'عرب' },
};

interface NavbarStateProps {
  totalCount: number;
  totalPrice: number;
  menus: MenuInCart[];
  foods: FoodInCart[];
  restaurant: Restaurant | null;
  authenticated: boolean;
  user: User | null;
  lang: Lang;
}

interface NavbarDispatchProps {
  logout: () => Promise<void>;
  setLang: (lang: Lang) => Promise<void>;
  resetCart: () => void;
  updateFood: (food: FoodInCart) => void;
  removeFood: (id: string) => void;
  updateMenu: (menu: MenuInCart) => void;
  removeMenu: (id: string) => void;
}

interface NavbarOwnProps {
  hidePlaceholder?: boolean;
  hideSearchField?: boolean;
  onQueryChange?: (query: string) => void;
  onSearchSubmitted?: (query: string) => void;
  onSearching?: (state: boolean) => void;
  onCloseSearch?: () => void;
  elevation?: number;
  hideCart?: boolean;
  hideMenu?: boolean;
  alwaysVisible?: boolean;
  isRestaurant?: boolean;
  restaurantId?: string;
}

type NavbarProps = NavbarStateProps & NavbarDispatchProps & NavbarOwnProps;

const Navbar: React.FC<NavbarProps> = ({
  totalCount,
  totalPrice,
  authenticated,
  user,
  logout,
  hidePlaceholder,
  hideSearchField,
  hideCart,
  hideMenu,
  onQueryChange,
  onSearchSubmitted,
  onSearching,
  onCloseSearch,
  lang,
  elevation,
  setLang,
  resetCart,
  foods,
  menus,
  updateFood,
  removeFood,
  updateMenu,
  removeMenu,
  restaurant,
  alwaysVisible,
  isRestaurant,
  restaurantId
}) => {
  const location = useLocation();

  const classes = useStyles();

  const { q } = querystring.parse(location.search.substr(1));

  const [openDrawer, setOpenDrawer] = useState(false);
  const [query, setQuery] = useState((q as string) || '');
  const history = useHistory()

  const closeDrawer = () => setOpenDrawer(false);

  const [langMenuAnchorEl, setLangMenuAnchorEl] = useState<null | HTMLElement>(
    null
  );

  const [
    cartDetailsAnchorEl,
    setCartDetailsAnchorEl,
  ] = useState<null | HTMLElement>(null);

  const [openResetCartConfirmation, setOpenResetCartConfirmation] = useState(
    false
  );

  const { src, title } = langs[lang];

  const submitSearch = () => {
    if (onSearchSubmitted) return onSearchSubmitted(query as string);

    history.push(`/search?q=${query}`);
  };

  const changeLang: (lang: Lang) => void = (lang) => {
    if (isRestaurant) history.push(`/restaurants/${restaurantId}`)
    setLang(lang);
    setLangMenuAnchorEl(null);
  };

  const trigger = useScrollTrigger({
    threshold: 10,
  });

  const [openedDialog, setOpenedDialog] = useState<string>();

  const smDown = useMediaQuery((theme: Theme) => theme.breakpoints.down('sm'));

  const [searching, setSearching] = useState(false);

  useEffect(() => {
    if (trigger) setCartDetailsAnchorEl(null);
  }, [trigger]);

  useEffectOnUpdate(() => {
    if (onSearching) onSearching(searching);
  }, [onSearching, searching]);

  useEffectOnUpdate(() => {
    if (onQueryChange) onQueryChange(query);
  }, [onQueryChange, query]);

  return (
    <>

      {!hidePlaceholder && <Toolbar />}
      <DialogLang
        listLang={langs}
        changeLang={changeLang}
      />
      <HideOnScroll disabled={alwaysVisible}>
        <AppBar position={alwaysVisible ? 'absolute' : 'fixed'} color="inherit" elevation={elevation} style={{ zIndex: 200 }}>
          <Toolbar>
            {!hideMenu && (
              <IconButton
                edge="start"
                className={classes.menuButton}
                color="inherit"
                aria-label="menu"
                onClick={() => setOpenDrawer(true)}
              >
                <MenuIcon />
              </IconButton>
            )}
            {!searching && (
              <Link to="/">
                <img src={logo} alt="logo" className={classes.logo} />
              </Link>
            )}
            {!smDown && !searching && (
              <Typography
                component={Link}
                variant="h5"
                className={classes.title}
                align="left"
                to="/"
                style={{ textDecoration: 'none' }}
              >
                <span className={classes.menu}>Menu </span>
                <span className={classes.advisor}>Advisor</span>
              </Typography>
            )}

            {searching && (
              <div style={{ flexGrow: 1 }}>
                <TextField
                  fullWidth
                  variant="filled"
                  className={classes.mobileSearchField}
                  label={<span className="translate">Rechercher</span>}
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onSubmit={() => submitSearch()}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      submitSearch();
                    }
                  }}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <IconButton onClick={() => submitSearch()}>
                          <SearchIcon />
                        </IconButton>
                      </InputAdornment>
                    ),
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          onClick={() => {
                            setQuery('');
                            setSearching(false);
                            if (onCloseSearch) onCloseSearch();
                          }}
                        >
                          <CloseIcon />
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />
              </div>
            )}

            <div style={{ flexGrow: !searching ? 1 : 0 }} />

            {!hideSearchField && (
              <TextField
                variant="filled"
                className={classes.searchField}
                label={<span className="translate">Rechercher</span>}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onSubmit={() => submitSearch()}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    submitSearch();
                  }
                }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <IconButton onClick={() => submitSearch()}>
                        <SearchIcon />
                      </IconButton>
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() => {
                          setQuery('');
                        }}
                      >
                        <CloseIcon />
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
            )}

            {!hideSearchField && smDown && !searching && (
              <div>
                <IconButton onClick={() => setSearching(true)}>
                  <SearchIcon />
                </IconButton>
              </div>
            )}

            <div>
              <Button onClick={(e) => setLangMenuAnchorEl(e.currentTarget)}>
                <Grid
                  container
                  justify="center"
                  alignItems="center"
                  spacing={2}
                >
                  <Grid item>
                    <Avatar variant="rounded" src={src} alt={title} />
                  </Grid>
                  {!smDown && (
                    <Grid item xs>
                      {title}
                    </Grid>
                  )}
                </Grid>
              </Button>
              <Menu
                id="language-menu"
                anchorEl={langMenuAnchorEl}
                keepMounted
                open={!!langMenuAnchorEl}
                onClose={() => setLangMenuAnchorEl(null)}
                className="notranslate"
              >

                {Object.keys(langs).map((key) => {

                  const { src, title } = langs[key as Lang];

                  return (
                    <MenuItem
                      key={key}
                      selected={lang === key}
                      onClick={() => changeLang(key as Lang)}
                    >
                      <Grid
                        container
                        justify="center"
                        alignItems="center"
                        spacing={2}
                      >
                        <Grid item>
                          <Avatar variant="rounded" src={src} alt={title} />
                        </Grid>
                        <Grid item xs>
                          {title}
                        </Grid>
                      </Grid>
                    </MenuItem>
                  );
                })}
              </Menu>
            </div>
            {!isMobile && !hideCart && !searching && (
              <div>
                <IconButton
                  aria-label="cart"
                  onClick={(e) =>
                    Boolean(cartDetailsAnchorEl)
                      ? setCartDetailsAnchorEl(null)
                      : setCartDetailsAnchorEl(e.currentTarget)
                  }
                >
                  <StyledBadge
                    badgeContent={totalCount}
                    color="primary"
                    showZero
                  >
                    <ShoppingCartIcon />
                  </StyledBadge>
                </IconButton>
              </div>
            )}
          </Toolbar>
        </AppBar>
      </HideOnScroll>

      <Dialog
        open={openResetCartConfirmation}
        onClose={() => setOpenResetCartConfirmation(false)}
      >
        <DialogTitle className="translate">{'Vider le panier?'}</DialogTitle>
        <DialogContent>
          <DialogContentText
            id="alert-dialog-description"
            className="translate"
          >
            Voulez-vous vraiment vider le panier? Tous les nourritures et menus
            ajoutés seront tous enlevés.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => setOpenResetCartConfirmation(false)}
            autoFocus
            className="translate"
          >
            Annuler
          </Button>
          <Button
            onClick={() => {
              setOpenResetCartConfirmation(false);
              setCartDetailsAnchorEl(null);
              resetCart();
            }}
            color="primary"
            className="translate"
          >
            Valider
          </Button>
        </DialogActions>
      </Dialog>

      <Popper
        id="cart-details"
        open={!!cartDetailsAnchorEl}
        anchorEl={cartDetailsAnchorEl}
        placement="bottom-end"
        transition
        style={{ zIndex: 10000 }}
      >
        {({ TransitionProps }) => (
          <Fade {...TransitionProps}>
            <Paper className={classes.cartDetailsContainer}>
              <ClickAwayListener
                onClickAway={() => setCartDetailsAnchorEl(null)}
              >
                <div>
                  <div>
                    <IconButton
                      className={classes.close}
                      onClick={() => setCartDetailsAnchorEl(null)}
                    >
                      <CloseIcon />
                    </IconButton>
                  </div>
                  <div className={classes.cartDetailsHeading}>
                    <Typography
                      variant="h5"
                      component="p"
                      className={clsx(classes.cartDetailsTitle, 'translate')}
                    >
                      Votre panier
                    </Typography>
                    <div style={{ flexGrow: 1 }} />
                    <Button
                      disabled={!totalCount}
                      onClick={() => {
                        setCartDetailsAnchorEl(null);
                        setOpenResetCartConfirmation(true);
                      }}
                      startIcon={<Delete />}
                      className="translate"
                    >
                      Vider
                    </Button>
                  </div>

                  {restaurant && (
                    <Typography
                      variant="body1"
                      className={clsx(classes.origin, 'notranslate')}
                    >
                      <span className="translate">Provient de</span>{' '}
                      <Link to={`/restaurants/${restaurant._id}`}>
                        {restaurant.name}
                      </Link>
                    </Typography>
                  )}

                  {!totalCount && (
                    <Typography
                      align="center"
                      variant="h6"
                      color="textSecondary"
                      className={clsx(classes.emptyCart, 'translate')}
                    >
                      Panier vide
                    </Typography>
                  )}

                  {!!totalCount && !!foods.length && (
                    <div className={classes.itemContainer}>
                      <Typography
                        variant="h6"
                        gutterBottom
                        className="translate"
                      >
                        Les plats
                      </Typography>
                      {foods.map((food) => {
                        const {
                          id,
                          item: { imageURL, name },
                          quantity,
                        } = food;

                        return (
                          <React.Fragment key={id}>
                            <Button fullWidth onClick={() => { }}>
                              <Grid container spacing={1} alignItems="center">
                                <Grid item>
                                  <Box
                                    width={50}
                                    textAlign="center"
                                    alignSelf="center"
                                  >
                                    {quantity}
                                  </Box>
                                </Grid>
                                <Grid item>
                                  <Avatar src={imageURL} alt={name} />
                                </Grid>
                                <Grid item xs>
                                  <Typography
                                    variant="h6"
                                    className={clsx(
                                      classes.itemName,
                                      'translate'
                                    )}
                                    align="left"
                                  >
                                    {name}
                                  </Typography>
                                  {estimateFoodPrice(food) !== 0 && <Typography
                                    align="left"
                                    className={clsx(classes.itemPrice)}
                                  >
                                    <span>Total: </span>
                                    <span>{`€${estimateFoodPrice(food) / 100
                                      }`}</span>
                                  </Typography>}
                                </Grid>
                                <Grid item>
                                  <IconButton onClick={() => removeFood(id)}>
                                    <DeleteIcon />
                                  </IconButton>
                                </Grid>
                              </Grid>
                            </Button>

                            <FoodDetailsDialog
                              value={food}
                              item={food.item}
                              open={openedDialog === id}
                              onClose={(result, reason) => {
                                if (result) {
                                  if (reason === 'update') updateFood(result);
                                  else if (reason === 'remove')
                                    removeFood(result.id);
                                }
                                setOpenedDialog(undefined);
                              }}
                            />
                          </React.Fragment>
                        );
                      })}
                    </div>
                  )}

                  {!!totalCount && !!menus.length && (
                    <div className={classes.itemContainer}>
                      <Typography
                        variant="h6"
                        gutterBottom
                        className="translate"
                      >
                        Les menus
                      </Typography>
                      {menus.map((menu) => {
                        const {
                          id,
                          item: { imageURL, name },
                          quantity,
                        } = menu;

                        return (
                          <Button fullWidth key={id}>
                            <Grid container spacing={1} alignItems="center">
                              <Grid item>
                                <Box
                                  width={50}
                                  textAlign="center"
                                  alignSelf="center"
                                >
                                  {quantity}
                                </Box>
                              </Grid>
                              <Grid item>
                                <Avatar src={imageURL} alt={name} />
                              </Grid>
                              <Grid item xs>
                                <Typography
                                  variant="h6"
                                  className={clsx(
                                    classes.itemName,
                                    'translate'
                                  )}
                                  align="left"
                                >
                                  {name}
                                </Typography>
                                {estimateMenuPrice(menu, menu.item.type === 'fixed_price' ? true : false) !== 0 && <Typography
                                  align="left"
                                  className={clsx(classes.itemPrice)}
                                >
                                  <span>Total: </span>
                                  <span>{`€${estimateMenuPrice(menu, menu.item.type === 'fixed_price' ? true : false) / 100
                                    }`}</span>
                                </Typography>}
                              </Grid>
                              <Grid item>
                                <IconButton onClick={() => removeMenu(id)}>
                                  <DeleteIcon />
                                </IconButton>
                              </Grid>
                            </Grid>
                          </Button>
                        );
                      })}
                    </div>
                  )}

                  <Button
                    variant="contained"
                    color="primary"
                    size="small"
                    component={Link}
                    to="/checkout"
                    onClick={() => {
                      setCartDetailsAnchorEl(null);
                    }}
                    className={classes.checkout}
                    disabled={!totalCount}
                    startIcon={
                      <Avatar
                        className={clsx(classes.totalCount, {
                          disabled: !totalCount,
                        })}
                      >
                        {totalCount}
                      </Avatar>
                    }
                  >
                    <div style={{ flexGrow: 1 }} className="translate">
                      Passer ma commande
                    </div>
                    {totalPrice !== 0 && <div>{`€${totalPrice / 100}`}</div>}
                  </Button>
                </div>
              </ClickAwayListener>
            </Paper>
          </Fade>
        )}
      </Popper>

      {isMobile && totalCount > 0 && !hideCart && <div className={classes.bottomCart}>
        <Button
          aria-label="cart"
          variant="contained"
          size="medium"
          color="primary"
          className={clsx(classes.cartButton, 'translate')}
          onClick={(e) => setCartDetailsAnchorEl(e.currentTarget)}
          startIcon={
            <Avatar
              className={classes.totalCountBottom}
              sizes='small'
            >
              {totalCount}
            </Avatar>
          }
        >
          <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between', width: '100%' }} >
            <div className="translate">
              Voir le panier
            </div>
            {totalPrice !== 0 && <div>{`€${totalPrice / 100}`}</div>}
          </div>
        </Button>
      </div>}

      <SwipeableDrawer
        anchor="left"
        onOpen={() => setOpenDrawer(true)}
        keepMounted
        open={openDrawer}
        onClose={closeDrawer}
      >
        <div className={classes.drawerContainer}>
          {!authenticated ? (
            <Button
              fullWidth
              size="large"
              component={Link}
              variant="outlined"
              onClick={() => {
                setOpenDrawer(false);
              }}
              color="primary"
              to={`/login?redirect=${location.pathname}`}
              className="translate"
            >
              Se connecter
            </Button>
          ) : (
            <div className={classes.drawerNav}>
              <List>
                <ListItem>
                  <ListItemIcon>
                    <AccountIcon fontSize="large" />
                  </ListItemIcon>
                  <ListItemText className={classes.profileItemContainer}>
                    <Typography
                      gutterBottom
                    >{`${user?.name.first} ${user?.name.last}`}</Typography>
                    <Button
                      component={Link}
                      to="/profile"
                      onClick={closeDrawer}
                      className={clsx(classes.seeAccountLink, 'translate')}
                    >
                      Voir mon compte
                    </Button>
                  </ListItemText>
                </ListItem>
                <Divider />
                <ListItem
                  button
                  component={Link}
                  to="/favorites"
                  onClick={closeDrawer}
                >
                  <ListItemIcon>
                    <Favorite />
                  </ListItemIcon>
                  <ListItemText className="translate">Mes favoris</ListItemText>
                </ListItem>
                <ListItem
                  button
                  component={Link}
                  to="/orders"
                  onClick={closeDrawer}
                >
                  <ListItemIcon>
                    <Receipt />
                  </ListItemIcon>
                  <ListItemText className="translate">
                    Mes historiques de commande
                  </ListItemText>
                </ListItem>
              </List>
              <Divider />
              <Button
                fullWidth
                size="large"
                variant="contained"
                onClick={() => {
                  setOpenDrawer(false);
                  logout();
                }}
                color="primary"
                className="translate"
                startIcon={<ExitToApp />}
              >
                Se déconnecter
              </Button>
            </div>
          )}
          <Banner />
        </div>
      </SwipeableDrawer>
    </>
  );
};

const mapStateToProps: (state: RootState) => NavbarStateProps = ({
  cart: { totalCount, totalPrice, menus, foods, restaurant },
  auth: { authenticated, user },
  setting: { lang },
}) => ({
  totalCount,
  totalPrice,
  authenticated,
  user,
  lang,
  menus,
  foods,
  restaurant,
});

const mapDispatchToProps: (
  dispatch: ThunkDispatch<RootState, undefined, RootActionTypes>
) => NavbarDispatchProps = (dispatch) => ({
  logout: () => dispatch(logout()),
  setLang: (lang) => dispatch(changeLanguage(lang)),
  resetCart: () => dispatch(resetCart()),
  updateFood: (food) => dispatch(updateFoodInCart(food)),
  removeFood: (id) => dispatch(removeFoodFromCart(id)),
  updateMenu: (menu) => dispatch(updateMenuInCart(menu)),
  removeMenu: (id) => dispatch(removeMenuFromCart(id)),
});

const ConnectedNavbar = connect<
  NavbarStateProps,
  NavbarDispatchProps,
  NavbarOwnProps,
  RootState
>(
  mapStateToProps,
  mapDispatchToProps
)(Navbar);

export default ConnectedNavbar;
