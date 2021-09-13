import React, { useEffect, useState } from 'react';
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Avatar,
  Box,
  Chip,
  Container,
  Grid,
  List,
  ListItem,
  Paper,
  Tab,
  Tabs,
  Theme,
  Typography,
  useMediaQuery,
  useTheme,
} from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import Footer from '../../components/layouts/Footer';
import Navbar from '../../components/layouts/Navbar';
import Command from '../../models/Command.model';
import { getCommandsOfUser } from '../../services/commands';
import Loading from '../../components/Loading';
import { connect, MapStateToProps } from 'react-redux';
import RootState from '../../redux/types';
import moment from 'moment';
import Restaurant from '../../models/Restaurant.model';
import { ExpandMore as ExpandMoreIcon } from '@material-ui/icons';
import clsx from 'clsx';
import { green, orange, red } from '@material-ui/core/colors';
import { useHistory } from 'react-router';
import 'moment/locale/fr';
import SwipeableViews from 'react-swipeable-views';

moment.locale('fr');

interface TabPanelProps
  extends React.DetailedHTMLProps<
    React.HTMLAttributes<HTMLDivElement>,
    HTMLDivElement
  > {
  value: number;
  index: number;
}

const TabPanel: React.FC<TabPanelProps> = (props) => {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      id={`tabpanel-${index}`}
      aria-labelledby={`tab-${index}`}
      {...other}
    >
      <Box style={{ overflow: 'hidden' }}>{children}</Box>
    </div>
  );
};

