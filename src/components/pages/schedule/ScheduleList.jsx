import React from 'react';
import ReactTable from 'react-table';
import { Link } from 'react-router-dom';

import './ScheduleList.css';

class ScheduleList extends React.Component {

    render() {

        const { lines, shifts, pendingOrders, scheduledOrders, statuses, startDate, endDate } = this.props;
        const currentDate = startDate.clone();
        const format = 'YYYY-MM-DD';
        const end = endDate.clone().add(1, 'day').format(format);
        const data = [];
        const dates = [];
        const unique = {};

        scheduledOrders.forEach(order => {

            if (!unique[order.date]) {
                unique[order.date] = {};
            }
            if (!unique[order.date][order.line]) {
                unique[order.date][order.line] = {};
            }
            if (!unique[order.date][order.line][order.shift]) {
                unique[order.date][order.line][order.shift] = true;
            }

            data.push(order);
        });

        pendingOrders.forEach(({ id }) => {

            data.push({ id });
        });

        while (end !== currentDate.format(format)) {

            const date = currentDate.format('YYYY-MM-DD');
            dates.push(date);

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

            currentDate.add(1, 'day');
        }




        const columns = [
            {
                Header: 'Line',
                className: 'first',
                accessor: 'line',
                Cell: props => <Link to={`/lines/${props.value}`}>{props.value}</Link>,
                Filter: ({ filter, onChange }) => (
                    <select
                        onChange={event => onChange(event.target.value)}
                        style={{ width: "100%" }}
                        value={filter? filter.value: ''}
                    >
                        {lines.map(line => (
                            <option value={line}>{line}</option>
                        )).concat(
                            <option value="">All</option>
                        )}
                    </select>
                )
            }, {
                Header: 'Shift',
                accessor: 'shift',
                Filter: ({ filter, onChange }) => (
                    <select
                        onChange={event => onChange(event.target.value)}
                        style={{ width: "100%" }}
                        value={filter? filter.value: ''}
                    >
                        {shifts.map(shift => (
                            <option value={shift}>{shift}</option>
                        )).concat(
                            <option value="">All</option>
                        )}
                    </select>
                )
            },  {
                Header: 'Date',
                accessor: 'date',
                Filter: ({ filter, onChange }) => (
                    <select
                        onChange={event => onChange(event.target.value)}
                        style={{ width: "100%" }}
                        value={filter? filter.value: ''}
                    >
                        {Object.keys(dates).map(date => (
                            <option value={date}>{date}</option>
                        )).concat(
                            <option value="">All</option>
                        )}
                    </select>
                )
            }, {
                Header: 'Order ID',
                accessor: 'id',
                Cell: props => props.value || '-',
                Aggregated: () => ''
            }, {
                Header: 'Status',
                accessor: 'status',
                Filter: ({ filter, onChange }) => (
                    <select
                        onChange={event => onChange(event.target.value)}
                        style={{ width: "100%" }}
                        value={filter? filter.value: ''}
                    >
                        {statuses.map(status => (
                            <option value={status}>{status}</option>
                        )).concat(
                            <option value="">All</option>
                        )}
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