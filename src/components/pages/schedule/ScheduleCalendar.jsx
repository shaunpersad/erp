import React from 'react';
import ReactTable from 'react-table';

import './ScheduleCalendar.css';

class ScheduleCalendar extends React.Component {

    forEachDate = fn => {

        const { startDate, endDate } = this.props;
        const format = 'YYYY-MM-DD';

        const currentDate = startDate.clone();
        const end = endDate.clone().add(1, 'day').format(format);

        while (end !== currentDate.format(format)) {

            const date = currentDate.format(format);
            currentDate.add(1, 'day');

            fn(date);
        }
    };

    render() {

        const { lines, scheduledShifts, startDate, endDate } = this.props;
        const types = ['day', 'night'];
        const columns = [
            {
                Header: 'Line',
                className: 'first',
                accessor: 'line'
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


        console.log(data);


        return (
            <div className="schedule-calendar">

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
            </div>
        );
    }
}

export default ScheduleCalendar;