const useStyles = makeStyles((theme) => ({
  root: {
    padding: theme.spacing(2, 0),
    [theme.breakpoints.down('sm')]: {
      padding: 0,
    },
  },
  tabs: {
    marginBottom: theme.spacing(2),
  },
  noCommandWrapper: {
    padding: theme.spacing(8, 0),
  },
  command: {
    borderRadius: 10,
    padding: theme.spacing(1.5, 2),
    '& + &': {
      marginTop: theme.spacing(2),
    },
  },
  commandCode: {
    margin: theme.spacing(0, 4),
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
}));

interface OrdersPageStateProps {
  userId?: string;
}

const OrdersPage: React.FC<OrdersPageStateProps> = ({ userId }) => {
  const classes = useStyles();

  const [deliveryCommands, setDeliveryCommmands] = useState<
    Map<string, Command[]>
  >(new Map());
  const [onsiteCommands, setOnsiteCommmands] = useState<Map<string, Command[]>>(
    new Map()
  );
  const [takeawayCommands, setTakeawayCommmands] = useState<
    Map<string, Command[]>
  >(new Map());

  const [loading, setLoading] = useState(false);

  const [expanded, setExpanded] = useState<string>(moment(new Date() as Date).format('MMMM YYYY'));

  const [tab, setTab] = useState(0);

  const handleChange = (panel: string) => (
    _event: React.ChangeEvent<{}>,
    isExpanded: boolean
  ) => {
    setExpanded(isExpanded ? panel : '');
  };

  useEffect(() => {
    setLoading(true);

    getCommandsOfUser({
      relatedUser: userId,
    }).then((commands) => {
      const deliveryCommandMap: Map<string, Command[]> = new Map();
      const onsiteCommandMap: Map<string, Command[]> = new Map();
      const takeawayCommandMap: Map<string, Command[]> = new Map();

      commands
        .filter(({ commandType }) => commandType === 'delivery')
        .forEach((command) => {
          const { createdAt } = command;
          const date = moment(createdAt as Date).format('MMMM YYYY');
          const t: Command[] = deliveryCommandMap.get(date) || [];

          deliveryCommandMap.set(date, [...t, command]);
        });
      setDeliveryCommmands(deliveryCommandMap);

      commands
        .filter(({ commandType }) => commandType === 'on_site')
        .forEach((command) => {
          const { createdAt } = command;
          const date = moment(createdAt as Date).format('MMMM YYYY');
          const t: Command[] = onsiteCommandMap.get(date) || [];

          onsiteCommandMap.set(date, [...t, command]);
        });
      setOnsiteCommmands(onsiteCommandMap);

      commands
        .filter(({ commandType }) => commandType === 'takeaway')
        .forEach((command) => {
          const { createdAt } = command;
          const date = moment(createdAt as Date).format('MMMM YYYY');
          const t: Command[] = takeawayCommandMap.get(date) || [];

          takeawayCommandMap.set(date, [...t, command]);
        });
      setTakeawayCommmands(takeawayCommandMap);

      setLoading(false);
    });
  }, [userId]);

  const handleTabChange = (_event: React.ChangeEvent<{}>, newValue: number) => {
    setTab(newValue);
  };

  const theme = useTheme();

  const history = useHistory();

  const renderCommands = (commandMap: Map<string, Command[]>) =>
    !commandMap.size ? (
      <div className={classes.noCommandWrapper}>
        <Typography align="center" className="translate">
          Aucune commande
        </Typography>
      </div>
    ) : (
      [...commandMap.keys()].map((date) => (
        <Accordion
          key={date}
          expanded={expanded === date}
          onChange={handleChange(date)}
        >
          <AccordionSummary
            className="translate"
            expandIcon={<ExpandMoreIcon />}
          >
            {date}
          </AccordionSummary>
          <AccordionDetails>
            <List style={{ width: '100%' }}>
              {[...(commandMap.get(date) as Command[])].map((command) => {
                const {
                  _id,
                  restaurant,
                  code,
                  validated,
                  revoked,
                  createdAt,
                } = command;

                return (
                  <ListItem
                    key={_id}
                    button
                    component={Paper}
                    onClick={() => history.push(`/orders/${_id}`, command)}
                    className={classes.command}
                  >
                    <Grid container alignItems="center">
                      <Grid item style={{ marginRight: theme.spacing(2) }}>
                        <Avatar
                          src={(restaurant as Restaurant).imageURL}
                          alt={(restaurant as Restaurant).name}
                        />
                      </Grid>
                      <Grid item>{(restaurant as Restaurant).name}</Grid>
                      <Grid item className={classes.commandCode}>
                        <Typography style={{ fontWeight: 'bolder' }}>
                          {code}
                        </Typography>
                      </Grid>
                      <Grid item>
                        <Chip
                          className={clsx(classes.status, {
                            active: !!validated,
                            revoked: !!revoked,
                          })}
                          label={
                            <span className="translate">
                              {validated
                                ? 'Validée'
                                : revoked
                                ? 'Refusée'
                                : 'En attente'}
                            </span>
                          }
                        />
                      </Grid>
                      <Grid item xs />
                      {createdAt && (
                        <Grid item>
                          <Typography className="translate">
                            {moment(createdAt).format('LLLL')}
                          </Typography>
                        </Grid>
                      )}
                    </Grid>
                  </ListItem>
                );
              })}
            </List>
          </AccordionDetails>
        </Accordion>
      ))
    );

  const smDown = useMediaQuery((theme: Theme) => theme.breakpoints.down('sm'));

  return (
    <>
      <Navbar elevation={smDown ? 0 : undefined} hideSearchField />
      <Container maxWidth="md" className={classes.root}>
        <Paper square className={classes.tabs}>
          <Tabs
            value={tab}
            indicatorColor="primary"
            textColor="primary"
            onChange={handleTabChange}
            aria-label="tab"
            centered
          >
            <Tab label={<span className="translate">Livraison</span>} />
            <Tab label={<span className="translate">Sur place</span>} />
            <Tab label={<span className="translate">À emporter</span>} />
          </Tabs>
        </Paper>
        <SwipeableViews
          axis={theme.direction === 'rtl' ? 'x-reverse' : 'x'}
          index={tab}
          onChangeIndex={(index) => setTab(index)}
          disableLazyLoading
        >
          <TabPanel value={tab} index={0} dir={theme.direction}>
            {renderCommands(deliveryCommands)}
          </TabPanel>
          <TabPanel value={tab} index={1} dir={theme.direction}>
            {renderCommands(onsiteCommands)}
          </TabPanel>
          <TabPanel value={tab} index={2} dir={theme.direction}>
            {renderCommands(takeawayCommands)}
          </TabPanel>
        </SwipeableViews>
      </Container>
      <Footer mini />

      <Loading open={loading} />
    </>
  );
};

const mapStateToProps: MapStateToProps<OrdersPageStateProps, {}, RootState> = ({
  auth: { user },
  setting: { lang },
}) => ({
  userId: user?._id,
  lang,
});

const ConnectedOrdersPage = connect<OrdersPageStateProps, {}, {}, RootState>(
  mapStateToProps
)(OrdersPage);

export default ConnectedOrdersPage;
