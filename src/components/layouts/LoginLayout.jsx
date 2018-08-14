import React from 'react';
import { Link } from 'react-router-dom';

import './LoginLayout.css';

class LoginLayout extends React.Component {


    render() {

        return (
            <div className="login-layout">

                <div className="container">

                    <div className="row">

                        <div className="col-lg-4 col-lg-offset-4 col-md-6 col-md-offset-3">

                            <div className="panel panel-default">
                                <div className="panel-body">

                                    <form>
                                        <div className="form-group">
                                            <label htmlFor="exampleInputEmail1">Email</label>
                                            <input type="email" className="form-control" id="exampleInputEmail1" placeholder="Email" />
                                        </div>
                                        <div className="form-group">
                                            <label htmlFor="exampleInputPassword1">Password</label>
                                            <input type="password" className="form-control" id="exampleInputPassword1" placeholder="Password" />
                                        </div>

                                        <button type="submit" className="btn btn-success">Login</button>
                                    </form>

                                </div>
                            </div>

                        </div>

                    </div>

                </div>

            </div>
        );
    }
}

export default LoginLayout;