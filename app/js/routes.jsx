import React from 'react';
import { Router, Route, IndexRoute, browserHistory, Link, hashHistory } from 'react-router';

import app from './app.jsx';
import Socket from './Components/Socket.jsx'

export default (
    <Router history={browserHistory}>
        <Route path="/" component={app}/>
            <Route path="/Socket" component={Socket}/>
    </Router>
)