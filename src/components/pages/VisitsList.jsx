import React from 'react';
import ReactTable from 'react-table';
import { Link } from 'react-router-dom';

import './VisitsList.css';

class VisitsList extends React.Component {

    render() {

        const data = [{}];

        const columns = [
            {
                Header: 'Patient',
                className: 'first',
                Cell: props => <Link to="/patients/1">Shaun</Link>
            }, {
                Header: 'Study',
                Cell: props => <Link to="/studies/1">SANOFI</Link>
            },  {
                Header: 'Charge Slip',
                Cell: props => <Link to="/visits/1">View</Link>
            }, {
                Header: 'Start Date',
                Cell: props => <span className="date">08/08/18</span>
            }, {
                Header: 'Start Time',
                Cell: props => <span className="time">1:00pm</span>
            }, {
                Header: 'End Date',
                Cell: props => <span className="date">08/08/18</span>
            }, {
                Header: 'End Time',
                Cell: props => <span className="time">2:00pm</span>
            }, {
                Header: 'Visit #',
                Cell: props => <span className="number">5</span>
            }, {
                Header: 'Scheduled',
                Cell: props => <span className="boolean">yes</span>
            }, {
                Header: 'On Site',
                Cell: props => <span className="boolean">yes</span>
            }, {
                Header: 'Line Items',
                Cell: props => (
                    <li className="dropdown">
                        <a href="#" className="dropdown-toggle btn btn-default btn-xs" data-toggle="dropdown" role="button"
                           aria-expanded="false">$125 <span className="caret"/></a>
                    </li>
                ),
                Footer: (
                    <strong>Total: $125</strong>
                )
            }
        ];

        return (
            <div className="visits-list">

                <div className="clearfix">
                    <div className="pull-left">
                        <div className="radio">
                            <label>
                                <input type="radio" name="optionsRadios" value="list" checked />
                                List
                            </label>

                            <label>
                                <input type="radio" name="optionsRadios" value="temporal" />
                                Temporal
                            </label>
                            <div  className="select">
                                <select>
                                    <option>Las Vegas</option>
                                    <option>Los Angeles</option>
                                </select>
                            </div>
                        </div>
                    </div>
                    <div className="pull-right">
                        <button className="btn btn-primary btn-sm">Filter</button>
                        <button className="btn btn-primary btn-sm">Export</button>
                    </div>
                </div>
                <div className="filters">
                    <div className="panel panel-default">
                        <div className="panel-body">
                            Filters to go here
                        </div>
                    </div>
                </div>

                <ReactTable
                    data={data}
                    columns={columns}
                    minRows={5}
                />

            </div>
        );
    }
}

export default VisitsList;