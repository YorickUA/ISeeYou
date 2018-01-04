import React from 'react';
import axios from 'axios';

/**
 * User component
 */
class UserComponent extends React.Component {
    constructor() {
        super();
    }

    /**
     * Delete user
     * @param id String user id
     */
    deleteEmployee(id){
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
              <button className="ui icon button green" onClick={this.props.newEmployee}><i class="add user icon"></i></button>
              <table class="ui very basic celled table">
                  <thead>
                      <tr>
                          <th>Name</th>
                          <th>Delete</th>
                      </tr>
                  </thead>
                  <tbody>
                  {this.props.users.map( (user, index) =>
                      <tr key={index}>
                          <td>
                              <i class="user icon"></i>
                              <div style={{width:100, display:'inline-block'}}>{user.name}</div>
                          </td>
                          <td>
                              <button className="ui icon button red" onClick={this.deleteEmployee.bind(this, user.FaceId)}><i class="remove icon"></i></button>
                          </td>
                      </tr>
                      )
                  }
                  </tbody>
              </table>

            </div>
        );
    }
}
 

export default UserComponent;
