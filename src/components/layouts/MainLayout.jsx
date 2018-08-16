import React from 'react';
import {
    Link,
    Route,
    Redirect
} from 'react-router-dom';

import './MainLayout.css';

class MainLayout extends React.Component {

    render() {

        return (
            <div className="main-layout">

                <nav className="navbar navbar-inverse navbar-fixed-top">
                    <div className="container-fluid">
                        <div className="navbar-header">
                            <button type="button" className="navbar-toggle collapsed" data-toggle="collapse"
                                    data-target="#navbar" aria-expanded="false" aria-controls="navbar">
                                <span className="sr-only">Toggle navigation</span>
                                <span className="icon-bar"/>
                                <span className="icon-bar"/>
                                <span className="icon-bar"/>
                            </button>
                            <Link className="navbar-brand" to="/">ERP</Link>
                        </div>
                        <div id="navbar" className="navbar-collapse collapse">
                            <ul className="nav navbar-nav navbar-right">
                                <li>
                                    <a href="#">Help</a>
                                </li>
                                <li>
                                    <a href="#">Logout</a>
                                </li>
                            </ul>
                            <form className="navbar-form navbar-right">
                                <input type="text" className="form-control" placeholder="Search..." />
                            </form>
                        </div>
                    </div>
                </nav>

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
                                    <li><a href="#">Visits</a></li>
                                    <li className="active">All</li>
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