'use strict';

import React from 'react';

var request = require('superagent');
var moment = require('moment');
var Autolinker = require( 'autolinker' );

export default class EventCalendar extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            items : []
        };
    }

    componentDidMount() {
        var calId = "3n0o5q5ldon1dj0d3gifunmmtc%40group.calendar.google.com";
        var publicKey = "AIzaSyCXFBUV3ri4ALPW3Om8cMnUczcCKbcBlfQ";
        var now = moment().startOf('day');
        var maxDate = moment().add(30, 'days');

        request.get("https://www.googleapis.com/calendar/v3/calendars/" + calId
                + "/events")
            .query({
                "maxResults": 6,
                "alwaysIncludeEmail": false,
                "singleEvents": true,
                "orderBy": "startTime",
                "timeMin": now.toISOString(),
                "timeMax": maxDate.toISOString(),
                "key": publicKey
            })
            .end(function(err, res){
                if (err) {
                    //TODO: do something if it fails
                    return;
                }
                var result = res.body;
                this.setState({
                    items : result.items
                });
            }.bind(this));
    }

    render() {
        var grouped = this.state.items.reduce(function(prev, current){
            var start = moment(current.start.dateTime);
            var key = start.format("L");
            if (!prev[key]) {
                prev[key] = {
                    start: start,
                    items: [current],
                    daysFromToday: start.diff(new Date(), 'days')
                };
                prev.sorted.push(prev[key]);
            } else {
                prev[key].items.push(current);
            }
            return prev;
        }, {sorted:[]});


        var days = grouped.sorted.map(function(item) {
            return (
                <EventsByDay day={item} key={item.start}/>
            );
        });
        return (
            <div>
                <h2>Events at VHS</h2>
                {days}
            </div>
        );
    }
}

class EventsByDay extends React.Component {
    render() {
        var events = this.props.day.items.map(function(event) {
            return (
                <EventDetail event={event} key={event.id}/>
            );
        });
        var label = this.props.day.start.format("dddd, MMMM D");
        var classes = "panel panel-default";
        if (this.props.day.daysFromToday === 0) {
            classes += " panel-primary";
            label = "Today";
        }
        if (this.props.day.daysFromToday === 1) {
            label = "Tomorrow";
        }

        return (
            <div className={classes}>
                <div className="panel-heading"><h4>{label}</h4></div>
                <ul className="list-group">
                    {events}
                </ul>
            </div>
        )
    }
}

class EventDetail extends React.Component {
    render() {
        var event = this.props.event;
        var start = event.start.dateTime;
        var description = {__html:Autolinker.link(event.description).replace(/\n/g, "<br />")};
        return (

            <li className="list-group-item">
                <h4 className="list-group-item-heading">{moment(start).format("LT")} - {this.props.event.summary}</h4>
                <p className="list-group-item-text" dangerouslySetInnerHTML={description}></p>
            </li>
        )
    }
}
