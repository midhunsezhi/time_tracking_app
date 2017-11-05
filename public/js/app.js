class TimersDashboard extends React.Component {
  state = {
    timers: [],
  }
  componentDidMount() {
    this.loadTimersFromServer();
    setInterval(this.loadTimersFromServer, 5000);
  }

  loadTimersFromServer = () => {
    client.getTimers(serverTimers => {
      this.setState({timers : serverTimers});
    });
  }

  handleCreateFormSubmit = (timer) => {
    this.createTimer(timer);
  };

  createTimer = (timer) => {
    const t = helpers.newTimer(timer);
    this.setState({
      timers: this.state.timers.concat(t),
    });
  };

  handleEditFormSubmit = (timer) => {
    const changedTimers = this.state.timers.map(t => {
      if(t.id === timer.id) {
        return Object.assign({}, t, {
          'title': timer.title,
          'project': timer.project
        });
      } else {
        return t;
      }
    });

    this.setState({timers: changedTimers});
  }
  handleDelete = (id) => {
    this.setState({
      timers : this.state.timers.filter(timer => (
        timer.id !== id
      ))
    });
  }
  handleActionButton = (id) => {
    const nextTimers = this.state.timers.map(timer => {
      if(timer.id === id) {
        if(timer.runningSince) {
          return Object.assign({}, timer,{
            runningSince : null
          });
        } else {
          return Object.assign({}, timer,{
            runningSince : Date.now()
          });
        }
      } else {
        return timer;
      }
    });

    this.setState({timers: nextTimers});
  }
  render() {
      return(
          <div className='ui three column centered grid'>
              <div className='column'>
                  <EditableTimerList
                    timers={this.state.timers}
                    onFormSubmit={this.handleEditFormSubmit}
                    onDeleteTimer={this.handleDelete}
                    onActionClick={this.handleActionButton}
                  />
                  <ToggleableTimerForm
                      isOpen={true}
                      onFormSubmit={this.handleCreateFormSubmit}
                  />
              </div>
          </div>
      );
  }
}

class EditableTimerList extends React.Component {
  handleFormSubmit = (timer) => {
    this.props.onFormSubmit(timer);
  }
  handleDelete = (id) => {
    this.props.onDeleteTimer(id);
  }
  handleActionButton = (id) => {
    this.props.onActionClick(id);
  }
  render() {
    const timers = this.props.timers.map(timer => (
      <EditableTimer
        key={'timer-' + timer.id}
        title={timer.title}
        id={timer.id}
        project={timer.project}
        elapsed={timer.elapsed}
        runningSince={timer.runningSince}
        onFormSubmit={this.handleFormSubmit}
        onDeleteTimer={this.handleDelete}
        onActionClick={this.handleActionButton}
      />
    ));
    return(
      <div id='timers'>
        {timers}
      </div>
    );
  }
}

class EditableTimer extends React.Component {
  state = {
    editFormOpen : false
  }
  handleEditClick = () => {
    this.setState({'editFormOpen' : true});
  }
  handleFormSubmit = (timer) => {
    this.props.onFormSubmit(timer);
    this.setState({'editFormOpen' : false});
  }
  handleFormClose = () => {
    this.setState({'editFormOpen' : false});
  }
  handleDelete = () => {
    this.props.onDeleteTimer(this.props.id);
  }
  handleActionButton = (id) => {
    this.props.onActionClick(id);
  }
  render() {
    if(this.state.editFormOpen) {
      return(
        <TimerForm 
          title={this.props.title}
          project={this.props.project}
          id={this.props.id}
          onFormSubmit={this.handleFormSubmit}
          onFormClose={this.handleFormClose}
        />
      );
    } else {
      return(
        <Timer 
          title={this.props.title}
          id={this.props.id}
          project={this.props.project}
          elapsed={this.props.elapsed}
          runningSince={this.props.runningSince}
          onEditClick={this.handleEditClick}
          onDeleteTimer={this.handleDelete}
          onActionClick={this.handleActionButton}
        />
      );
    }
  }
}

class TimerForm extends React.Component {
  state = {
    'title' : this.props.title || '',
    'project': this.props.project || ''
  }
  handleTitleChange = (e) => {
    this.setState({'title' : e.target.value});
  }
  handleProjectChange = (e) => {
    this.setState({'project' : e.target.value});
  }
  handleSubmit = () => {
    this.props.onFormSubmit({
      'id': this.props.id,
      'title': this.state.title,
      'project': this.state.project,
    });
  }
  render() {
    const submitText = this.props.id ? 'Update' : 'Create';

    return(
      <div className='ui centered card'>
        <div className='content'>
          <div className='ui form'>
            <div className='field'>
              <label>Title</label>
              <input 
                type='text' 
                value={this.state.title} 
                onChange={this.handleTitleChange}
              />
            </div>
            <div className='field'>
              <label>Project</label>
              <input 
                type='text' 
                value={this.state.project} 
                onChange={this.handleProjectChange}
              />
            </div>
            <div className='ui two bottom attached buttons'>
              <button 
                className='ui basic blue button'
                onClick={this.handleSubmit}
              >
                {submitText}
              </button>
              <button 
                className='ui basic red button'
                onClick={this.props.onFormClose}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }
}
class ToggleableTimerForm extends React.Component {
  state = {
    'isOpen' : false
  }

  handleFormOpen = () => {
    this.setState({
      'isOpen' : true
    });
  }
  handleFormSubmit = (timer) => {
    this.props.onFormSubmit(timer);
    this.setState({'isOpen': false})
  }
  handleFormClose = (timer) => {
    this.setState({'isOpen': false})
  }
  render(){
    if(this.state.isOpen) {
      return (
        <TimerForm 
          onFormClose={this.handleFormClose}
          onFormSubmit={this.handleFormSubmit}
        />
      );
    } else {
      return (
        <div className='ui basic content center aligned segment'>
          <button 
            className='ui basic button icon'
            onClick={this.handleFormOpen}
          >
            <i className='plus icon' />
          </button>
        </div>
      );
    }
  }
}

class Timer extends React.Component {
  handleDelete = () => {
    this.props.onDeleteTimer();
  }
  handleActionButton = () => {
    this.props.onActionClick(this.props.id);
  }
  componentDidMount() {
    this.forcedUpdateInterval = setInterval(() => this.forceUpdate(), 
    50);
  }
  componentWillUnmount() {
    clearInterval(this.forcedUpdateInterval);
  }
  
  render() {
    const actionButtonText = this.props.runningSince
      ? 'Stop'
      : 'Start';
      const actionButtonColor = this.props.runningSince
      ? 'red'
      : 'green';
    const elapsedString = helpers.renderElapsedString(
      this.props.elapsed, this.props.runningSince);
    return (
      <div className='ui centered card'>
        <div className='content'>
          <div className='header'>
            {this.props.title}
          </div>
          <div className='meta'>
            {this.props.project}
          </div>
          <div className='center aligned description'>
            <h2>
              {elapsedString}
            </h2>
          </div>
          <div className='extra content'>
            <span 
              className='right floated edit icon'
              onClick={this.props.onEditClick}>
              <i className='edit icon' />
            </span>
            <span 
              className='right floated trash icon'
              onClick={this.handleDelete}>
              <i className='trash icon' />
            </span>
          </div>
        </div>
        <div 
          className={'ui bottom attached ' + actionButtonColor + ' basic button'}
          onClick={this.handleActionButton}
        >
          {actionButtonText}
        </div>
      </div>
    );
  }
}

ReactDOM.render(
  <TimersDashboard />,
  document.getElementById('content')
);