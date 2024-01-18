// client.js
document.addEventListener("DOMContentLoaded", function() {
    var style = document.createElement('style');
    style.innerHTML = `
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
            widht: 50px;
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
    `;
    document.head.appendChild(style);

    var card = document.createElement('div');
    card.id = 'card';
    card.className = 'card';
    document.body.appendChild(card);

    var icon = document.createElement('img');
    icon.src = 'https://i.ibb.co/x2Znbr6/free-chat-2639493-2187526.png'; // Replace with your icon path
    icon.className = 'icon';
    document.body.appendChild(icon);

    var phoneText = document.createElement('div');
    phoneText.id = 'phoneText';
    phoneText.className = 'phoneText';
    phoneText.textContent = 'Phone';
    card.appendChild(phoneText);

    var startStopButton = document.createElement('button');
    startStopButton.id = 'startStopButton';
    startStopButton.className = 'startStopButton';
    startStopButton.textContent = 'Call';
    card.appendChild(startStopButton);

    var callText = document.createElement('div');
    callText.id = 'callText';
    callText.className = 'callText';
    callText.textContent = 'Start Call';
    card.appendChild(callText);

    icon.addEventListener('click', function() {
        card.classList.toggle('open');
    });

    let recognition;
    let started = false;
    let audioContext = new (window.AudioContext || window.webkitAudioContext)();

    if ('webkitSpeechRecognition' in window) {
        recognition = new webkitSpeechRecognition();
        recognition.continuous = false;
        recognition.lang = 'en-US';
        recognition.interimResults = false;
        recognition.maxAlternatives = 1;
    } else {
        document.querySelector("#startStopButton").textContent = "Browser not supported";
        return;
    }

    recognition.onresult = function(event) {
        const message = event.results[0][0].transcript;
        send_message(message);
    };

    recognition.onend = function() {
        if (started) {
            recognition.start();
        }
    };

    const send_message = async (message) => {
        const response = await fetch("https://streaming-assistant.onrender.com/stream", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ "message": message })
        });

        if (!response.body) {
            console.error("Server did not return audio stream.");
            return;
        }

        const reader = response.body.getReader();
        play_streamed_audio(reader);
    };

    const play_streamed_audio = async (reader) => {
        const source = audioContext.createBufferSource();
        const stream = new ReadableStream({
            start(controller) {
                function push() {
                    reader.read().then(({ done, value }) => {
                        if (done) {
                            controller.close();
                            return;
                        }
                        controller.enqueue(value);
                        push();
                    });
                }
                push();
            }
        });

        const response = new Response(stream);
        const arrayBuffer = await response.arrayBuffer();
        const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
        source.buffer = audioBuffer;
        source.connect(audioContext.destination);
        source.start();
        source.onended = () => {
            if (started) {
                recognition.start();
            }
        };
    };

    document.querySelector("#startStopButton").addEventListener('click', function() {
        if (!started) {
            recognition.start();
            started = true;
            this.textContent = "Stop";
        } else {
            recognition.stop();
            started = false;
            this.textContent = "Start";
        }
    });
});

