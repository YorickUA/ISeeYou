import React from 'react';

/**
 * Dashboard class for video stream and door opening
 */
class PythonDashboard extends React.Component {
    constructor() {
        super();
        this.state = {image: ""}
    }

    render() {
        return (
            <div>
                <img style={{height:600}} src="http://192.168.0.143:5000/video_feed" id="stream"/>
            </div>
        );
    }
}

export default PythonDashboard;