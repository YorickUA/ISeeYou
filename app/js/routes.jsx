import React from 'react';
import { Router, Route, IndexRoute, browserHistory, Link, hashHistory } from 'react-router';

import app from './app.jsx';
import Dashboard from './Components/Dashboard.jsx'
import PythonDashboard from './Components/PythonDashboard.jsx'

export default (
    <Router history={browserHistory}>
        <Route path="/" component={app}/>
            <Route path="/Dashboard" component={Dashboard}/>
             <Route path="/Python" component={PythonDashboard}/>
    </Router>
)