'use strict';
/** @jsx React.DOM */
var React = require('react');
var ReactDOM = require('react-dom');
var request = require('superagent');
var moment = require('moment');

var mountNode = document.getElementById("react-calendar-mount");

var EventCalendar = require('./calendar').EventCalendar;

ReactDOM.render(<EventCalendar />, mountNode);
