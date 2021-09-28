module.exports = function(RED) {

    function HandsDetectionNode(config) {

        function HTML() {
          const html = String.raw`
          <!DOCTYPE html>
          <head>
            <meta charset="UTF-8">
            <meta http-equiv="X-UA-Compatible" content="IE=edge">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <script src="https://cdn.jsdelivr.net/npm/@mediapipe/camera_utils/camera_utils.js" crossorigin="anonymous"></script>
            <script src="https://cdn.jsdelivr.net/npm/@mediapipe/control_utils/control_utils.js" crossorigin="anonymous"></script>
            <script src="https://cdn.jsdelivr.net/npm/@mediapipe/drawing_utils/drawing_utils.js" crossorigin="anonymous"></script>
            <script src="https://cdn.jsdelivr.net/npm/@mediapipe/hands/hands.js" crossorigin="anonymous"></script>
            <title>Hands Detection</title>
            <style>    
              table {
                width: 100%;
                border-collapse: collapse;
              }
              th, td {
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
              .tooltip:hover .tooltip-content { visibility: visible; }
              #regist-btn{
                background-color:#B2A1F4;
                border:1px solid grey;
                border-left:none;
                height:21px; 
                color:white;
              }
              #regist-btn:hover{
                background-color: #7557f0;
                cursor: pointer;
              }
            </style>
          </head>
          <body>
            <div align="center" style="min-height: 800px;">
              <h1>Hands Detection Page</h1>
              <div style="display: inline-block;" align="center" class="tooltip">
                <video class="input_video" width="480px" height="270px" crossorigin="anonymous" style="border:3px solid grey"></video><br>
                <div class="tooltip-content">
                  <p>Your Camera</p>
                </div>
              </div>
              <div style="display: inline-block;" align="center" class="tooltip">
                <canvas class="output_canvas" width="480px" height="270px" style="border:3px solid #B2A1F4"></canvas><br>
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
                <input id="hand-motion-name" type="text" placeholder="Hands Motion Name"><button id="regist-btn">Regist</button>
              </div>
              <div id="result-div" style="display: none;">
                <p id="motion-result-message"></p>
                <canvas class="capture_canvas" width="480px" height="270px" style="border:1px solid black"></canvas>
                <div id="motion-result-keypoint"></div>
              </div>
            </div>  
            <hr>
            <div align="center">
              <a href="https://github.com/5FNSaaS">5FNSaaS</a>
            </div>
          </body>
          <script type="module">
            /* motion regist timer */
            const timerSecond = document.getElementById("secondTimer");
            var second = timerSecond.options[timerSecond.selectedIndex].value;
            var poseData = null;
          
            document.getElementById("secondTimer").addEventListener('change', function(){
              second = timerSecond.options[timerSecond.selectedIndex].value;
            })
          
            /* motion name empty check*/
            var handMotionName = document.getElementById("hand-motion-name");
            document.getElementById("regist-btn").addEventListener('click', function(){
              if(handMotionName.value === "" || handMotionName.value === undefined){
                document.getElementById("motion-result-message").style.color = "red";
                document.getElementById("motion-result-message").textContent = "[Fail] Invalid Name : Check motion name";
                document.getElementsByClassName("capture_canvas")[0].style.display = "none";
                document.getElementById("hand-motion-name").value = "";
                document.getElementById("result-div").style.display = "block";
              }else onCapture(handMotionName.value);
            })
          
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
          
                document.getElementById("motion-result-keypoint").innerHTML = '<br><b>' + motionName + "</b> Motion Detail <br>" + detail;
                document.getElementById("motion-result-message").style.color = "green";
                document.getElementById("motion-result-message").textContent = "Regist Success! You can used [" + motionName +"] motion";
                document.getElementsByClassName("capture_canvas")[0].style.display = "block";
                document.getElementById("hand-motion-name").value = "";
                document.getElementById("result-div").style.display = "block";
          
                poseData["regist"] = true;
                poseData["poseName"] = motionName;
                ws.send(JSON.stringify(poseData));
              }, second*1000);
            }
          
            /* result message reset if focus input box */
            document.getElementById("hand-motion-name").addEventListener('focus', function(){
              document.getElementById("motion-result-message").textContent = "";
              document.getElementById("motion-result-keypoint").innerHTML = "";
              document.getElementById("result-div").style.display = "none";
            });
          
            /* used mediapipe hands model */
            const videoElement = document.getElementsByClassName('input_video')[0];
            const canvasElement = document.getElementsByClassName('output_canvas')[0];
            const captureElement = document.getElementsByClassName('capture_canvas')[0];
            const canvasCtx = canvasElement.getContext('2d');
            const captureCtx = captureElement.getContext('2d');
          
            const ws = new WebSocket('ws://localhost:1880/ws/handsdetection')
            var poseName = null;
            
            function onResults(results) {
              canvasCtx.save();
              canvasCtx.clearRect(0, 0, canvasElement.width, canvasElement.height);
              canvasCtx.drawImage(
                  results.image, 0, 0, canvasElement.width, canvasElement.height);
              if (results.multiHandLandmarks) {
                for (const landmarks of results.multiHandLandmarks) {
                  drawConnectors(canvasCtx, landmarks, HAND_CONNECTIONS,
                                {color: '#f2d6ae', lineWidth: 5});
                  drawLandmarks(canvasCtx, landmarks, {color: '#b2a1f4', lineWidth: 1});
                  results["regist"] = false;
                  results["poseName"] = poseName;
                  ws.send(JSON.stringify(results));
                  poseData = results;
                  poseName = null;
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
          
            const camera = new Camera(videoElement, {
              onFrame: async () => {
                await hands.send({image: videoElement});
              },
              width: 480,
              height: 270
            });
            camera.start();
          </script>
          </html>
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
    RED.nodes.registerType("hands-detection", HandsDetectionNode)
}