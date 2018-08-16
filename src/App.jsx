import React, { Component } from 'react';
import { BrowserRouter, Redirect, Link, Switch, Route } from 'react-router-dom';


import MainLayout from './components/layouts/MainLayout.jsx';
import LoginLayout from './components/layouts/LoginLayout.jsx';
import NotFoundLayout from './components/layouts/NotFoundLayout.jsx';

import OverviewPage from './components/pages/overview/OverviewPage.jsx';
import SchedulePage from './components/pages/schedule/SchedulePage.jsx';

import UserContext from './contexts/UserContext.jsx';

import './App.css';

class App extends Component {

    state = {
        user: true
    };

    makeMainLayout(Component) {

        return () => {

            if (!this.state.user) {
                return (
                    <Redirect to="/login" />
                );
            }

            return (
                <MainLayout Component={Component} />
            );
        };
    }

    render() {
        return (
            <div className="app">

                <UserContext.Provider value={this.state.user}>

                    <BrowserRouter>

                        <Switch>

                            <Route path="/login" component={LoginLayout} />

                            <Route exact path="/" component={this.makeMainLayout(OverviewPage)} />

                            <Route path="/schedule" render={this.makeMainLayout(SchedulePage)} />

                            <Route component={NotFoundLayout} />

                        </Switch>

                    </BrowserRouter>

                </UserContext.Provider>

            </div>
        );
    }
}

export default App;
