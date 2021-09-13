/* eslint-disable jsx-a11y/alt-text */
import React, { useState } from 'react';
import { CircularProgress, makeStyles } from '@material-ui/core';
import clsx from 'clsx';

const useStyles = makeStyles(() => ({
  root: {
    position: 'relative',
  },
  imagePlaceholder: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  },
}));

interface ImageLoaderProps
  extends React.DetailedHTMLProps<
  React.ImgHTMLAttributes<HTMLImageElement>,
  HTMLImageElement
  > {
  className?: string;
  imageClassName?: string;
  style?: React.CSSProperties;
  imageStyle?: React.CSSProperties;
}

const ImageLoader: React.FC<ImageLoaderProps> = ({
  key,
  className,
  style,
  imageClassName,
  imageStyle,
  ...imageProps
}) => {
  const classes = useStyles();

  const [loading, setLoading] = useState(true);

  return (
    <div {...{ className: clsx(classes.root, className), style, key }}    >
      <img
        {...imageProps}
        className={imageClassName}
        style={imageStyle}
        onLoad={() => setLoading(false)}
        onError={() => {
          setLoading(false);
        }}
      />
      {loading && (
        <div className={classes.imagePlaceholder}>
          <CircularProgress />
        </div>
      )}
    </div>
  );
};

export default ImageLoader;
