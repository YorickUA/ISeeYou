import React from 'react';
import axios from 'axios';
import config from '../../config.js'
import openSocket from 'socket.io-client';


class Socket extends React.Component {
    constructor(){
        super();
        this.state = {image: ""}
    }

    componentDidMount(){
        var socket = openSocket(config.address); //192.168.0.143:3003 localhost:3003

        socket.on('frame', (data) => {
            var uint8Arr = new Uint8Array(data.buffer);
            var str = String.fromCharCode.apply(null, uint8Arr);
            var base64String = btoa(str);

            this.setState({image: 'data:image/jpg;base64,'+ base64String })
        });
    }

    open() {
        axios.post(config.address + '/open');//192.168.0.143:3003/open ('http://localhost:3003/open')
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

export default Socket;