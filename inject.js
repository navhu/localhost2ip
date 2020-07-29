const internalIp = async () => {
    if (!RTCPeerConnection) {
        throw new Error("Not supported.");
    }

    const peerConnection = new RTCPeerConnection({iceServers: []});

    peerConnection.createDataChannel('');

    peerConnection.createOffer(peerConnection.setLocalDescription.bind(peerConnection), () => {
    });

    peerConnection.addEventListener("icecandidateerror", (event) => {
        throw new Error(event.errorText);
    });

    return new Promise(async resolve => {
        peerConnection.addEventListener("icecandidate", async ({candidate}) => {
            peerConnection.close();

            if (candidate && candidate.candidate) {
                const result = candidate.candidate.split(" ")[4];

                if (result.endsWith(".local")) {
                    const inputDevices = await navigator.mediaDevices.enumerateDevices();
                    const inputDeviceTypes = inputDevices.map(({kind}) => kind);
                    const constraints = {};

                    if (inputDeviceTypes.includes("audioinput")) {
                        constraints.audio = true;
                    } else if (inputDeviceTypes.includes("videoinput")) {
                        constraints.video = true;
                    } else {
                        throw new Error("An audio or video input device is required!");
                    }

                    const mediaStream = await navigator.mediaDevices.getUserMedia(constraints);
                    mediaStream.getTracks().forEach(track => track.stop());
                    resolve(internalIp());
                }
                resolve(result);
            }
        })
    })
}

chrome.storage.sync.get({enabled: true}, result => {
    if (result.enabled && /^http:\/\/localhost/.test(location.href)) {
        internalIp().then(ip => {
            location.replace('http://' + ip);
        })
    }
});
