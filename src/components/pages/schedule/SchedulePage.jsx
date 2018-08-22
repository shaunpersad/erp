import React from 'react';
import moment from 'moment';
import DatePicker from 'react-datepicker';
import ReactTable from 'react-table';
import './SchedulePage.css';

import ScheduleList from './ScheduleList.jsx';
import ScheduleCalendar from './ScheduleCalendar.jsx';

import lines from './_data/lines';
import products from './_data/products';
import components from './_data/components';
import orders from './_data/orders';

class SchedulePage extends React.Component {

    state = {
        loading: true,
        changed: false,
        expanded: 'pending',
        lines: null,
        products: null,
        components: null,
        orders: null,
        productionRequests: [],
        scheduledShifts: [],
        startDate: this.props.now.clone().startOf('week'),
        endDate: this.props.now.clone().endOf('week')
    };

    componentDidMount() {

        this.setState({
            loading: false,
            lines,
            products,
            components,
            orders,
        });
    }

    onChangeStartDate = startDate => {

        this.setState({ startDate });
    };

    onChangeEndDate = endDate => {

        this.setState({ endDate });
    };

    onChangeExpanded = ({ currentTarget: { value: expanded } }) => {

        this.setState({ expanded });
    };

    get orders() {

        const columns = [
            {
                Header: 'Order',
                className: 'first',
                accessor: 'id'
            },
            {
                Header: 'Product',
                accessor: 'productId'
            },
            {
                Header: 'Qty',
                accessor: 'quantity'
            },
            {
                Header: 'Due',
                accessor: 'dateDue'
            },
            {
                Header: '',
                accessor: '',
                id: 'actions',
                Cell: row => (
                    <div>
                        <button className="btn-bare">
                            <span className="icon-control_point" />
                        </button>
                        <button className="btn-bare">
                            <span className="icon-lightbulb_outline" />
                        </button>
                        <button className="btn-bare">
                            <span className="icon-swap_vert" />
                        </button>
                    </div>
                )
            }
        ];

        return (
            <ReactTable
                sortable={false}
                columns={columns}
                data={this.state.orders}
            />
        );
    }

    get productionRequests() {

        const columns = [
            {
                Header: 'Product',
                className: 'first',
                accessor: 'productId'
            },
            {
                Header: 'Goal',
                accessor: 'quantity'
            },
            {
                Header: '%',
                id: 'percentCompleted',
                accessor: row => row.numProduced / row.quantity
            },
            {
                Header: '',
                accessor: '',
                id: 'actions',
                Cell: row => (
                    <div>
                        <button className="btn-bare">
                            <span className="icon-remove_circle_outline" />
                        </button>
                        <button className="btn-bare">
                            <span className="icon-swap_horiz" />
                        </button>
                    </div>
                )
            }
        ];

        return (
            <ReactTable
                columns={columns}
                data={this.state.productionRequests}
            />
        );


        if (this.state.productionRequests.length === 0) {

            return (
                <li key="none" className="list-group-item">
                    None
                </li>
            );
        }

        return this.state.productionRequests.map(productionRequest => (
            <li key={productionRequest.id} className="list-group-item">
                <span className="badge">{productionRequest.goal}</span>
                {productionRequest.productId}
            </li>
        ));
    }

    get scheduledShifts() {

        return (
            <ScheduleCalendar {...this.state} />
        );
    }

    render() {

        if (this.state.loading) {
            return 'Loading...';
        }

        const config = this.props.expandedConfig[this.state.expanded];

        return (
            <div className="schedule-page">

                <div className="clearfix page-options">
                    <div className="pull-left">
                        <div className="filters">
                            <div className="date-range">
                                <DatePicker
                                    startDate={this.state.startDate}
                                    endDate={this.state.endDate}
                                    className="form-control"
                                    selected={this.state.startDate}
                                    onSelect={this.onChangeStartDate}
                                />
                                <div>-</div>
                                <DatePicker
                                    startDate={this.state.startDate}
                                    endDate={this.state.endDate}
                                    className="form-control"
                                    selected={this.state.endDate}
                                    onSelect={this.onChangeEndDate}
                                />
                            </div>

                        </div>
                    </div>
                    <div className="pull-left">
                        <button className="btn btn-primary btn-sm"><span className="icon-control_point" /> Add Product to Schedule</button>
                        <button className="btn btn-primary btn-sm"><span className="icon-lightbulb_outline" />  Apply All Recommendations</button>
                    </div>
                    <div className="pull-right">
                        <button disabled={!this.state.changed} className="btn btn-default btn-sm">Reset</button>
                        <button disabled={!this.state.changed} className="btn btn-success btn-sm">Save</button>

                    </div>
                </div>

                <hr />

                <div className="view">

                    <div className="row">

                        <div className={config[0]}>

                            <h4>
                                <button className="btn-bare" value="pending" onClick={this.onChangeExpanded}>
                                    Pending
                                    <span className="icon-settings_ethernet" />
                                </button>
                            </h4>
                            <ul className="list-group">
                                {this.orders}
                            </ul>
                        </div>

                        <div className={config[1]}>

                            <h4>
                                <button className="btn-bare" value="scheduled" onClick={this.onChangeExpanded}>
                                    Scheduled
                                    <span className="icon-settings_ethernet" />
                                </button>
                            </h4>

                            <ul className="list-group">
                                {this.productionRequests}
                            </ul>
                        </div>

                        <div className={config[2]}>

                            <h4>
                                <button className="btn-bare" value="shifts" onClick={this.onChangeExpanded}>
                                    Shifts
                                    <span className="icon-settings_ethernet" />
                                </button>
                            </h4>

                            {this.scheduledShifts}
                        </div>

                    </div>

                </div>

            </div>
        );
    }

    static get defaultProps() {

        return {
            now: moment(),
            expandedConfig: {
                pending: ['col-lg-6', 'col-lg-3', 'col-lg-3'],
                scheduled: ['col-lg-4', 'col-lg-4', 'col-lg-4'],
                shifts: ['col-lg-2', 'col-lg-4', 'col-lg-6']
            }
        };
    }
}

export default SchedulePage;