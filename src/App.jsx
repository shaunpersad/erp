import React, { Component } from 'react';
import { BrowserRouter, Redirect, Link, Switch, Route } from 'react-router-dom';


import MainLayout from './components/layouts/MainLayout.jsx';
import LoginLayout from './components/layouts/LoginLayout.jsx';
import NotFoundLayout from './components/layouts/NotFoundLayout.jsx';

import VisitsList from './components/pages/VisitsList.jsx';
import Visit from './components/pages/Visit.jsx';

import UserContext from './contexts/UserContext.jsx';

import logo from './logo.svg';
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

    notFound = () => {

        return (
            <Redirect to="/visits" />
        );
    };

    render() {
        return (
            <div className="app">

                <UserContext.Provider value={this.state.user}>

                    <BrowserRouter>

                        <Switch>

                            <Route path="/login" component={LoginLayout} />

                            <Route path="/visits/:id" render={this.makeMainLayout(Visit)} />

                            <Route path="/visits" render={this.makeMainLayout(VisitsList)} />

                            <Route render={this.notFound} />

                        </Switch>

                    </BrowserRouter>

                </UserContext.Provider>

            </div>
        );
    }
}

export default App;
