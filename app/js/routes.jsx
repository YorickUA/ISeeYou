import React from 'react';
import { Router, Route, IndexRoute, browserHistory, Link, hashHistory } from 'react-router';

import app from './app.jsx';
import Dashboard from './Components/Dashboard.jsx'

export default (
    <Router history={browserHistory}>
        <Route path="/" component={app}/>
            <Route path="/Dashboard" component={Dashboard}/>
    </Router>
)