import React from 'react';
import ReactDOM from 'react-dom';
import Remarkable from 'remarkable';
import $ from 'jquery';

import '../css/base.css';
import WeeklyTaskList from './WeeklyTaskList';
import TaskForm from './TaskForm';
import {API_URL, POLL_INTERVAL} from './global';


module.exports = React.createClass({
  getInitialState: function(){
    return { data: {
        "weeklyTaskList": [],
        "completedTasks": []
      }, _isMounted: false};
  },
  loadTasksFromServer: function() {
    if (this.state._isMounted) {
      $.ajax({
        url: API_URL,
        dataType: 'json',
        cache: false,
      })
        .done(function(data) {
          this.setState({data: data});
        }.bind(this))
        .fail(function(xhr, status, err) {
          console.error(API_URL, status, err.toString());
        }.bind(this));
    }
  },
  handleTaskSubmit: function(task) {
    console.log("we got this far");
    var tasks = this.state.data.weeklyTaskList;
    //Optimistically set an id on the new task. It will be replaced by an
    // id generated by the server. In a production application you would likely
    // not use Date.now() for this and would have a more robust system in place.
    task.id = Date.now();
    var newTasks = tasks.concat([task]);
    this.setState({data: newTasks});
    $.ajax({
        url: API_URL,
        dataType: 'json',
        type: 'POST',
        data: task,
    })
      .done(function(data) {
        this.setState({data: data});
      }.bind(this))
      .fail(function(xhr, status, err) {
        this.setState({data: tasks});
        console.error(API_URL, status, err.toString());
      }.bind(this));
  },
  componentDidMount: function() {
    this.state._isMounted = true;
    this.loadTasksFromServer();
    setInterval(this.loadTasksFromServer, POLL_INTERVAL);
  },
  componentWillUnmount: function(){
    this.state._isMounted = false;
  },
  render: function() {
    //console.log(JSON.stringify(this.state.data));
    return (
      <div className="Weekly Calendar">
        <h1>Tracking Every Assignment:</h1>
        <h2>Progress Over Time!</h2>
        <WeeklyTaskList WeeklyList={this.state.data.weeklyTaskList} />
        <TaskForm onTaskSubmit={this.handleTaskSubmit}/>
      </div>
    );
  }
});
