<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Speech to Text Demo</title>
    <style>
        html, body {
            width: 100%;
            height: 100%;
            margin: 0;
            padding: 0;
            display: flex;
            justify-content: center;
            align-items: center;
            background-color: #f0f0f0;
        }
        .card {
            position: fixed;
            right: -300px; /* Start off-screen */
            width: 300px;
            height: 600px;
            background-color: white;
            background-image: url('https://i.ibb.co/kJSbC5z/glass.png'); /* Replace with your image path */
            background-size: cover;
            background-position: center;
            background-repeat: no-repeat;
            border-radius: 30px;
            box-shadow: 0 10px 20px rgba(0, 0, 0, 0.19), 0 6px 6px rgba(0, 0, 0, 0.23);
            display: flex;
            justify-content: center;
            align-items: center;
            flex-direction: column;
            transition: right 0.5s;
        }
        .card.open {
            right: 0; /* Slide in */
        }
        .callText, .phoneText {
            position: absolute;
            width: 80%;
            margin: 0 auto;
            background: rgba(255, 255, 255, 0.5);
            border-radius: 15px;
            text-align: center;
            font-size: 1.5em;
            color: rgb(0, 47, 255);
            padding: 10px;
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
        }
        .phoneText {
            top: 10px;
        }
        .callText {
            bottom: 10px;
        }
        .startStopButton {
            font-size: 2em;
            padding: 15px;
            width: 75px;
            height: 75px;
            border-radius: 50%;
            background: green;
            color: white;
            border: none;
            cursor: pointer;
            display: flex;
            justify-content: center;
            align-items: center;
        }
        .icon {
            position: fixed;
            left: 10px;
            bottom: 10px;
            cursor: pointer;
            width: 50px;
            height: 50px;
        }
        @media (max-width: 500px) {
            .startStopButton {
                font-size: 1.5em;
                width: 60px;
                height: 60px;
            }
            .card {
                width: 90%;
                height: 90%;
            }
            .phoneText {
                font-size: 1em; /* Adjust font size for smaller devices */
            }
        }
    </style>
</head>
<body>
    <div id="card" class="card">
        <img src="https://i.ibb.co/x2Znbr6/free-chat-2639493-2187526.png" class="icon">
        <div id="phoneText" class="phoneText">Phone</div>
        <button id="startStopButton" class="startStopButton">Call</button>
        <div id="callText" class="callText">Start Call</div>
    </div>
    <script>
        document.addEventListener("DOMContentLoaded", function() {
            var card = document.getElementById('card');
            var startStopButton = document.getElementById('startStopButton');
            var recognition;
            var started = false;
            var sending_message = false;

            if ('webkitSpeechRecognition' in window) {
                recognition = new webkitSpeechRecognition();
                recognition.continuous = false;
                recognition.lang = 'en-US';
                recognition.interimResults = false;
                recognition.maxAlternatives = 1;

                recognition.onresult = function(event) {
                    const message = event.results[0][0].transcript;
                    send_message(message);
                };

                recognition.onend = function() {
                    if (started && !sending_message) {
                        recognition.start();
                    }
                };
            } else {
                startStopButton.textContent = "Browser not supported";
                return;
            }

            const send_message = async (message) => {
                sending_message = true;
                const response = await fetch("https://your-server.com/stream", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({ "message": message })
                });

                const audioBlob = await response.blob();
                const audioUrl = URL.createObjectURL(audioBlob);
                const audio = new Audio(audioUrl);

                audio.play();

                audio.onended = () => {
                    sending_message = false;
                    if (started) {
                        recognition.start();
                    }
                };
            };

            startStopButton.addEventListener('click', function() {
                if (!started) {
                    recognition.start();
                    started = true;
                    this.textContent = "End";
                    this.style.background = 'red';
                } else {
                    recognition.stop();
                    started = false;
                    this.textContent = "Call";
                    this.style.background = 'green';
                }
            });
        });
    </script>
</body>
</html>
            
