import React from 'react';
import axios from 'axios';


class UserComponent extends React.Component {
    constructor() {
        super();
    }

    delete(id){
        axios.delete(window.location.origin + '/employee/' + id)
            .then((result) => {
                if(result.status===200){
                    this.props.refresh();
                }
            })
            .catch(err => console.log(err.message))
    }
    
    render() {
        return (
            <div className="userComponent">
                <button onClick={this.props.newEmployee}>New employee</button>
              <ul>
                  {this.props.users.map( (user, index) =>
                      <li key={index}>
                          <div style={{width:100, display:'inline-block'}}>{user.name}</div>
                          <button onClick={this.delete.bind(this, user.FaceId)}>Delete</button>
                      </li>)
                  }
              </ul>

            </div>
        );
    }
}
 

export default UserComponent;
