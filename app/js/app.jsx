import React from 'react';
import axios from 'axios';
import UserPopUp from './Components/userPopUp.jsx';
import Screen from './Components/Screen.jsx';
import UserComponent from './Components/UserComponent.jsx';


import '../css/main.css';

/**
 * Main app component
 */
class App extends React.Component {
    constructor() {
        super();
        this.state = {
            newEmployeePopUp:false,
            users:[]
        }
    }

    /**
     * Refresh data on the view
     */
    refresh(){
        axios.get(window.location.origin + '/employee')
            .then (res => {
                var newUsers = [];
                res.data.Items.forEach(item =>{
                    var user = {
                        name: item.Name['S'],
                        FaceId: item.FaceId['S']
                    };
                    newUsers.push(user);
                });
                this.setState({users:newUsers});
            })

    }

    componentDidMount(){
        this.refresh();
    }

    /**
     * Open "New Employee" popup
     */
    newEmployee() {
        this.setState({ newEmployeePopUp: !this.state.newEmployeePopUp });
    }
    
    render() {
        return (
            <div>
                <Screen/>
                <UserComponent newEmployee = {this.newEmployee.bind(this)} users={this.state.users} refresh={this.refresh.bind(this)}/>
                {this.state.newEmployeePopUp && <UserPopUp close={this.newEmployee.bind(this)} refresh={this.refresh.bind(this)}/>}
            </div>
        );
    }
}

export default App;