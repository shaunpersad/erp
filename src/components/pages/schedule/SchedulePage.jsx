import React from 'react';
import moment from 'moment';
import DatePicker from 'react-datepicker';
import ReactTable from 'react-table';
import uuid from 'uuid';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';

import CreateProductionRequest from './CreateProductionRequest.jsx';

import lines from './_data/lines';
import products from './_data/products';
import components from './_data/components';
import orders from './_data/orders';

import './SchedulePage.css';

const format = 'YYYY-MM-DD';

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
        failedToSchedule: null,
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

    onClickCreateScheduledShift = ({ currentTarget: { value: productionRequestId } }) => {

        const day = {};
        const night = {};

        this.state.scheduledShifts.forEach(shift => {
            if (shift.line === this.state.selectedLine) {
                switch (shift.type) {
                    case 'day':
                        if (!day[shift.date]) {
                            day[shift.date] = [];
                        }
                        day[shift.date].push(shift);
                        break;
                    case 'night':
                        if (!night[shift.date]) {
                            night[shift.date] = [];
                        }
                        night[shift.date].push(shift);
                        break;
                }
            }
        });

        const currentDate = this.state.startDate.clone();
        const end = this.state.endDate.clone().add(1, 'day').format(format);
        let scheduled = null;

        while (end !== currentDate.format(format)) {

            const date = currentDate.format(format);

            if (!day[date] || day[date].length < 3) {

                scheduled = { date, type: 'day' };
                break;
            }

            if (!night[date] || night[date].length < 3) {
                scheduled = { date, type: 'night' };
            }

            currentDate.add(1, 'day');
        }

        if (!scheduled) {
            return this.setState({
                failedToSchedule: productionRequestId
            });
        }

        this.setState({
            failedToSchedule: null,
            scheduledShifts: this.state.scheduledShifts.concat({
                productionRequestId,
                numProduced: 0,
                line: this.state.selectedLine,
                date: scheduled.date,
                type: scheduled.type,
                id: uuid.v4()
            })
        });

    };

    onScheduledShiftReorder = ({source, destination, draggableId: sourceId}) => {

        if (!destination) {
            return;
        }

        const [ sourceLine, sourceDate, sourceType ] = source.droppableId.split('/');
        const [ destinationLine, destinationDate, destinationType ] = destination.droppableId.split('/');
        const sourceShifts = [];
        let destinationShifts = [];
        let scheduledShifts = [];
        let movedShift = null;

        this.state.scheduledShifts.forEach(shift => {

            if (shift.id === sourceId) {

                movedShift = Object.assign({}, shift, {
                    line: destinationLine,
                    date: destinationDate,
                    type: destinationType
                });
            }

            if (shift.line === destinationLine && shift.date === destinationDate && shift.type === destinationType) {

                return destinationShifts.push(shift);
            }

            if (shift.line === sourceLine && shift.date === sourceDate && shift.type === sourceType) {

                return sourceShifts.push(shift);
            }

            scheduledShifts.push(shift);
        });

        sourceShifts.splice(source.index, 1);
        destinationShifts.splice(destination.index, 0, movedShift);

        if (source.droppableId === destination.droppableId) {

            destinationShifts = destinationShifts.filter(shift => shift.id !== sourceId || shift === movedShift);

        } else {

            scheduledShifts = scheduledShifts.concat(sourceShifts);
        }

        if (destinationShifts.length > 3) {
            return;
        }

        scheduledShifts = scheduledShifts.concat(destinationShifts);


        this.setState({ scheduledShifts }, () => {
            console.log(this.state.scheduledShifts);
        });

    };

    forEachDate = fn => {

        const { startDate, endDate } = this.state;
        const currentDate = startDate.clone();
        const end = endDate.clone().add(1, 'day').format(format);

        while (end !== currentDate.format(format)) {

            const date = currentDate.format(format);
            currentDate.add(1, 'day');

            fn(date);
        }
    };

    makeDraggableShift = (shift, index) => {

        if (!shift) {
            return null;
        }

        return (
            <Draggable
                draggableId={shift.id}
                index={index}
                key={shift.id}
            >
                {(provided, snapshot) => (
                    <div
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        {...provided.dragHandleProps}
                    >
                        <span className="label label-info">
                            {shift.productionRequestId.split('/')[0]} ({shift.numProduced})
                        </span>
                    </div>
                )}
            </Draggable>
        );
    };

    get orders() {

        const columns = [
            {
                Header: 'Order',
                className: 'first',
                accessor: 'id',
                minWidth: 50
            }
        ];

        if (this.state.expanded !== 'shifts') {

            columns.push(
                {
                    Header: 'Product',
                    accessor: 'productId',
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
                    Header: 'Qty',
                    accessor: 'quantity'
                },
                {
                    Header: 'Due',
                    accessor: 'dateDue'
                }
            );
        }

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
                                <span className="icon-vertical_align_top" />
                            </button>
                            <button
                                value={row.original.id}
                                className="btn-bare"
                                disabled={row.index === 0}
                                onClick={this.onMoveOrderUp}
                            >
                                <span className="icon-long_arrow_up" />
                            </button>
                            <button
                                value={row.original.id}
                                className="btn-bare"
                                disabled={row.index === this.state.orders.length - 1}
                                onClick={this.onMoveOrderDown}
                            >
                                <span className="icon-long_arrow_down" />
                            </button>
                            <button
                                value={row.original.id}
                                className="btn-bare"
                                disabled={row.index === this.state.orders.length - 1}
                                onClick={this.onMoveOrderBottom}
                            >
                                <span className="icon-vertical_align_bottom" />
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
                    <div>
                        <button
                            className="btn-bare link"
                            onClick={this.onClickEditProductionRequestFactory(row.original)}
                        >
                            {row.value}
                        </button>

                        <button
                            value={row.original.id}
                            disabled={!this.state.selectedLine}
                            className="btn-bare"
                            onClick={this.onClickCreateScheduledShift}
                        >
                            <span className="icon-trending_flat" />
                        </button>

                    </div>
                )
            },
            {
                Header: '%',
                id: 'percentCompleted',
                minWidth: 30,
                accessor: row => row.numProduced / row.goal
            },
            {
                Header: 'Goal',
                accessor: 'goal',
                minWidth: 50
            }
        ];

        if (this.state.expanded !== 'pending') {

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
                id: 'line',
                accessor: line => line,
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

        const shifts = {};

        lines.forEach(line => {

            shifts[line] = {};

            this.forEachDate(date => {

                shifts[line][date] = {};

                types.forEach(type => {

                    shifts[line][date][type] = [];
                });
            });
        });

        scheduledShifts.forEach(shift => {

            shifts[shift.line][shift.date][shift.type].push(shift);
        });

        this.forEachDate(date => {

            columns.push({
                Header: date,
                className: 'date',
                id: date,
                accessor: '',
                Cell: row => (
                    <div>
                        {types.map(type => (
                            <Droppable key={type} droppableId={`${row.value}/${date}/${type}`}>
                                {(provided, snapshot) => (

                                    <div ref={provided.innerRef} key={type} className={`shifts ${type}`}>
                                        <span className={`icon-brightness_${type === 'day' ? 'low' : '2'}`} />
                                        {shifts[row.value][date][type].map(this.makeDraggableShift)}
                                        {provided.placeholder}
                                    </div>
                                )}
                            </Droppable>
                        ))}
                    </div>
                )
            });
        });


        return (
            <ReactTable
                filterable={false}
                sortable={false}
                showPagination={false}
                data={lines}
                columns={columns}
                minRows={lines.length}
                defaultSorted={[
                    {
                        id: 'line',
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
                            <span className="icon-control_point" /> Add Product for Production
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
                                    Orders
                                </button>
                            </h4>
                            <ul className="list-group">
                                {this.orders}
                            </ul>
                        </div>

                        <div className={config[1]}>

                            <h4>
                                <button className="btn-bare" value="scheduled" onClick={this.onChangeExpanded}>
                                    Products For Production
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
                                </button>
                            </h4>

                            <DragDropContext onDragEnd={this.onScheduledShiftReorder}>
                                {this.scheduledShifts}
                            </DragDropContext>
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
                shifts: ['col-lg-1', 'col-lg-3', 'col-lg-8']
            }
        };
    }
}

export default SchedulePage;