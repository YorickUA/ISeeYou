/**
 * Created by dev on 24.11.17.
 */
import React from 'react';
import Webcam from 'webcamjs/webcam.js';
import axios from 'axios';
require('tracking');
require('tracking/build/data/face');

class Screen extends React.Component {
    constructor(){
        super();
        this.tracker ={};
        this.state = {
            user:{
                name:""
            },
            scanTime:0
        }
    }

    /**
     * Start tracking faces
     */
    componentDidMount(){
        var context;

        Webcam.set({
            width: 320,
            height: 240,
            image_format: 'jpeg',
            jpeg_quality: 90
        });
        Webcam.attach( '#video' );

        context = canvas.getContext('2d');
        this.tracker = new tracking.ObjectTracker('face');
        this.tracker.setInitialScale(4);
        this.tracker.setStepSize(2);
        this.tracker.setEdgesDensity(0.1);
        tracking.track('#video', this.tracker, { camera: true });

        console.log('mounted');

        this.tracker.on('track', (event) => {
            context.clearRect(0, 0, canvas.width, canvas.height);
            if (event.data.length === 0){
                return;
            } else {
                this.wait = true;
                event.data.forEach(function(rect) {
                    context.strokeStyle = '#a64ceb';
                    context.strokeRect(rect.x, rect.y, rect.width, rect.height);
                    context.font = '11px Helvetica';
                    context.fillStyle = "#fff";
                });
            }

        });
    };

    /**
     * Take a snap shot and perform comparison
     */
    takeSnap(){
        Webcam.snap( data_uri => {
            var t0;
            document.getElementById('results').innerHTML =
                '<img src="'+data_uri+'"/>';
            t0 = performance.now();
            axios.post(window.location.origin + '/compareUsers',{image:data_uri})
                .then((result) => {
                    if (result.data.Item){
                        this.setState({user:{
                            name:result.data.Item.Name['S'],
                            FaceId:result.data.Item.FaceId['S']
                            },
                            scanTime: performance.now() - t0
                        })
                    } else {
                        this.setState({user:{
                            name:'unknown',
                            FaceId:null
                            },
                            scanTime: performance.now() - t0
                        })
                    }
                })
        } );
    };

    render() {
        return (
            <div>
                <div id="screen">
                    <video id="video" width="320" height="240" preload="true" autoPlay loop muted/>
                    <canvas id="canvas" width="320" height="240"/>
                </div>
                <div id="results"></div>
               <div>
                   <button onClick={this.takeSnap.bind(this)}>Scan</button>
               </div>
                { this.state.user &&
                <h3>
                    This is : {this.state.user.name||'unknown'}, scan time: {(this.state.scanTime)} milliseconds
                </h3>
                }

            </div>
        )
    }
}

export default Screen;