import React from 'react';
import ReactDOM from 'react-dom';
import {Provider} from 'react-redux'
import {createStore, applyMiddleware} from 'redux';
import { BrowserRouter as Router, Route, Switch, Redirect} from 'react-router-dom';
import {composeWithDevTools} from 'redux-devtools-extension';
import thunk from 'redux-thunk';

import './index.css';
import App from './components/App';
import Login from "./components/Login";
import registerServiceWorker from './registerServiceWorker';

const initialState = [];

function calendar(state = initialState, action) {
    if (action.type === 'FETCH_EVENTS') {
        return [
            ...state,
            ...action.payload
        ];
    }
    if (action.type === 'ADD_EVENT') {
        return [
            ...state,
            action.payload
        ];
    }
    if (action.type === 'DELETE_EVENT') {
        return state.filter((state) => state !== action.payload);
    }
    return state;
}

const store = createStore(calendar, composeWithDevTools(applyMiddleware(thunk)));

const isLoggedIn = window.localStorage.getItem('isLoggedIn');

ReactDOM.render(
    <Provider store={store}>
        <Router>
            <Switch>
                <Route exact path="/login" component={Login} />
                <Route exact path="/*" render={() => (
                    isLoggedIn ? (
                        <Route exact path="/calendar" component={App} />
                    ) : (
                        <Redirect to="/login" />
                    )
                )}/>
            </Switch>
        </Router>
    </Provider>, document.getElementById('root'));
registerServiceWorker();
