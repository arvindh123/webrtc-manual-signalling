

// Set up media stream constant and parameters.

// In this codelab, you will be streaming video only: "video: true".
// Audio will not be streamed because it is set to "audio: false" by default.
const mediaStreamConstraints = {
    video: true
};

// Set up to exchange only video.

const localVideo = document.getElementById('localVideo');
const remoteVideo = document.getElementById('remoteVideo');

let localStream;
let remoteStream;

//peer connection
let pc;

function CallerOrReceiver() {
    if (document.getElementById('makeCall').checked) {
        document.getElementsByName('Caller').forEach((item) => {
            item.style.display = 'block';
        })
        document.getElementsByName('Receiver').forEach((item) => {
            item.style.display = 'none';
        })
    } else if (document.getElementById('recvCall').checked) {
        document.getElementsByName('Caller').forEach((item) => {
            item.style.display = 'none';
        })
        document.getElementsByName('Receiver').forEach((item) => {
            item.style.display = 'block';
        })
    }
    else {
        document.getElementById('Caller').forEach((item) => {
            item.style.display = 'none';
        })
        document.getElementById('Receiver').forEach((item) => {
            item.style.display = 'none';
        })
    }

}

///////////////////////////////////////////////////////////////
// Step -1 
//Get the user media 
///////////////////////////////////////////////////////////////
function getMedia() {
    navigator.mediaDevices.getUserMedia(mediaStreamConstraints)
        .then(gotLocalMediaStream).catch(handleLocalMediaStreamError);
}

function gotLocalMediaStream(mediaStream) {
    localVideo.srcObject = mediaStream;
    localStream = mediaStream;
    console.log('Received local stream.');
}

function handleLocalMediaStreamError(error) {
    console.log(`navigator.getUserMedia error: ${error.toString()}.`);
}

///////////////////////////////////////////////////////////////
// Step -2 
//Create Peer Connections
///////////////////////////////////////////////////////////////

function createPeerConnection() {
    try {
        pc = new RTCPeerConnection( {'iceServers': [{'urls': 'stun:stun.l.google.com:19302'}]});
        pc.onicecandidate = handleIceCandidate;
        pc.onaddstream = handleRemoteStreamAdded;
        pc.onremovestream = handleRemoteStreamRemoved;
        console.log('Created RTCPeerConnnection');
    } catch (e) {
        console.log('Failed to create PeerConnection, exception: ' + e.message);
        alert('Cannot create RTCPeerConnection object.');
        return;
    }
}

function handleIceCandidate(event) {
    console.log('icecandidate event: ', event);
    if (event.candidate) {
        // let iceCandidateTemp = {
        //     type: 'candidate',
        //     label: event.candidate.sdpMLineIndex,
        //     id: event.candidate.sdpMid,
        //     candidate: event.candidate.candidate
        // }
        let iceCandidateTemp = event.candidate
        console.log(iceCandidateTemp);
        if (document.getElementById('makeCall').checked) {
            document.getElementById("callerIceCandidatesTextBox").value = document.getElementById("callerIceCandidatesTextBox").value + JSON.stringify(iceCandidateTemp) + ","
        } else if (document.getElementById('recvCall').checked) {
            document.getElementById("receiverIceCandidatesTextBox").value = document.getElementById("receiverIceCandidatesTextBox").value + JSON.stringify(iceCandidateTemp) + ","
        } else {

        }
    } else {
        console.log('End of candidates.');
        if (document.getElementById('makeCall').checked) {
            document.getElementById("callerIceCandidatesTextBox").value = document.getElementById("callerIceCandidatesTextBox").value.slice(0, -1) + "]"
        } else if (document.getElementById('recvCall').checked) {
            document.getElementById("receiverIceCandidatesTextBox").value = document.getElementById("receiverIceCandidatesTextBox").value.slice(0, -1) + "]"
        } else {

        }

    }
}

function handleRemoteStreamAdded(event) {
    console.log('Remote stream added.');
    console.log(event)
    remoteStream = event.stream;
    remoteVideo.srcObject = remoteStream;
}

function handleRemoteStreamRemoved(event) {
    console.log('Remote stream removed. Event: ', event);
}


