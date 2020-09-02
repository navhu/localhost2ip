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

const redirectRegs = /localhost|127\.0\.0\.1/;

chrome.storage.sync.get({enabled: true, port: 80}, result => {
    if (result.enabled && redirectRegs.test(location.hostname)) {
        internalIp().then(ip => {
            location.replace('http://' + ip + ':' + (location.port || result.port) + location.pathname + location.search + location.hash);
        })
    }
});
