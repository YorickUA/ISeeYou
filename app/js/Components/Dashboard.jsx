import React from 'react';
import axios from 'axios';
import config from '../../config.js'
import openSocket from 'socket.io-client';

/**
 * Dashboard class for video stream and door opening
 */
class Dashboard extends React.Component {
    constructor(){
        super();
        this.state = {image: ""}
    }

    /**
     * Start receiving video stream
     */
    componentDidMount(){
        var socket = openSocket(config.address,  {transports:['polling'], upgrade: true});

        socket.on('frame', (data) => {
            var uint8Arr = new Uint8Array(data.buffer);
            var str = String.fromCharCode.apply(null, uint8Arr);
            var base64String = btoa(str);

            this.setState({image: 'data:image/jpg;base64,'+ base64String })
        });
    }

    /**
     * Open the door
     */
    static open() {
        axios.post(config.address + '/open');
    }

    render() {
        return (
            <div>
                <img style={{height:600}} src={this.state.image} id="stream"/>
                <button  onClick = {this.open} >Open</button>
            </div>
        );
    }
}

export default Dashboard;