///////////////////////////////////////////////////////////////
// Step -3 
//Add the local stream to peer connection
///////////////////////////////////////////////////////////////
function addStreamToPc() {
    pc.addStream(localStream);
    console.log('added Local stream to the peer connection - localstream - ', localStream);
}

///////////////////////////////////////////////////////////////
// Step -4 - Caller
//Create Offer
///////////////////////////////////////////////////////////////
function createdOffer() {
    console.log("creating offer")
    document.getElementById("callerIceCandidatesTextBox").value = "["
    pc.createOffer(setLocalAndPutToCallerTextArea, handleCreateOfferError);

}



function setLocalAndPutToCallerTextArea(sessionDescription) {
    pc.setLocalDescription(sessionDescription);
    console.log('setLocalAndPutToCallerTextArea - sessionDescription', sessionDescription);
    document.getElementById("callerSessionDescTextBox").value = JSON.stringify(sessionDescription);
}

function handleCreateOfferError(event) {
    console.log('createOffer() error: ', event);
}

///////////////////////////////////////////////////////////////
// Step - 5 - Receiver
//Set the Remote Description of the Caller
///////////////////////////////////////////////////////////////  JSON.parse(

function setCallerSdpInReceiver() {
    document.getElementById("receiverIceCandidatesTextBox").value = "["
    let message = JSON.parse(document.getElementById("callerSessionDescTextBox").value)
    console.log(message)
    pc.setRemoteDescription(new RTCSessionDescription(message));
}
///////////////////////////////////////////////////////////////
// Step - 6 - Receiver
//Set Create Answer and Session Description of Recevier
///////////////////////////////////////////////////////////////  JSON.parse(

function createAnswer() {
    console.log('Sending answer to peer.');
    pc.createAnswer().then(
        setLocalAndPutToReceiverTextArea,
        onCreateSessionDescriptionError
    );
}


function setLocalAndPutToReceiverTextArea(sessionDescription) {
    pc.setLocalDescription(sessionDescription);
    console.log('setLocalAndPutToReceiverTextArea - sessionDescription', sessionDescription);
    document.getElementById("receiverSessionDescTextBox").value = JSON.stringify(sessionDescription);
}

function handleCreateOfferError(event) {
    console.log('createOffer() error: ', event);
}

function onCreateSessionDescriptionError(error) {
    console.log('Failed to create session description: ' + error.toString());
}

///////////////////////////////////////////////////////////////
// Step - 7 - Caller
//Set the Remote Description of the Receiver
///////////////////////////////////////////////////////////////  JSON.parse(

function setReceiverSdpInCaller() {
    let message = JSON.parse(document.getElementById("receiverSessionDescTextBox").value)
    console.log(message)
    pc.setRemoteDescription(new RTCSessionDescription(message));
}


///////////////////////////////////////////////////////////////
// Step - 8 - Receiver
//Set the Remote Description of the Receiver
///////////////////////////////////////////////////////////////  JSON.parse(

function receiverSetCallerIceCand() {
    
    let message = JSON.parse(document.getElementById("callerIceCandidatesTextBox").value)
    console.log("receiverSetCallerIceCand  iceCandidateOfCaller-", message)
    
    message.forEach( (item)=> {
        // var candidate = new RTCIceCandidate({
        //     sdpMLineIndex: item.label,
        //     candidate: item.candidate
        // });
        // pc.addIceCandidate(candidate);
        try {
            pc.addIceCandidate(item);
        } catch (e) {
            console.error('Error adding received ice candidate', e);
        }
    })
    
}

///////////////////////////////////////////////////////////////
// Step - 8 - Caller
//Set the Remote Description of the Receiver
///////////////////////////////////////////////////////////////  JSON.parse(

function callerSetReceiverIceCand() {
    let message = JSON.parse(document.getElementById("receiverIceCandidatesTextBox").value)
    console.log("callerSetReceiverIceCand  iceCandidateOfReceiver-", message)
    message.forEach( (item)=> {
        // var candidate = new RTCIceCandidate({
        //     sdpMLineIndex: item.label,
        //     candidate: item.candidate
        // });
        // pc.addIceCandidate(candidate);
        try {
            pc.addIceCandidate(item);
        } catch (e) {
            console.error('Error adding received ice candidate', e);
        }
        
    })
}



function stop() {
    isStarted = false;
    pc.close();
  }
  