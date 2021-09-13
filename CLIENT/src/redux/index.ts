import { createStore, applyMiddleware } from 'redux';
import thunk from 'redux-thunk';
import rootReducer from './reducers';
import { composeWithDevTools } from 'redux-devtools-extension';
import * as authActionCreators from './actions/auth';
import * as cartActionCreators from './actions/cart';
import * as settingActionCreators from './actions/setting';

export default () => {
  const composeEnhancers = composeWithDevTools({
    actionCreators: {
      ...authActionCreators,
      ...cartActionCreators,
      ...settingActionCreators,
    },
    trace: true,
    traceLimit: 25,
  });

  const store = createStore(
    rootReducer,
    composeEnhancers(applyMiddleware(thunk)),
  );

  return {
    store,
  };
};
