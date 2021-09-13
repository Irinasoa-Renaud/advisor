import React from 'react';
import {
  WithScriptjsProps,
  withGoogleMap,
  WithGoogleMapProps,
  withScriptjs,
  GoogleMap,
  GoogleMapProps,
} from 'react-google-maps';

const Map: React.ComponentClass<
  GoogleMapProps & WithGoogleMapProps & WithScriptjsProps
> = withScriptjs(withGoogleMap((props) => <GoogleMap {...props} />));

export default Map;
