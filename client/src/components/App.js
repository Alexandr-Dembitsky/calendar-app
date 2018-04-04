import React, {Component} from 'react';
import axios from 'axios';
import {connect} from 'react-redux';
import TimePicker from 'rc-time-picker';
import moment from 'moment';
import 'rc-time-picker/assets/index.css';
import 'bootstrap/dist/css/bootstrap.css';
import './App.css';

import Header from './Header';

const formattedTime = (hours, minutes, startDayTime) => {
    return hours * 60 + minutes - startDayTime
};

const renderDayScale = (start, end) => {
    const separators = [];

    for (let i = start; i <= end; i += 30) {
        let hours = i / 60;
        let minutes = i % 60;

        separators.push(
            (
                <div key={i} className="calendar_slot">
                    <div key={i}
                         className="calendar_time_separators">{moment.utc().hours(hours).minutes(minutes).format('hh:mm')}</div>
                </div>
            )
        );
    }
    return separators;
};

class App extends Component {
    componentDidMount() {
        this.props.onFetchEvents();
    }

    addEvent(event) {
        event.preventDefault();

        let startDay = 8.00 * 60; // start day in minutes
        let startTime = this.eventStartTimeInput;
        let endTime = this.eventEndTimeInput;
        let title = this.eventTitleInput.value;
        let duration;

        if (startTime === undefined || endTime === undefined || title.length <= 0) {
            alert('Fields can\'t be empty');
        } else if (Number(startTime.format('HH.mm')) >= Number(endTime.format('HH.mm'))) {
            alert('End time can\'t be less than start time');
        } else {
            startTime = formattedTime(Number(startTime.format('HH')), Number(startTime.format('mm')), startDay); // time is formatted in minutes and start day from 0 minutes (8am == 0 minutes)
            endTime = formattedTime(Number(endTime.format('HH')), Number(endTime.format('mm')), startDay); // time is formatted in minutes and start day from 0 minutes (8am == 0 minutes)
            duration = endTime - startTime;

            this.props.onAddEvent({
                "start": startTime,
                "duration": duration,
                "title": title
            });
            alert('New event was added successfully');
        }
    }

    deleteEvent(event) {
        if (window.confirm('Do you want to delete this event?')) {
            return this.props.onDeleteEvent(event)
        } else {
            return false
        }
    }

    logOut(event) {
        event.preventDefault();
        window.localStorage.removeItem('jwtToken');
        window.localStorage.removeItem('isLoggedIn');
        window.location.href = '/login';
    }

    render() {
        return (
            <div className="App">
                <Header/>
                <button className="btn btn-sm btn-primary log-out" onClick={this.logOut.bind(this)}>Log out</button>
                <form>
                    <h4>Create new event</h4>
                    <div>
                        <label htmlFor="startTime">Start time:
                            <TimePicker
                                id="startTime"
                                use12Hours={true}
                                showSecond={false}
                                disabledHours={() => [1, 2, 3, 4, 5, 6, 7, 17, 18, 19, 20, 21, 22, 23, 24]}
                                onChange={(input) => this.eventStartTimeInput = input}
                                required
                            />
                        </label>
                    </div>
                    <div>
                        <label htmlFor="endTime">End time:
                            <TimePicker
                                id="endTime"
                                use12Hours={true}
                                showSecond={false}
                                disabledHours={() => [1, 2, 3, 4, 5, 6, 7, 17, 18, 19, 20, 21, 22, 23, 24]}
                                onChange={(input) => this.eventEndTimeInput = input}
                                required
                            />
                        </label>
                    </div>
                    <div>
                        <label htmlFor="title">Title:<input id="title" type="text" required
                                                            ref={(input) => this.eventTitleInput = input}/></label>
                    </div>
                    <button className="btn btn-sm btn-primary" onClick={this.addEvent.bind(this)}>add event</button>
                    <div className="note">To delete an event, click on it</div>
                </form>

                <div className="calendar">
                    <div className="calendar_left_slot">
                        {renderDayScale(480, 750)}
                    </div>
                    <div className="calendar_right_slot">
                        {renderDayScale(780, 1020)}
                    </div>
                    <div className="calendar_events_container">
                        {this.props.calendarStore.map((event, index) => {
                                return (
                                    <div key={index} className="calendar_event" style={{
                                             top: event.start * 2 >= 600 ? event.start * 2 - 600 : event.start * 2,
                                             height: event.duration * 2,
                                             left: event.start * 2 <= 540 ? 50 : 350
                                         }}
                                         onClick={this.deleteEvent.bind(this, event)}>
                                        <span className="calendar_event_title">{event.title}</span>
                                    </div>
                                )
                            }
                        )
                        }
                    </div>
                </div>

                <div className="export_events">
                    <h4>Export calendar in json</h4>
                    <code className="export_events_container">{JSON.stringify(this.props.calendarStore)}</code>
                </div>
            </div>
        );
    }
}

export default connect(
    state => ({
        calendarStore: state
    }),
    dispatch => ({
        onFetchEvents: () => {
            const fetchEvents = () => {
                return dispatch => {
                    axios.get('/api/events/events-list', { headers: {'authorization':`bearer ${window.localStorage.getItem('jwtToken')}`}})
                        .then(function (res) {
                            dispatch({type: 'FETCH_EVENTS', payload: res.data})
                        })
                        .catch(function (error) {
                            alert(error);
                        });
                }
            }
            dispatch(fetchEvents());
        },
        onAddEvent: (event) => {
            const addEvent = () => {
                return dispatch => {
                    axios.post('/api/events/add', event, { headers: {'authorization':`bearer ${window.localStorage.getItem('jwtToken')}`}})
                    .then(function (res) {
                        dispatch({type: 'ADD_EVENT', payload: event})
                    })
                    .catch(function (error) {
                        alert(error);
                    });
                }
            }
            dispatch(addEvent());
        },
        onDeleteEvent: (event) => {
            const deleteEvent = () => {
                return dispatch => {
                    axios.post('/api/events/delete', event, { headers: {'authorization':`bearer ${window.localStorage.getItem('jwtToken')}`}})
                        .then(function (res) {
                            dispatch({type: 'DELETE_EVENT', payload: event})
                        })
                        .catch(function (error) {
                            alert(error);
                        });
                }
            }
            dispatch(deleteEvent());
        }
    })
)(App);
