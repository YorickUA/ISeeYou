/**
 * Created by dev on 24.11.17.
 */
import React from 'react';
import axios from 'axios';

/**
 * Money transfer popup
 */
class UserPopUp extends React.Component {
    constructor(){
        super();
        this.state = {
            image: null,
            name:""
        }
    }


    setFile(e) {
        var file = e.target.files[0];
        this.setState({image:file})
    };

    inputHandler(state, e) {
        var newState = {};

        newState[state] = e.target.value;
        this.setState(newState);

    }


    sendData(){
        if(this.state.image && this.state.name) {
            var formData = new FormData();
            console.log(this.state.image);
            formData.append("file", this.state.image);
            formData.append("name", this.state.name);

            axios.post(window.location.origin + '/employee',formData)
                .then((result) => {
                    if(result.status === 200){
                        this.props.close();
                        this.props.refresh();
                    }

                })
        }
    }

    render() {
        return (
            <div className="overlay">
                <div className="popUp">
                    <lable> Name:
                        <input type="text" value={this.state.name} onChange = {this.inputHandler.bind(this, "name")}/>
                    </lable>

                    <input type="file" onChange={this.setFile.bind(this)}/>
                    <button onClick={this.sendData.bind(this)}>Send</button>
                    <button onClick={this.props.close}>Close</button>
                </div>
            </div>
        )
    }
}

export default UserPopUp;