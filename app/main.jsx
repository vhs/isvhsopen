
import React from 'react';
import ReactDOM from 'react-dom';
import EventCalendar from './calendar';

var mountNode = document.getElementById("react-calendar-mount");

ReactDOM.render(<EventCalendar />, mountNode);
