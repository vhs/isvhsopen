'use strict';

var React = require('react');
var ReactDOM = require('react-dom');
var request = require('superagent');
var moment = require('moment');

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
        var maxDate = moment().add(7, 'days');

        request.get("https://www.googleapis.com/calendar/v3/calendars/" + calId
                + "/events")
            .query({
                "maxResults": 10,
                "alwaysIncludeEmail": false,
                "singleEvents": true,
                "orderBy": "startTime",
                "timeMin": now.toISOString(),
                "timeMax": maxDate.toISOString(),
                "key": publicKey
            })
            .end(function(err, res){
                if (err) {
                    //TODO: do something
                    return;
                }
                var result = res.body;
                this.setState({
                    items : result.items
                });
            }.bind(this));
    }

    render() {
        var items = this.state.items.map(function(item) {
            return (
                <div>{item.summary}</div>
            );
        });
        return (
            <div>{items}</div>
        );
    }
}
