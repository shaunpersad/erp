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

                <div className="container-fluid">
                    <div className="row">
                        <div className="col-sm-3 col-md-2 sidebar">
                            <ul className="nav nav-sidebar">
                                <li className="active">
                                    <Link to="/">Overview</Link>
                                </li>
                                <li>
                                    <Link to="/schedule">Schedule</Link>
                                </li>
                                <li>
                                    <Link to="/inventory">Inventory</Link>
                                </li>
                                <li>
                                    <Link to="/production">Production</Link>
                                </li>
                            </ul>
                            <ul className="nav nav-sidebar">
                                <li>
                                    <Link to="/components">Components</Link>
                                </li>
                                <li>
                                    <Link to="/products">Products</Link>
                                </li>
                                <li>
                                    <Link to="/lines">Lines</Link>
                                </li>
                                <li>
                                    <Link to="/sales-orders">Sales Orders</Link>
                                </li>

                            </ul>

                            <ul className="nav nav-sidebar">
                                <li>
                                    <Link to="/users">Users</Link>
                                </li>
                            </ul>
                        </div>

                        <div className="col-sm-9 col-sm-offset-3 col-md-10 col-md-offset-2 main">

                            <div className="content">

                                <ol className="breadcrumb">
                                    <li className="active">Schedule</li>
                                </ol>

                                <this.props.Component />
                            </div>

                        </div>

                    </div>

                </div>


            </div>
        );
    }
}

export default MainLayout;