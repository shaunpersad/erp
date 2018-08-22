import React from 'react';
import moment from 'moment';
import DatePicker from 'react-datepicker';
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

    get orders() {

        if (this.state.orders.length === 0) {

            return (
                <li key="none" className="list-group-item">
                    None
                </li>
            );
        }

        return this.state.orders.map(order => (
            <li key={order.id} className="list-group-item">

                <p className="list-group-item-text">{order.productId} ({order.quantity})</p>
                <small className="list-group-item-text">
                    {order.dateDue.format('YYYY-MM-DD')}
                </small>
            </li>
        ));
    }

    get productionRequests() {

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
                    <div className="pull-right">
                        <button className="btn btn-primary btn-sm">Reset</button>
                        <button className="btn btn-primary btn-sm">Apply Recommendations</button>
                        <button className="btn btn-success btn-sm">save</button>

                    </div>
                </div>

                <hr />

                <div className="view">

                    <div className="row">

                        <div className="col-lg-2">

                            <h4>
                                Pending
                            </h4>
                            <ul className="list-group">
                                {this.orders}
                            </ul>
                        </div>

                        <div className="col-lg-2">

                            <h4>
                                Scheduled
                            </h4>

                            <ul className="list-group">
                                {this.productionRequests}
                            </ul>
                        </div>

                        <div className="col-lg-8">

                            <h4>Shifts</h4>

                            {this.scheduledShifts}
                        </div>

                    </div>

                </div>

            </div>
        );
    }

    static get defaultProps() {

        return {
            now: moment()
        };
    }
}

export default SchedulePage;