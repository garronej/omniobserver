# omniobserver

NOTE: Chrome debugger will show detailed call stack.

Example observing WebRTC and the event listener on RTCPeerConnection.

```typescript

/** will observe getUserMedia and RTCPeerConnection */
export function observeWebRTC() {

    observeObjectProperty(navigator.mediaDevices, "getUserMedia");
    observeObjectProperty(window, "RTCPeerConnection", (rtcPeerConnection: RTCPeerConnection) => {

        console.log(rtcPeerConnection);

        if( !!rtcPeerConnection.getStats ){

            setTimeout(()=>{

                rtcPeerConnection.getStats().then(
                    stats=> {

                        const arr: any[]= [];

                        stats.forEach(o => {

                            console.log(JSON.stringify(o));

                            arr.push(o);

                        });

                        console.log("<======>");

                        console.log(JSON.stringify(arr));

                    }
                );

            },20000);

        }

        const {
            addEventListener: addEventListenerBackup,
            removeEventListener: removeEventListenerBackup
        } = rtcPeerConnection;

        const proxyByOriginal = new WeakMap<Function, Function>();

        Object.defineProperties(
            rtcPeerConnection,
            {
                "addEventListener": {
                    "configurable": true,
                    "enumerable": true,
                    "value": function addEventListener(type: string, listener: Function) {

                        const listenerProxy = function (...args) {

                            console.log(`RTCPeerConnectionEvent: "${type}"`, args);

                            return listener.apply(rtcPeerConnection, args);

                        };

                        proxyByOriginal.set(listener, listenerProxy);

                        return addEventListenerBackup.call(rtcPeerConnection, type, listenerProxy);

                    }
                },
                "removeEventListener": {
                    "configurable": true,
                    "enumerable": true,
                    "value": function removeEventListener(type: string, listener: Function) {
                        return removeEventListenerBackup.call(rtcPeerConnection, type, proxyByOriginal.get(listener));
                    }
                }

            }
        );


    });

}

```
