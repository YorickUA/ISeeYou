/**
 * Created by dev on 24.11.17.
 */
import React from 'react';
import axios from 'axios';

/**
 * New user popup
 */
class UserPopUp extends React.Component {
    constructor(){
        super();
        this.state = {
            image: null,
            imageName: "Select file",
            name:""
        }
    }

    /**
     * Upload file to state
     * @param e Object event
     */
    setFile(e) {
        var file = e.target.files[0];
        this.setState({image:file, imageName: e.target.files[0].name})
    };

    inputHandler(state, e) {
        var newState = {};

        newState[state] = e.target.value;
        this.setState(newState);

    }

    /**
     * Send user info to server
     */
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
                    <h2>Add new employee</h2>
                    <div class="ui divider"></div>
                    <label> Name:
                        <div className="ui fluid input">
                            <input type="text" value={this.state.name} onChange = {this.inputHandler.bind(this, "name")}/>
                        </div>
                    </label>



                    <div style={{paddingTop:10}}>
                        <label htmlFor="file" className="ui icon button">
                            <i className="file icon"></i>
                            Open File</label>
                        <input type="file" id="file" style={{display:"none"}} onChange={this.setFile.bind(this)}/>
                        <span>{this.state.imageName}</span>
                    </div>



                    <div style={{marginTop:10}}>
                        <button className="ui right floated button red" onClick={this.props.close}>Close</button>
                        <button className="ui right floated button green" onClick={this.sendData.bind(this)}>Send</button>
                    </div>
                </div>
            </div>
        )
    }
}

export default UserPopUp;

   /* <div style={{paddingTop:10}}>
                <input type="file" onChange={this.setFile.bind(this)}/>
            </div>*/
