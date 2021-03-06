module.exports = function(RED) {

    function HandsDetectionNode(config) {

        function HTML() {
          const html = String.raw`
          <!DOCTYPE html>
          <html>

          <head>
            <meta charset="utf-8">
            <meta http-equiv="X-UA-Compatible" content="IE=edge">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <script src="https://cdn.jsdelivr.net/npm/@mediapipe/camera_utils/camera_utils.js" crossorigin="anonymous"></script>
            <script src="https://cdn.jsdelivr.net/npm/@mediapipe/control_utils/control_utils.js" crossorigin="anonymous"></script>
            <script src="https://cdn.jsdelivr.net/npm/@mediapipe/drawing_utils/drawing_utils.js" crossorigin="anonymous"></script>
            <script src="https://cdn.jsdelivr.net/npm/@mediapipe/hands/hands.js" crossorigin="anonymous"></script>
            <script src="https://cdn.socket.io/4.1.2/socket.io.min.js"
              integrity="sha384-toS6mmwu70G0fw54EGlWWeA4z3dyJ+dlXBtSURSKN4vyRFOcxd3Bzjj/AoOwY+Rg"
              crossorigin="anonymous"></script>
            <link rel="shortcut icon" type="image/x-icon" href="https://cdn-icons-png.flaticon.com/512/1658/1658879.png">
            <title>Hands Detection</title>
            <style>
              a {
                text-decoration: none;
              }

              body {
                overflow-y: scroll;
              }

              .btn {
                border: none;
                width: 100px;
                height: 25px;
                border-radius: 10px;
              }

              .btn:first-child {
                background-color: #B2A1F4;
                color: white;
              }

              .btn:hover {
                cursor: pointer;
              }

              .btn:hover:first-child {
                background-color: #7557f0;
              }

              .btn:hover:last-child {
                background-color: grey;
              }

              table {
                width: 100%;
                border-collapse: collapse;
              }

              th,
              td {
                border: 1px solid rgb(216, 216, 216);
                padding: 3px;
              }

              .tooltip {
                position: relative;
                display: inline-block;
              }

              .tooltip .tooltip-content {
                visibility: hidden;
                background-color: rgba(255, 255, 255, 0.8);
                color: black;
                text-align: center;
                position: absolute;
                top: 3px;
                left: 3px;
                padding-left: 15px;
                padding-right: 15px;
                margin-top: 0px;
                border-radius: 10px;
                z-index: 1;
              }

              .tooltip:hover .tooltip-content {
                visibility: visible;
              }

              #captrue-btn {
                background-color: #B2A1F4;
                border: 1px solid grey;
                border-left: none;
                height: 21px;
                color: white;
              }

              #captrue-btn:hover {
                background-color: #7557f0;
                cursor: pointer;
              }
            </style>
          </head>

          <body>
            <div align="center" style="min-height: 800px;">
              <h1>Hands Detection Page</h1>
              <div style="display: inline-block;" align="center" class="tooltip">
                <video class="input_video" width="600px" height="340px" crossorigin="anonymous"
                  style="border:3px solid grey"></video><br>
                <div class="tooltip-content">
                  <p>Your Camera</p>
                </div>
              </div>
              <div style="display: inline-block;" align="center" class="tooltip">
                <canvas class="output_canvas" width="600px" height="340px" style="border:3px solid #B2A1F4"></canvas><br>
                <div class="tooltip-content">
                  <p>Tracking your hands</p>
                </div>
              </div>
              <div>
                <br>
                <select id="secondTimer">
                  <option value="0" selected>Now</option>
                  <option value="1">1s Timer</option>
                  <option value="2">2s Timer</option>
                  <option value="3">3s Timer</option>
                </select>
                <input id="hand-motion-name" type="search" placeholder="Hands Motion Name"><button id="captrue-btn">Capture</button>
              </div>
              <div id="result-div" style="display: none;">
                <p id="motion-result-message"></p>
                <div id="regist-btn-bar" align="center">
                  <button id="regist-btn" class="btn">Regist</button> <button id="cancel-btn" class="btn">Cancel</button>
                </div><br>
                <canvas class="capture_canvas" width="480px" height="270px" style="border:1px solid black"></canvas>
                <div id="motion-result-keypoint"></div>
              </div>
            </div>
            <hr>
            <div align="center" style="min-height: 100px;">
              <br>
              <a href="https://github.com/5FNSaaS">
                <img style="width:15px"
                  src="data:image/svg+xml;base64,PHN2ZyB2aWV3Qm94PSIwIDAgNTEyIDUxMiIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cGF0aCBkPSJtMjU2IDBjLTE0MC42MDkzNzUgMC0yNTYgMTE1LjM5MDYyNS0yNTYgMjU2IDAgMTE5Ljk4ODI4MSA4NC4xOTUzMTIgMjI4Ljk4NDM3NSAxOTYgMjU2di04NC42OTUzMTJjLTExLjA3ODEyNSAyLjQyNTc4MS0yMS4yNzM0MzggMi40OTYwOTMtMzIuNTUwNzgxLS44MjgxMjYtMTUuMTI4OTA3LTQuNDY0ODQzLTI3LjQyMTg3NS0xNC41NDI5NjgtMzYuNTQ2ODc1LTI5LjkxMDE1Ni01LjgxNjQwNi05LjgxMjUtMTYuMTI1LTIwLjQ1MzEyNS0yNi44Nzg5MDYtMTkuNjcxODc1bC0yLjYzNjcxOS0yOS44ODI4MTJjMjMuMjUzOTA2LTEuOTkyMTg4IDQzLjM3MTA5MyAxNC4xNjc5NjkgNTUuMzEyNSAzNC4yMzA0NjkgNS4zMDQ2ODcgOC45MjE4NzQgMTEuNDEwMTU2IDE0LjE1MjM0MyAxOS4yNDYwOTMgMTYuNDY0ODQzIDcuNTc0MjE5IDIuMjMwNDY5IDE1LjcwNzAzMiAxLjE2MDE1NyAyNS4xODM1OTQtMi4xODc1IDIuMzc4OTA2LTE4Ljk3MjY1NiAxMS4wNzAzMTMtMjYuMDc0MjE5IDE3LjYzNjcxOS0zNi4wNzQyMTl2LS4wMTU2MjRjLTY2LjY3OTY4Ny05Ljk0NTMxMy05My4yNTM5MDYtNDUuMzIwMzEzLTEwMy44MDA3ODEtNzMuMjQyMTg4LTEzLjk3NjU2My0zNy4wNzQyMTktNi40NzY1NjMtODMuMzkwNjI1IDE4LjIzODI4MS0xMTIuNjYwMTU2LjQ4MDQ2OS0uNTcwMzEzIDEuMzQ3NjU2LTIuMDYyNSAxLjAxMTcxOS0zLjEwNTQ2OS0xMS4zMzIwMzItMzQuMjMwNDY5IDIuNDc2NTYyLTYyLjU0Njg3NSAyLjk4NDM3NS02NS41NTA3ODEgMTMuMDc4MTI1IDMuODY3MTg3IDE1LjIwMzEyNS0zLjg5MDYyNSA1Ni44MDg1OTMgMjEuMzg2NzE4bDcuMTkxNDA3IDQuMzIwMzEzYzMuMDA3ODEyIDEuNzkyOTY5IDIuMDYyNS43Njk1MzEgNS4wNzAzMTIuNTQyOTY5IDE3LjM3MTA5NC00LjcxODc1IDM1LjY4MzU5NC03LjMyNDIxOSA1My43MjY1NjMtNy41NTg1OTQgMTguMTc5Njg3LjIzNDM3NSAzNi4zNzUgMi44Mzk4NDQgNTQuNDY0ODQ0IDcuNzVsMi4zMjgxMjQuMjM0Mzc1Yy0uMjAzMTI0LS4wMzEyNS42MzI4MTMtLjE0ODQzNyAyLjAzNTE1Ny0uOTg0Mzc1IDUxLjk3MjY1Ni0zMS40ODA0NjkgNTAuMTA1NDY5LTIxLjE5MTQwNiA2NC4wNDI5NjktMjUuNzIyNjU2LjUwMzkwNiAzLjAwNzgxMiAxNC4xMjg5MDYgMzEuNzg1MTU2IDIuOTE3OTY4IDY1LjU4MjAzMS0xLjUxMTcxOCA0LjY1NjI1IDQ1LjA1ODU5NCA0Ny4zMDA3ODEgMTkuMjQ2MDk0IDExNS43NTM5MDYtMTAuNTQ2ODc1IDI3LjkzMzU5NC0zNy4xMTcxODggNjMuMzA4NTk0LTEwMy43OTY4NzUgNzMuMjUzOTA3di4wMTU2MjRjOC41NDY4NzUgMTMuMDI3MzQ0IDE4LjgxNjQwNiAxOS45NTcwMzIgMTguNzYxNzE5IDQ2LjgzMjAzMnYxMDUuNzIyNjU2YzExMS44MDg1OTQtMjcuMDE1NjI1IDE5Ni0xMzYuMDExNzE5IDE5Ni0yNTYgLjAwMzkwNi0xNDAuNjA5Mzc1LTExNS4zODY3MTktMjU2LTI1NS45OTYwOTQtMjU2em0wIDAiLz48L3N2Zz4=" />
                5FNSaaS
              </a> |
              <a href="https://github.com/rootkwak528">Hogeun Kwak</a> | <a href="https://github.com/eona1301">Hyeona Dang</a>
              | <a href="https://github.com/whgusalsdl">Hyeonmin Cho</a> | <a href="https://github.com/483759">Ijin Yun</a> |
              <a href="https://github.com/steven9408">Yeorae Jo</a><br>
            </div>
          </body>

          </html>

          <script type="module">
            /* detection start */
            function startDetect(renderFunc) {
              var fps = 60
              var stopLoop = audioTimerLoop(renderFunc, 1000 / fps)
            }

            /* audio Timer Loop function */
            function audioTimerLoop(renderFunc, frequency) {
              var freq = frequency / 1000 
              var aCtx = new AudioContext()
              var silence = aCtx.createGain()
              silence.gain.value = 0
              silence.connect(aCtx.destination) 

              onOSCend()

              var stopped = false 
              async function onOSCend() {
                await renderFunc()

                var osc = aCtx.createOscillator()
                osc.onended = onOSCend
                osc.connect(silence)
                osc.start()
                osc.stop(aCtx.currentTime + freq) 

                if (stopped) {
                  osc.onended = function () {
                    aCtx.close()
                    return
                  }
                }
              }
              
              return function () {
                stopped = true
              }
            }

            /* motion regist timer */
            const timerSecond = document.getElementById("secondTimer")
            var second = timerSecond.options[timerSecond.selectedIndex].value
            var poseData = null
            var poseName = null

            document.getElementById("secondTimer").addEventListener('change', () => {
              second = timerSecond.options[timerSecond.selectedIndex].value
            })

            /* motion name empty check */
            var handMotionName = document.getElementById("hand-motion-name")
            document.getElementById("captrue-btn").addEventListener('click', () => {
              if (handMotionName.value === "" || handMotionName.value === undefined) {
                isFail("[Fail] Invalid Name : The motion name is empty.")
              } else if (poseData == null) {
                isFail("[Fail] Keypoint not found. Show your hands on cam!");
              }
              else {
                onCapture(handMotionName.value)
              }
            })

            function isFail(message) {
              document.getElementById("motion-result-message").style.color = "red"
              document.getElementById("motion-result-message").textContent = message
              document.getElementsByClassName("capture_canvas")[0].style.display = "none"
              document.getElementById("result-div").style.display = "block"
              document.getElementById("regist-btn-bar").style.display = "none";
            }

            const videoElement = document.getElementsByClassName('input_video')[0]
            const canvasElement = document.getElementsByClassName('output_canvas')[0]
            const captureElement = document.getElementsByClassName('capture_canvas')[0]
            const canvasCtx = canvasElement.getContext('2d')
            const captureCtx = captureElement.getContext('2d')

            const ws = new WebSocket('ws://localhost:1880/ws/handsdetection')

            ws.onmessage = (msg) => {
              if (msg.data != null) {
                onCapture(msg.data)
              }
            }

            /* hands motion capture used timer if sucess regist*/
            function onCapture(motionName){

              setTimeout(() => {
                captureCtx.drawImage(canvasElement, 0, 0, captureElement.width, captureElement.height);    
                var detail = "";
                const fixed = 5;

                // hands motion keypoint data table
                for (let idx = 0; idx < poseData.multiHandedness.length; idx++) {
                  detail += "<table style='display:inline;margin:0px 5px;'>";
                  detail += "<tr><th colspan='4' align='center'>"+poseData.multiHandedness[idx].label+" (score:"+poseData.multiHandedness[idx].score.toFixed(fixed)+")</th></tr>";
                  detail += "<tr align='center'><td></td><td>x</td><td>y</td><td>z</td></tr>"
                  for (let index = 0; index < 21; index++) {
                    detail += "<tr>";
                    detail += "<td align='center'>"+index+"</td>";
                    detail += "<td>"+poseData.multiHandLandmarks[idx][index].x.toFixed(fixed)+"</td>"
                    detail += "<td>"+poseData.multiHandLandmarks[idx][index].y.toFixed(fixed)+"</td>"
                    detail += "<td>"+poseData.multiHandLandmarks[idx][index].z.toFixed(fixed)+"</td>"
                    detail += "</tr>";
                  }
                  detail += "</table>";
                }
                
                /* Save data immediately after timer runs */
                poseData["regist"] = true;
                poseData["poseName"] = handMotionName.value;
                poseDataResult = poseData;

                document.getElementById("motion-result-keypoint").innerHTML = '<br><b>' + motionName + "</b> Motion Detail <br><br>" + detail;
                document.getElementById("motion-result-message").style.color = "green";
                document.getElementById("motion-result-message").textContent = "[" + motionName +"] motion captured! Is this the behavior you want?";
                document.getElementsByClassName("capture_canvas")[0].style.display = "block";
                document.getElementById("regist-btn-bar").style.display = "block";
                document.getElementById("result-div").style.display = "block";
              }, second*1000);
            }

            var poseDataResult;
            /* send pose data */
            document.getElementById("regist-btn").addEventListener('click', function () {
              document.getElementById("motion-result-message").style.color = "green";
              document.getElementById("motion-result-message").textContent = "[" + handMotionName.value + "] Data sent successfully! Check out the registration results!";
              ws.send(JSON.stringify(poseDataResult));
            })

            /* result message reset*/
            document.getElementById("hand-motion-name").addEventListener('focus', onClear);
            document.getElementById("cancel-btn").addEventListener('click', function () {
              document.getElementById("hand-motion-name").value = "";
              onClear();
            });

            function onClear() {
              document.getElementById("motion-result-message").textContent = "";
              document.getElementById("motion-result-keypoint").innerHTML = "";
              document.getElementById("result-div").style.display = "none";
            }

            /* keypoint rendering function */
            function onResults(results) {
              canvasCtx.save()
              canvasCtx.clearRect(0, 0, canvasElement.width, canvasElement.height)
              canvasCtx.globalCompositeOperation = 'destination-atop'
              canvasCtx.drawImage(results.image, 0, 0, canvasElement.width, canvasElement.height)
              canvasCtx.globalCompositeOperation = 'source-over'
              if (results.multiHandLandmarks) {
                for (const landmarks of results.multiHandLandmarks) {
                  drawConnectors(canvasCtx, landmarks, HAND_CONNECTIONS,
                                {color: '#f2d6ae', lineWidth: 5});
                  drawLandmarks(canvasCtx, landmarks, {color: '#b2a1f4', lineWidth: 1});
                  results["regist"] = false;
                  results["poseName"] = null;
                  ws.send(JSON.stringify(results));
                  poseData = results;
                }
              }
              canvasCtx.restore();
            }

            const hands = new Hands({locateFile: (file) => {
              return 'https://cdn.jsdelivr.net/npm/@mediapipe/hands/'+file;
            }});
            hands.setOptions({
              maxNumHands: 2,
              minDetectionConfidence: 0.6,
              minTrackingConfidence: 0.5
            });
            hands.onResults(onResults);

            /* async rendering function */
            async function render() {
              await hands.send({ image: videoElement })
            }

            /* media data setting */
            const mediaConstraints = {
              audio: false, // modify change if you want audio data
              video: { width: 600, height: 340 }
            }
            navigator.mediaDevices.getUserMedia(mediaConstraints)
            .then(stream => {
              videoElement.srcObject = stream
              videoElement.oncanplay = function (e) {
                videoElement.play()
                .then(() => {
                  startDetect(render)
                })
              }
            })
            .catch(err => {
              console.log(err)
            })
          </script>
          `
          return html
        }

        RED.nodes.createNode(this, config)
        
        this.on('input', (msg, send, done) => {
            msg.payload = HTML()
            
            if (done) {
                done()
            }
            
            send = send || function() { this.send.apply(this, arguments )}
            send(msg)
        })
        
        this.send({ payload: 'this is message from HandsDetectionNode' })
        this.on('close', function() {
        })
    }
    RED.nodes.registerType("hand-detection", HandsDetectionNode)
}