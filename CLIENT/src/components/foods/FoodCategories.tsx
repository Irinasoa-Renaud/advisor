import React, { createRef, useEffect, useLayoutEffect, useState } from 'react';
import {
  CircularProgress,
  Container,
  Grid,
  makeStyles,
  Typography,
  useTheme,
} from '@material-ui/core';
import FoodCategory from '../../models/FoodCategory.model';
import { getFoodCategories } from '../../services/food';
import { Link } from 'react-router-dom';
import clsx from 'clsx';

const useStyles = makeStyles((theme) => ({
  container: {
    overflowX: 'auto',
    padding: theme.spacing(0, 4),
  },
  root: {
    display: 'flex',
    marginTop: theme.spacing(1),
    marginBottom: theme.spacing(1),
  },
  categoryContainer: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'flex-start',
    alignItems: 'center',
    textDecoration:'none',
    width: 'auto',
    '&:hover>:first-child': {
      backgroundColor: 'rgba(33, 33, 33, .3)',
    },
  },
  title: {
    fontSize: 15,
    color: 'black',
    textDecoration: 'none',
    textAlign: 'center',
  },
  image: {
    padding: theme.spacing(1),
    width: 60,
    height: 60,
    borderRadius: '50%',
    marginBottom: theme.spacing(1),
    '&>img': {
      borderRadius: '50%',
      width: '100%',
      height: '100%',
      objectFit: 'cover',
    },
  },
}));

const FoodCategories: React.FC = () => {
  const classes = useStyles();

  const [foodCategories, setfoodCategories] = useState<FoodCategory[]>([]);
  const [loading, setLoading] = useState(false);

  const [overflow, setOverflow] = useState(false);

  const containerRef = createRef<HTMLDivElement>();

  const theme = useTheme();

  useLayoutEffect(() => {
    const refreshSize = () => {
      if (
        containerRef.current &&
        foodCategories.length * 100 + theme.spacing(8) >
        containerRef.current.offsetWidth
      )
        setOverflow(true);
      else setOverflow(false);
    };

    refreshSize();

    window.addEventListener('resize', refreshSize);

    return () => window.removeEventListener('resize', refreshSize);
  }, [foodCategories, containerRef, theme]);

  useEffect(() => {
    setLoading(true);

    getFoodCategories().then((data) => {
      setfoodCategories(data);
      setLoading(false);
    });
  }, []);

  return loading ? (
    <Grid container justify="center" alignItems="center" style={{ height: 80 }}>
      <CircularProgress />
    </Grid>
  ) : (
    <Container className={classes.container} ref={containerRef}>
      <Grid
        container
        spacing={4}
        className={classes.root}
        alignItems="stretch"
        justify={overflow ? 'flex-start' : 'center'}
        wrap="nowrap"
      >
        {foodCategories
          .sort((a: any, b: any) => a.priority - b.priority)
          .map((foodCategory) => (
            <Grid
              key={foodCategory._id}
              item
              className={classes.categoryContainer}
              component={Link}
              to={`/search?type=restaurant&filter=${JSON.stringify({
                category: foodCategory._id,
              })}`}
            >
              <div className={classes.image}>
                <img src={foodCategory.imageURL} alt={foodCategory.name.fr} />
              </div>
              <Typography
                align="left"
                className={clsx(classes.title, 'translate')}
                style={{ textDecoration: 'none' }}
              >
                {foodCategory.name.fr}
              </Typography>
            </Grid>
          ))}
      </Grid>
    </Container>
  );
};

export default FoodCategories;
