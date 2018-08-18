import React from 'react';
import moment from 'moment';
import DatePicker from 'react-datepicker';
import './SchedulePage.css';

import ScheduleList from './ScheduleList.jsx';
import ScheduleCalendar from './ScheduleCalendar.jsx';

import lines from './_data/lines';
import shifts from './_data/shifts';
import scheduledOrders from './_data/scheduledOrders';
import pendingOrders from './_data/pendingOrders';
import statuses from './_data/statuses';

class SchedulePage extends React.Component {

    state = {
        loading: true,
        lines: null,
        shifts: null,
        scheduledOrders: null,
        pendingOrders: null,
        statuses: null,
        view: this.props.viewOptions[0],
        startDate: this.props.now.clone().startOf('week'),
        endDate: this.props.now.clone().endOf('week')
    };

    componentDidMount() {

        this.setState({
            loading: false,
            lines,
            shifts,
            scheduledOrders,
            pendingOrders,
            statuses
        });
    }

    onChangeView = ({ currentTarget: { value: view } }) => {

        this.setState({ view });
    };

    onChangeStartDate = startDate => {

        this.setState({ startDate });
    };

    onChangeEndDate = endDate => {

        this.setState({ endDate });
    };

    get viewOptions() {

        return this.props.viewOptions.map(viewOption => (
            <label key={viewOption}>
                <input
                    type="radio"
                    name="view"
                    value={viewOption}
                    checked={this.state.view === viewOption}
                    onChange={this.onChangeView}
                />
                {viewOption}
            </label>
        ));
    }

    get view() {

        const { loading, view, startDate, endDate } = this.state;

        if (loading) {
            return 'Loading...';
        }

        const Component = view === 'list' ? ScheduleList : ScheduleCalendar;

        return (
            <Component
                {...this.state}
                now={this.props.now}
                key={`${startDate.format('YYYY-MM-DD')}|${endDate.format('YYYY-MM-DD')}`}
            />
        );
    }

    render() {

        return (
            <div className="schedule-page">

                <div className="clearfix page-options">
                    <div className="pull-left">
                        <div className="filters">
                            <div className="view-options">
                                {this.viewOptions}
                            </div>
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
                        <button className="btn btn-primary btn-sm">Export</button>
                    </div>
                </div>

                <div className="view">
                    {this.view}
                </div>

            </div>
        );
    }

    static get defaultProps() {

        return {
            now: moment(),
            viewOptions: ['list', 'calendar']
        };
    }
}

export default SchedulePage;