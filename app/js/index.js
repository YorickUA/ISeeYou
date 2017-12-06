import React from 'react';
import ReactDOM from 'react-dom';
import routes from './routes.jsx'

import { Router, Route, IndexRoute, browserHistory } from 'react-router'

ReactDOM.render(
    <Router history={browserHistory} routes={routes}/>,
    document.getElementById('root'));