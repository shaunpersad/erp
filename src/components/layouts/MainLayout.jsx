import React from 'react';
import { Link } from 'react-router-dom';
import { Navbar, Nav } from 'react-bootstrap';

import './MainLayout.css';

class MainLayout extends React.Component {

    render() {

        return (
            <div className="main-layout">

                <Navbar inverse fixedTop fluid collapseOnSelect>
                    <Navbar.Header>
                        <Navbar.Brand>
                            <Link className="navbar-brand" to="/">ERP</Link>
                        </Navbar.Brand>
                        <Navbar.Toggle />
                    </Navbar.Header>
                    <Navbar.Collapse>

                        <Nav pullRight>
                            <li>
                                <form className="navbar-form">
                                    <input type="text" className="form-control" placeholder="Universal search" />
                                </form>
                            </li>
                            <li>
                                <Link to="/help">Help</Link>
                            </li>
                            <li>
                                <Link to="/logout">Logout</Link>
                            </li>
                        </Nav>
                    </Navbar.Collapse>
                </Navbar>

                <div className="sidebar-container">

                    <div className="sidebar">

                        <ul className="nav nav-sidebar">
                            <li>
                                <Link to="/">
                                    <span className="icon icon-home" />
                                    <span className="text">
                                            Overview
                                        </span>
                                </Link>
                            </li>
                            <li className="active">
                                <Link to="/schedule">
                                    <span className="icon icon-event_available" />
                                    <span className="text">
                                            Schedule
                                        </span>
                                </Link>
                            </li>
                            <li>
                                <Link to="/inventory">
                                    <span className="icon icon-grid_on" />
                                    <span className="text">
                                            Inventory
                                        </span>
                                </Link>
                            </li>
                            <li>
                                <Link to="/production">
                                    <span className="icon icon-local_shipping" />
                                    <span className="text">
                                            Production
                                        </span>
                                </Link>
                            </li>
                        </ul>
                        <ul className="nav nav-sidebar">
                            <li>
                                <Link to="/components">
                                    <span className="icon icon-extension" />
                                    <span className="text">
                                            Components
                                        </span>
                                </Link>
                            </li>
                            <li>
                                <Link to="/products">
                                    <span className="icon icon-free_breakfast" />
                                    <span className="text">
                                            Products
                                        </span>
                                </Link>
                            </li>
                            <li>
                                <Link to="/lines">
                                    <span className="icon icon-build" />
                                    <span className="text">
                                        Lines
                                        </span>
                                </Link>
                            </li>
                            <li>
                                <Link to="/sales-orders">
                                    <span className="icon icon-monetization_on" />
                                    <span className="text">
                                            Sales Orders
                                        </span>
                                </Link>
                            </li>

                        </ul>

                        <ul className="nav nav-sidebar">
                            <li>
                                <Link to="/users">
                                    <span className="icon icon-people" />
                                    <span className="text">
                                        Users
                                        </span>
                                </Link>
                            </li>
                        </ul>

                    </div>

                    <div className="container-fluid">
                        <div className="content">

                            <ol className="breadcrumb">
                                <li className="active">Schedule</li>
                            </ol>

                            <this.props.Component />
                        </div>
                    </div>

                </div>

            </div>
        );
    }
}

export default MainLayout;