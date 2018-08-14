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

                <nav className="navbar navbar-default">
                    <div className="container-fluid">

                        <div className="navbar-header">
                            <button type="button" className="navbar-toggle collapsed" data-toggle="collapse"
                                    data-target="#bs-example-navbar-collapse-1" aria-expanded="false">
                                <span className="sr-only">Toggle navigation</span>
                                <span className="icon-bar"/>
                                <span className="icon-bar"/>
                                <span className="icon-bar"/>
                            </button>
                            <Link className="navbar-brand" to="/">CTMS</Link>
                        </div>

                        <div className="collapse navbar-collapse" id="bs-example-navbar-collapse-1">
                            <ul className="nav navbar-nav">
                                <li className="active">
                                    <Link to="/visits">
                                        Visits
                                    </Link>
                                </li>
                                <li>
                                    <Link to="/studies">
                                        Studies
                                    </Link>
                                </li>
                                <li>
                                    <Link to="/patients">
                                        Patients
                                    </Link>
                                </li>
                            </ul>

                            <ul className="nav navbar-form navbar-right">
                                <li>
                                    <Link className="btn btn-warning" to="/visits/new">
                                        Start Visit
                                    </Link>
                                </li>
                            </ul>
                        </div>

                    </div>

                </nav>

                <div className="content">
                    <ol className="breadcrumb">
                        <li><a href="#">Visits</a></li>
                        <li className="active">All</li>
                    </ol>

                    <div className="container">
                        <this.props.Component />
                    </div>
                </div>

            </div>
        );
    }
}

export default MainLayout;