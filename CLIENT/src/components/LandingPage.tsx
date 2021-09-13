import React, { useEffect, useState, useCallback } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import { Carousel } from 'react-responsive-carousel';
import { Typography, Button } from '@material-ui/core';
import clsx from 'clsx';
import Blog from '../models/Blog.model';
import { getBlogs } from '../services/blog';
import { useSnackbar } from 'notistack';
import back from './../assets/images/back.jpg'
import Loading from './Loading';

const useStyles = makeStyles((theme) => ({
  root: {
    display: 'flex',
    justifyContent: 'flex-start',
    alignItems: 'center',
    backgroundImage: `url(${back})`,
    backgroundSize: 'cover',
    height: '50vh',
    width: '100%',
    padding: theme.spacing(6.25),
    [theme.breakpoints.down('sm')]: {
      height: 300,
      padding: theme.spacing(4),
    },
  },
  container: {
    display: 'flex',
    alignItems: 'center',
    flexDirection: 'column',
    height: '50vh',
    width: '100%',
    [theme.breakpoints.down('sm')]: {
      height: 300,
    },
  },
  title: {
    color: 'white',
    fontFamily: 'Work Sans',
    fontWeight: 500,
    zIndex: 99999,
    marginLeft: theme.spacing(6.25),
    textAlign: 'left'
  },
  margin: {
    margin: theme.spacing(1),
  },
  image: {
    width: '100%'
  },
  carouselContainer: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
    height: '50vh',
    width: '100%',
    [theme.breakpoints.down('sm')]: {
      height: 300,
    },
  },
  imageContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    height: '50vh',
    width: '100%',
    [theme.breakpoints.down('sm')]: {
      height: 300,
    },
  },
  link: {
    textDecoration: 'none',
    color: 'white'
  },
  descContainer: {
    display: 'flex',
    flexDirection: 'column',
  },
  button: {
    marginTop: '8px',
    width: '160px',
    marginLeft: theme.spacing(6.25)
  }
}));

const LandingPage: React.FC = () => {
  const classes = useStyles();
  const { enqueueSnackbar } = useSnackbar();

  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    setLoading(true);
    getBlogs()
      .then((data) => setBlogs(data.sort((a: any, b: any) => a.priority - b.priority)))
      .catch((e) => { if (e) enqueueSnackbar('Erreur lors du chargement des blogs', { variant: 'error' }) })
      .finally(() => setLoading(false))
  }, [enqueueSnackbar]);

  const renderItem = useCallback(
    (blog: Blog, index) => (
      <div className={classes.carouselContainer} key={index}>
        <div className={classes.imageContainer}>
          <img src={blog.imageWebURL} alt='blog' />
        </div>
        <div className={classes.descContainer}>
          <Typography variant="h4" className={clsx(classes.title, 'translate')}>
            {blog.title}
            <br />
            {blog.description}
          </Typography>
          {
            blog.url && (<Button className={classes.button} size='small' color='primary' variant='contained'>
              <a href={blog.url} target='_blank' rel="noopener noreferrer" className={clsx(classes.link, 'translate')} >En savoir plus...</a>
            </Button>)
          }
        </div>
      </div>
    ),
    [classes],
  )

  if (loading) {
    return (
      <Loading open={true} />
    )
  }

  if (blogs?.length > 0) {
    return (
      <div className={classes.container}>
        <Carousel
          showThumbs={false}
          showIndicators={true}
          showArrows={true}
          showStatus={false}
          autoPlay={true}
          interval={3000}
          infiniteLoop={true}
          width={'100%'}
        >
          {blogs?.map((blog, index) => renderItem(blog, index))}
        </Carousel>
        <div className={classes.margin}></div>
      </div>
    );
  } else {
    return (
      <div className={classes.root}>
        <Typography variant="h2" className={clsx(classes.title, 'translate')}>
          Votre plat préféré
          <br />
          livré avec Menu Advisor
        </Typography>
        <div className={classes.margin}></div>
      </div>
    );
  }
};

export default LandingPage;
