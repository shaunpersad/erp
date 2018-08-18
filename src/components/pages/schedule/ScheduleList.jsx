import React from 'react';
import moment from 'moment';
import ReactTable from 'react-table';
import { Link } from 'react-router-dom';

import './ScheduleList.css';

class ScheduleList extends React.Component {

    state = {
        id: '',
        status: '',
        line: '',
        shift: '',
        date: this.props.now.isBetween(this.props.startDate, this.props.endDate) ? this.props.now.format('YYYY-MM-DD') : '',
        openSlots: 'hide'
    };

    onChangeId = ({ currentTarget: { value: id } }) => {

        this.setState({ id });
    };

    onChangeStatus = ({ currentTarget: { value: status } }) => {

        this.setState({ status });
    };

    onChangeLine = ({ currentTarget: { value: line } }) => {

        this.setState({ line });
    };

    onChangeShift = ({ currentTarget: { value: shift } }) => {

        this.setState({ shift });
    };

    onChangeDate = ({ currentTarget: { value: date } }) => {

        this.setState({ date });
    };

    onChangeOpenSlots = ({ currentTarget: { value: openSlots } }) => {

        this.setState({ openSlots });
    };

    render() {

        const { lines, shifts, pendingOrders, scheduledOrders, statuses, startDate, endDate } = this.props;
        const currentDate = startDate.clone();
        const format = 'YYYY-MM-DD';
        const end = endDate.clone().add(1, 'day').format(format);
        const data = [];
        const dates = [];
        const unique = {};

        scheduledOrders.concat(pendingOrders).forEach(order => {

            if (!unique[order.date]) {
                unique[order.date] = {};
            }
            if (!unique[order.date][order.line]) {
                unique[order.date][order.line] = {};
            }
            if (!unique[order.date][order.line][order.shift]) {
                unique[order.date][order.line][order.shift] = true;
            }

            if (this.state.id && !order.id.startsWith(this.state.id)) {
                return;
            }
            if(this.state.status && order.status !== this.state.status) {
                return;
            }

            switch(this.state.line) {
                case 'unassigned':
                    if (!!order.line) {
                        return;
                    }
                    break;
                case '':
                    break;
                default:
                    if (this.state.line !== order.line) {
                        return;
                    }
                    break;
            }
            if(this.state.shift && order.shift !== this.state.shift) {
                return;
            }
            if(this.state.date && order.date && order.date !== this.state.date) {
                return;
            }

            data.push(order);
        });

        while (end !== currentDate.format(format)) {

            const date = currentDate.format('YYYY-MM-DD');
            currentDate.add(1, 'day');
            dates.push(date);

            if (this.state.openSlots === 'hide') {
                continue;
            }

            if (!unique[date]) {
                unique[date] = {};
            }

            lines.forEach(line => {

                if (!unique[date][line]) {
                    unique[date][line] = {};
                }

                shifts.forEach(shift => {

                    if (!unique[date][line][shift]) {

                        data.push({ date, line, shift });
                    }
                });
            });
        }




        const columns = [
            {
                Header: 'Order ID',
                accessor: 'id',
                Cell: props => props.value || '-'
            }, {
                Header: 'Status',
                accessor: 'status',
                Filter: ({ filter, onChange }) => (
                    <select
                        onChange={this.onChangeId}
                        style={{ width: "100%" }}
                        value={this.state.id}
                    >
                        {statuses.map(status => (
                            <option key={status} value={status}>{status}</option>
                        )).concat(
                            <option key="all" value="">All</option>
                        )}
                    </select>
                )
            },
            {
                Header: 'Line',
                className: 'first',
                accessor: 'line',
                Cell: props => (props.value ? (
                    <Link to={`/lines/${props.value}`}>{props.value}</Link>
                ): 'unassigned'),
                Filter: ({ filter, onChange }) => (
                    <select
                        onChange={this.onChangeLine}
                        style={{ width: "100%" }}
                        value={this.state.line}
                    >
                        {lines.map(line => (
                            <option key={line} value={line}>{line}</option>
                        )).concat(
                            <option key="unassigned" value="unassigned">Unassigned</option>,
                            <option key="all" value="">All</option>
                        )}
                    </select>
                )
            }, {
                Header: 'Shift',
                accessor: 'shift',
                Cell: props => props.value || '-',
                Filter: ({ filter, onChange }) => (
                    <select
                        onChange={this.onChangeShift}
                        style={{ width: "100%" }}
                        value={this.state.shift}
                    >
                        {shifts.map(shift => (
                            <option key={shift} value={shift}>{shift}</option>
                        )).concat(
                            <option key="all" value="">All</option>
                        )}
                    </select>
                )
            },  {
                Header: 'Date',
                accessor: 'date',
                Cell: props => props.value || '-',
                Filter: ({ filter, onChange }) => (
                    <select
                        onChange={this.onChangeDate}
                        style={{ width: "100%" }}
                        value={this.state.date}
                    >
                        {dates.map(date => (
                            <option key={date} value={date}>{date}</option>
                        )).concat(
                            <option key="all" value="">All</option>
                        )}
                    </select>
                )
            },  {
                Header: 'Open Slots',
                Filter: ({ filter, onChange }) => (
                    <select
                        onChange={this.onChangeOpenSlots}
                        style={{ width: "100%" }}
                        value={this.state.openSlots}
                    >
                        <option value="show">Show</option>
                        <option value="hide">Hide</option>
                    </select>
                )
            }
        ];

        return (
            <div className="schedule-list">

                <ReactTable
                    filterable
                    data={data}
                    columns={columns}
                    minRows={5}
                    defaultSorted={[
                        {
                            id: 'line',
                            desc: false
                        },
                        {
                            id: 'shift',
                            desc: false
                        },
                        {
                            id: 'date',
                            desc: false
                        }
                    ]}
                />

            </div>
        );
    }
}

export default ScheduleList;