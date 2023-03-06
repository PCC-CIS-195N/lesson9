function init() {
    document.getElementById("result").innerHTML = "Got here";
    const socket = new WebSocket(`ws://${window.location.hostname}:3001/`);

    socket.addEventListener('open', (evt) => {
        socket.addEventListener('message', (evt) => {
            let msg = JSON.parse(evt.data);
            if(msg.type == "searchResults") {
                let html = "<ul>";
                msg.data.forEach(r => {
                    html += `<li>${r.name}: ${r.post}</li>`;
                });
                html += "</ul>";
                document.getElementById('result').innerHTML = html;
            }
        });
    });
    const inputBox = document.getElementById('inputBox');
    inputBox.addEventListener('keyup', evt => {
        if(evt.code == 'Enter' || evt.code == 'NumpadEnter') {
            let key = inputBox.value;
            inputBox.value = "";

            socket.send(JSON.stringify({
                type: "search",
                key: key
            }));
        }
    })
}