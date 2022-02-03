'use strict'

import React from 'react'
import PropTypes from 'prop-types'

const request = require('superagent')
const moment = require('moment')
const Autolinker = require('autolinker')

export default class EventCalendar extends React.Component {
  constructor (props) {
    super(props)
    this.state = {
      items: []
    }
  }

  componentDidMount () {
    const calId = '6kqbcrijmvlp9e82gi0ql0csl4%40group.calendar.google.com'
    const publicKey = 'AIzaSyARGs7V5MKve8XTreHbE61amTkEX05ulBQ'
    const now = moment().startOf('day')
    const maxDate = moment().add(30, 'days')

    request.get('https://www.googleapis.com/calendar/v3/calendars/' + calId +
                '/events')
      .query({
        maxResults: 6,
        alwaysIncludeEmail: false,
        singleEvents: true,
        orderBy: 'startTime',
        timeMin: now.toISOString(),
        timeMax: maxDate.toISOString(),
        key: publicKey
      })
      .end(function (err, res) {
        if (err) {
          // TODO: do something if it fails
          return
        }

        const result = res.body

        this.setState({
          items: result.items
        })
      }.bind(this))
  }

  render () {
    const grouped = this.state.items.reduce(function (prev, current) {
      let start

      if (current.start.date) {
        // All-day event
        start = moment(current.start.date)
      } else {
        start = moment(current.start.dateTime)
      }

      const today = moment().startOf('day')
      const key = start.format('L')

      if (!prev[key]) {
        prev[key] = {
          start: start,
          items: [current],
          daysFromToday: start.diff(today, 'days')
        }
        prev.sorted.push(prev[key])
      } else {
        prev[key].items.push(current)
      }

      return prev
    }, { sorted: [] })

    const days = grouped.sorted.map((item) => (<EventsByDay day={item} key={item.start}/>))

    return (
      <div>
        <h2>Upcoming at VHS</h2>
        {days}
      </div>
    )
  }
}

class EventsByDay extends React.Component {
  render () {
    const events = this.props.day.items.map((event) => (<EventDetail event={event} key={event.id}/>))

    let label = this.props.day.start.format('dddd, MMMM D')
    let classes = 'panel panel-default'

    if (this.props.day.daysFromToday === 0) {
      classes += ' panel-primary'
      label = 'Today'
    }

    if (this.props.day.daysFromToday === 1) {
      classes += ' panel-info'
      label = 'Tomorrow'
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
  render () {
    const event = this.props.event
    const start = event.start.dateTime
    const end = event.end.dateTime
    let time

    if (start) {
      time = moment(start).format('h:mm a -')
      if (end) {
        time += moment(end).format(' h:mm a -')
      }
    }

    const description = { __html: Autolinker.link(event.description).replace(/\n/g, '<br />') }

    return (

      <li className="list-group-item">
        <h4 className="list-group-item-heading">{time} {this.props.event.summary}</h4>
        <p className="list-group-item-text" dangerouslySetInnerHTML={description}/>
      </li>
    )
  }
}

EventsByDay.propTypes = {
  day: PropTypes.object.isRequired
}

EventDetail.propTypes = {
  event: PropTypes.object.isRequired
}
