import React from 'react';
import moment from 'moment';
import uuid from 'uuid';
import DatePicker from 'react-datepicker';
import ReactTable from 'react-table';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { Modal } from 'react-bootstrap';

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
        detailView: null,
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

            currentDate.add(1, 'day');

            if (currentDate.day() === 1) {
                continue;
            }

            if (!day[date] || day[date].length < 3) {

                scheduled = { date, type: 'day' };
                break;
            }

            if (!night[date] || night[date].length < 3) {
                scheduled = { date, type: 'night' };
            }
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

        this.setState({ scheduledShifts });

    };

    onHideDetailView = () => {

        this.setState({ detailView: null });
    };

    onClickShowOrder = ({ currentTarget: { value: orderId } }) => {

        this.setState({ detailView: orderId });
    };

    onClickShowProduct = ({ currentTarget: { value: productId } }) => {

        this.setState({ detailView: productId });
    };

    forEachDate = fn => {

        const { startDate, endDate } = this.state;
        const currentDate = startDate.clone();
        const end = endDate.clone().add(1, 'day').format(format);

        while (end !== currentDate.format(format)) {


            const date = currentDate.format(format);
            currentDate.add(1, 'day');

            if (currentDate.day() === 1) {
                continue;
            }

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
                        <div className="label label-info">
                            <button className="btn-bare">
                                <span className="icon-close" />
                            </button>
                            {shift.productionRequestId.split('/')[0]} ({shift.numProduced})
                        </div>
                    </div>
                )}
            </Draggable>
        );
    };

    // createOrderStatuses = () => {
    //
    //     const products = [].concat(this.state.products);
    //     const components = [].concat(this.state.components);
    //     const orderStatuses = {};
    //
    //     this.state.orders.forEach(order => {
    //
    //         const product = products.find(product => product.id === order.productId);
    //         const productComponents = components.filter(component => !!product.components[component.id]);
    //         const dateDue = moment(order.dateDue, format);
    //         let numProduced = 0;
    //         let scheduled = 0;
    //         let minimumCanMake = order.quantity;
    //         let willMake = true;
    //
    //         orderStatuses[order.id] = { color: 'red', messages: [] };
    //
    //         this.state.scheduledShifts.forEach(shift => {
    //
    //             if (shift.productId === order.productId) {
    //
    //                 numProduced+= shift.numProduced;
    //             }
    //         });
    //
    //         if (numProduced >= order.quantity) {
    //             orderStatuses[order.id].color = 'green';
    //             orderStatuses[order.id].messages.push(`Produced ${numProduced}`);
    //             return;
    //         }
    //
    //         this.state.productionRequests.forEach(productionRequest => {
    //
    //
    //
    //         });
    //
    //
    //
    //         if (dateDue.isBefore(this.props.now)) {
    //             orderStatuses[order.id].color = 'yellow';
    //             orderStatuses[order.id].messages.push(`Order was due ${dateDue.fromNow()}`);
    //         }
    //
    //         Object.keys(product.components).forEach(componentId => {
    //
    //             const requiredByProduct = product.components[componentId];
    //             const requiredByOrder = requiredByProduct * order.quantity;
    //             const component = productComponents.find(component => component.id === componentId);
    //             const onHand = component ? component.onHand : 0;
    //
    //             if (requiredByOrder > onHand) {
    //
    //                 orderStatuses[order.id].messages.push(`${componentId}: Not enough on hand to complete the order.`);
    //                 orderStatuses[order.id].messages.push(`${componentId}: ${requiredByOrder} required, ${onHand} on hand.`);
    //
    //                 // TODO: account for components coming in at a later date
    //
    //                 const minimum = Math.floor(onHand / requiredByProduct);
    //
    //                 if (minimum < minimumCanMake) {
    //                     minimumCanMake = minimum;
    //                 }
    //             }
    //         });
    //
    //         if (minimumCanMake < order.quantity) {
    //             willMake = false;
    //             status.messages.push(`Can make ${minimumCanMake} out of ${order.quantity}.`);
    //
    //             if ((minimumCanMake + product.onHand) > order.quantity) {
    //
    //                 const willRemove = order.quantity - minimumCanMake;
    //                 willMake = true;
    //                 orderStatuses[order.id].color = 'yellow';
    //                 orderStatuses[order.id].messages.push(`Can use ${willRemove} from safety to fulfill order.`);
    //                 product.onHand-= willRemove;
    //             }
    //         }
    //
    //         if (willMake) {
    //
    //             Object.keys(product.components).forEach(componentId => {
    //
    //                 const requiredByProduct = product.components[componentId];
    //                 const component = productComponents.find(component => component.id === componentId);
    //                 component.quantity-= (willMake * requiredByProduct);
    //             });
    //         }
    //
    //     });
    //
    // };

    get orders() {

        const columns = [
            {
                Header: 'Order',
                className: 'first',
                accessor: 'id',
                minWidth: 50,
                Cell: row => (
                    <button
                        className="btn-bare link text-warning"
                        onClick={this.onClickShowOrder}
                        value={row.value}
                    >
                        {row.value}
                    </button>
                )
            }
        ];

        if (this.state.expanded !== 'shifts') {

            columns.push(
                {
                    Header: 'Product',
                    accessor: 'productId',
                    Cell: row => (
                        <div>
                            <button
                                className="btn-bare link"
                                onClick={this.onClickShowProduct}
                                value={row.value}
                            >
                                {row.value}
                            </button>
                            <button
                                className="btn-bare"
                                onClick={this.onClickCreateProductionRequestFactory(row.original)}
                            >
                                <span className="icon-trending_flat" />
                            </button>
                        </div>
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
                    id: 'priority',
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
                showPagination={false}
                minRows={this.state.orders.length || 3}
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
                            className="btn-bare link text-warning"
                            onClick={this.onClickShowProduct}
                            value={row.value}
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
                minWidth: 75,
                Cell: row => (
                    <div>
                        {row.value}
                        <button
                            className="btn-bare"
                            onClick={this.onClickEditProductionRequestFactory(row.original)}
                        >
                            <span className="icon-mode_edit" />
                        </button>
                    </div>
                )
            }
        ];

        return (
            <ReactTable
                columns={columns}
                data={this.state.productionRequests}
                showPagination={false}
                minRows={this.state.productionRequests.length || 3}
            />
        );

    }

    get scheduledShifts() {

        const { lines, scheduledShifts, selectedLine } = this.state;
        const types = ['day', 'night'];
        const columns = [
            {
                Header: 'Line',
                className: 'sticky',
                headerClassName: 'sticky',
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

            console.log(shift);

            shifts[shift.line][shift.date][shift.type].push(shift);
        });

        this.forEachDate(date => {

            columns.push({
                Header: date,
                className: 'date',
                id: date,
                accessor: '',
                minWidth: 120,
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
                data={lines}
                columns={columns}
                showPagination={false}
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

    get detailView() {

        return (
            <Modal show={!!this.state.detailView} onHide={this.onHideDetailView}>
                <Modal.Header closeButton>
                    <Modal.Title>{this.state.detailView}</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <div className="panel panel-default">
                        <div className="panel-body">
                            Details go here, including the status and description of any issues.
                        </div>
                    </div>

                    <div className="panel panel-default">
                        <div className="panel-body">

                            <div className="timeline">

                                <div className="line" />
                                <ul className="timeline">
                                    <li>
                                        <div className="clearfix">
                                            <div className="date pull-left">
                                                1 week ago
                                            </div>
                                            <div className="events pull-left">
                                                <ul>
                                                    <li>
                                                        <span>•</span>
                                                        An event happened, e.g. new orders fulfilled
                                                    </li>
                                                </ul>
                                            </div>
                                        </div>
                                    </li>
                                    <li>
                                        <div className="clearfix">
                                            <div className="date pull-left">
                                                2 days ago
                                            </div>
                                            <div className="events pull-left">
                                                <ul>
                                                    <li>
                                                        <span>•</span>
                                                        An event happened, e.g. inventory changed
                                                    </li>
                                                    <li>
                                                        <span>•</span>
                                                        Another event
                                                    </li>
                                                </ul>
                                            </div>
                                        </div>
                                    </li>
                                </ul>

                            </div>

                        </div>
                    </div>

                </Modal.Body>
            </Modal>
        );

    }

    render() {

        if (this.state.loading) {
            return 'Loading...';
        }

        const config = this.props.expandedConfig[this.state.expanded];

        return (
            <div className="schedule-page">

                {this.detailView}
                {this.productionRequest}

                <div className="clearfix page-options">
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

                <div className="clearfix page-options">

                    <div className="pull-left">
                        <ul className="legend">
                            <li>
                                <span className="label label-warning" />
                                Action required
                            </li>
                            <li>
                                <span className="label label-info" />
                                In progress
                            </li>
                            <li>
                                <span className="label label-success" />
                                Completed
                            </li>
                            <li>
                                <span className="label label-danger" />
                                Blocked
                            </li>
                        </ul>
                    </div>

                    <div className="pull-right">
                        <div className="filters">
                            <div className="date-range">
                                <DatePicker
                                    startDate={this.state.startDate}
                                    endDate={this.state.endDate}
                                    className="form-control"
                                    selected={this.state.startDate}
                                    onSelect={this.onChangeStartDate}
                                />
                                <div className="divider">-</div>
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

                </div>


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