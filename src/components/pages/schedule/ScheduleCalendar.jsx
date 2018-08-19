import React from 'react';
import ReactTable from 'react-table';

import './ScheduleCalendar.css';

class ScheduleCalendar extends React.Component {

    state = {
        orders: this.props.scheduledOrders
    };

    render() {

        const { lines, shifts, startDate, endDate } = this.props;
        const currentDate = startDate.clone();
        const format = 'YYYY-MM-DD';
        const end = endDate.clone().add(1, 'day').format(format);
        const existingLines = {};
        const data = [];
        const columns = [
            {
                Header: 'Line',
                className: 'first',
                accessor: 'line'
            },
            {
                Header: 'Shift',
                accessor: 'shift'
            }
        ];

        this.state.orders.forEach(order => {

            if (!existingLines[order.line]) {
                existingLines[order.line] = {};
            }
            if (!existingLines[order.line][order.shift]) {
                existingLines[order.line][order.shift] = {};
            }
            if (!existingLines[order.line][order.shift][order.date]) {
                existingLines[order.line][order.shift][order.date] = [];
            }
            existingLines[order.line][order.shift][order.date].push(order.id);
        });

        lines.forEach(line => {

            if (!existingLines[line]) {
                existingLines[line] = {};
            }

            shifts.forEach(shift => {

                if (!existingLines[line][shift]) {
                    existingLines[line][shift] = {};
                }
                data.push({
                    line,
                    shift,
                    orders: existingLines[line][shift]
                });
            });
        });

        while (end !== currentDate.format(format)) {

            const date = currentDate.format(format);
            currentDate.add(1, 'day');

            columns.push({
                Header: date,
                className: 'date',
                id: date,
                accessor: row => row.orders[date] ? row.orders[date].join(','): ''
            });
        }


        return (
            <div className="schedule-calendar">

                <div className="col-lg-10 col-md-9 col-sm-8">
                    <div className="slots">
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
                                    id: 'shift',
                                    desc: false
                                }
                            ]}
                        />
                    </div>
                </div>
                <div className="col-lg-2 col-md-3 col-sm-4">

                </div>

            </div>
        );
    }
}

export default ScheduleCalendar;