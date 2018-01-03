var AWS = require('aws-sdk');
AWS.config.update({region:'eu-west-1'});
exports.handler = (event, context, callback) => {

    const value = event.state.reported.value;

    const iotdata = new AWS.IotData({endpoint: 'a172ulhf1fm9p3.iot.eu-west-1.amazonaws.com'});
    const payload = {
        state: {
            desired:{
                value
            }
        }
    }
    iotdata.getThingShadow({
        thingName: "door"
    }).promise()
        .then( res => {
            console.log(res)
            const state = JSON.parse(res.payload);
            if (state.state.reported.value === value){
                callback(null, true);
            } else {
                return iotdata.updateThingShadow({
                    thingName:"door",
                    payload: JSON.stringify(payload)
                }).promise()
            }
        })
        .then( res => callback(null, res))
        .catch(callback)
};