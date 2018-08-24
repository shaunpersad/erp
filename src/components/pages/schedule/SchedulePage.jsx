import React from 'react';
import moment from 'moment';
import DatePicker from 'react-datepicker';
import ReactTable from 'react-table';

import CreateProductionRequest from './CreateProductionRequest.jsx';

import lines from './_data/lines';
import products from './_data/products';
import components from './_data/components';
import orders from './_data/orders';

import './SchedulePage.css';

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
        productionRequest: null,
        selectedLine: null,
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

    onClickCreateProductionRequestFactory = order => {

        return () => {

            this.setState({
                productionRequest: order ? {
                    productId: order.productId,
                    goal: order.quantity
                } : {}
            });
        };
    };

    onClickEditProductionRequestFactory = productionRequest => {

        return () => {

            this.setState({ productionRequest });
        };
    };

    onHideProductionRequestModal = () => {

        this.setState({ productionRequest: null });
    };

    onProductionRequestCreated = ({ id, productId, goal }) => {

        const productionRequests = [
            {
                id,
                productId,
                goal,
                numProduced: 0
            }
        ].concat(this.state.productionRequests.filter(productionRequest => productionRequest.id !== id));

        this.setState({
            productionRequests,
            productionRequest: null
        });
    };

    onMoveOrderTop = ({ currentTarget: { value: orderId } }) => {

        let top = null;
        const orders = this.state.orders.filter(order => {

            if (order.id === orderId) {
                top = order;
                return false;
            }
            return true;
        });

        this.setState({ orders: [top].concat(orders) });
    };

    onMoveOrderUp = ({ currentTarget: { value: orderId } }) => {

        const orders = [];

        this.state.orders.forEach(order => {

            if (order.id === orderId) {
                const previous = orders.pop();
                return orders.push(order, previous);
            }
            orders.push(order);
        });

        this.setState({ orders });
    };

    onMoveOrderDown = ({ currentTarget: { value: orderId } }) => {

        const orders = [];
        let down = null;

        this.state.orders.forEach(order => {

            if (down) {
                orders.pop();
            }
            orders.push(order);
            if (down) {
                orders.push(down);
                down = null;
            }
            if (order.id === orderId) {
                down = order;
            }
        });

        this.setState({ orders });
    };

    onMoveOrderBottom = ({ currentTarget: { value: orderId } }) => {

        let bottom = null;
        const orders = this.state.orders.filter((order, i) => {

            if (order.id === orderId) {
                bottom = order;
                return false;
            }
            return true;
        });

        orders.push(bottom);

        this.setState({ orders });
    };

    onChangeSelectedLine = ({ currentTarget: { value: line, checked } }) => {

        this.setState({
            selectedLine: checked ? line : null
        });
    };

    forEachDate = fn => {

        const { startDate, endDate } = this.state;
        const format = 'YYYY-MM-DD';

        const currentDate = startDate.clone();
        const end = endDate.clone().add(1, 'day').format(format);

        while (end !== currentDate.format(format)) {

            const date = currentDate.format(format);
            currentDate.add(1, 'day');

            fn(date);
        }
    };

    get orders() {

        const columns = [
            {
                Header: 'Order',
                className: 'first',
                accessor: 'id',
                Cell: row => (
                    <button
                        className="btn-bare link"
                        onClick={this.onClickCreateProductionRequestFactory(row.original)}
                    >
                        {row.value}
                    </button>
                )
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
            }
        ];

        if (this.state.expanded === 'pending') {
            columns.push(
                {
                    Header: 'Priority',
                    accessor: '',
                    id: 'actions',
                    Cell: row => (
                        <div>
                            <button
                                value={row.original.id}
                                className="btn-bare"
                                disabled={row.index === 0}
                                onClick={this.onMoveOrderTop}
                            >
                                <span className="icon-move_up" />
                            </button>
                            <button
                                value={row.original.id}
                                className="btn-bare"
                                disabled={row.index === 0}
                                onClick={this.onMoveOrderUp}
                            >
                                <span className="icon-keyboard_arrow_up" />
                            </button>
                            <button
                                value={row.original.id}
                                className="btn-bare"
                                disabled={row.index === this.state.orders.length - 1}
                                onClick={this.onMoveOrderDown}
                            >
                                <span className="icon-keyboard_arrow_down" />
                            </button>
                            <button
                                value={row.original.id}
                                className="btn-bare"
                                disabled={row.index === this.state.orders.length - 1}
                                onClick={this.onMoveOrderBottom}
                            >
                                <span className="icon-move_down" />
                            </button>
                        </div>
                    )
                }
            );
        }

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
                accessor: 'productId',
                Cell: row => (
                    <button
                        className="btn-bare link"
                        onClick={this.onClickEditProductionRequestFactory(row.original)}
                    >
                        {row.value}
                    </button>
                )
            },
            {
                Header: 'Goal',
                accessor: 'goal'
            },
            {
                Header: '%',
                id: 'percentCompleted',
                accessor: row => row.numProduced / row.goal
            }
        ];

        if (this.state.expanded !== 'pending') {

            columns.push(
                {
                    Header: 'Schedule',
                    accessor: '',
                    id: 'actions',
                    Cell: row => (
                        <div>
                            <button
                                value={row.original.id}
                                className="btn-bare"
                            >
                                <span className="icon-lightbulb_outline" />
                            </button>
                            <button
                                value={row.original.id}
                                disabled={!this.state.selectedLine}
                                className="btn-bare"
                            >
                                <span className="icon-keyboard_arrow_right" />
                            </button>
                        </div>
                    )
                }
            );
        }

        return (
            <ReactTable
                columns={columns}
                data={this.state.productionRequests}
            />
        );

    }

    get scheduledShifts() {

        const { lines, scheduledShifts, selectedLine } = this.state;
        const types = ['day', 'night'];
        const columns = [
            {
                Header: 'Line',
                className: 'first',
                accessor: 'line',
                Cell: row => (
                    <label>
                        <input
                            type="checkbox"
                            value={row.value}
                            checked={selectedLine === row.value}
                            onChange={this.onChangeSelectedLine}
                        />
                        {row.value}
                    </label>
                )
            }
        ];

        const data = [];

        lines.forEach(line => {

            const shifts = {};

            this.forEachDate(date => {

                shifts[date] = [];

                types.forEach(type => {

                    for(let position = 0; position < 3; position++) {

                        shifts[date].concat(scheduledShifts.filter(shift => {

                            return shift.line === line && shift.date === date && shift.type === type && shift.position === position;
                        }));
                    }
                });
            });

            data.push({ line, shifts });
        });

        this.forEachDate(date => {

            columns.push({
                Header: date,
                className: 'date',
                id: date,
                accessor: row => row.shifts[date] ? row.shifts[date].map(shift => shift.productId) : ''
            });
        });


        return (
            <ReactTable
                filterable={false}
                sortable={false}
                showPagination={false}
                data={data}
                columns={columns}
                minRows={data.length}
                defaultSorted={[
                    {
                        id: 'line',
                        desc: false
                    },
                    {
                        id: 'type',
                        desc: false
                    }
                ]}
            />
        );
    }

    get productionRequest() {

        const { productionRequest } = this.state;

        if (!productionRequest) {
            return null;
        }

        const props = {
            products,
            onHide: this.onHideProductionRequestModal,
            onCreated: this.onProductionRequestCreated
        };

        if (productionRequest) {
            Object.assign(props, productionRequest);
        }

        return (
            <CreateProductionRequest {...props} />
        );
    }

    render() {

        if (this.state.loading) {
            return 'Loading...';
        }

        const config = this.props.expandedConfig[this.state.expanded];

        return (
            <div className="schedule-page">

                {this.productionRequest}

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
                        <button
                            className="btn btn-primary btn-sm"
                            onClick={this.onClickCreateProductionRequestFactory()}
                        >
                            <span className="icon-control_point" /> Add Product to Production
                        </button>
                        <button
                            className="btn btn-primary btn-sm"
                        >
                            <span className="icon-lightbulb_outline" /> Apply Recommendations
                        </button>
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
                                    Open Orders <span className="icon-settings_ethernet" />
                                </button>
                            </h4>
                            <ul className="list-group">
                                {this.orders}
                            </ul>
                        </div>

                        <div className={config[1]}>

                            <h4>
                                <button className="btn-bare" value="scheduled" onClick={this.onChangeExpanded}>
                                    Products For Production <span className="icon-settings_ethernet" />
                                </button>
                            </h4>

                            <ul className="list-group">
                                {this.productionRequests}
                            </ul>
                        </div>

                        <div className={config[2]}>

                            <h4>
                                <button className="btn-bare" value="shifts" onClick={this.onChangeExpanded}>
                                    Shifts <span className="icon-settings_ethernet" />
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