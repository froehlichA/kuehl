var output = document.getElementById('output');
var room = document.getElementById('room');
var symbol = document.getElementById('symbol');
var iframe = document.getElementById('iframe');
var input = document.getElementById('input');
var socket = io.connect('http://localhost:3000');

joinRoom();

/*
  Requests username input.
  Registers the username on the server, sets output streams, configures input.
*/
function joinRoom() {
  askQuestion('Username', 'Please input your username', function askUsername(name) {
    socket.emit('initUserInRoom', name, getRoom(), setupRoom);
  });
}

/*
  After successfully joining a room, setup input, output, and everything else.
*/
function setupRoom() {
  //Initialize output to chat.
  socket.on('sOut', (msg) => serverOutput(msg));
  socket.on('uOut', (msg, user) => userOutput(user, msg));
  socket.on('fOut', (site) => { iframe.src = site; });
  socket.on('qOut', (name, question, cb) => askQuestion(name, question, cb));
  //Initialize input.
  input.addEventListener('keyup', function inputText(event) {
    if (event.keyCode == 13 && input.value != "") {
      var msg = input.value;
      input.value = '';
      socket.emit('uIn', msg);
    }
  })
}

/*
  Asks a question from the user,
  setting '$' to name,
  and asking the question in chat.
*/
function askQuestion(name, question, cb) {
  var symbolPrev = symbol.innerHTML;
  symbol.innerHTML = name;
  var widthPrev = input.style.width;
  input.style.width = '80%';
  var roomPrev = room.innerHTML;
  room.innerHTML = question;
  input.addEventListener('keyup', function question(event) {
    if (event.keyCode == 13 && input.value != "") {
      input.removeEventListener('keyup', question);
      event.preventDefault();
      event.stopPropagation();
      var msg = input.value;
      cb(msg);
      room.innerHTML = roomPrev;
      symbol.innerHTML = symbolPrev;
      input.style.width = widthPrev;
      input.value = '';
    }
  })
}

//Adds output from a user.
function userOutput(username, msg) {
  output.innerHTML += `<p style="color: #${getColorForUser(username)};">${new Date().toLocaleTimeString()} ${username}: ${msg}</p>`;
  scrollToBottom();
}

//Adds output as a question, or an action by the server.
function serverOutput(msg) {
  output.innerHTML += `<p>--- ${msg}</p>`;
  scrollToBottom();
}

//Get the current room name.
function getRoom() {
  var loc = window.location.href;
  var split = loc.split('/');
  var room = loc.endsWith('/') ? split[split.length - 2].toUpperCase() : split[split.length - 1].toUpperCase();
  return room;
}

var messageColors = {};
const availableColors = ['e6194b', '3cb44b', 'ffe119', '0082c8', 'f58231', '911eb4', '46f0f0', 'd2f53c']
var index = 0;

//Gets a random color from the colors array.
function getRandomColor() {
  index = (availableColors[index]) ? index : 0;
  var val = availableColors[index];
  index++;
  return val;
}

//Get a unique color for each user.
function getColorForUser(name) {
  if (!messageColors[name]) {
    messageColors[name] = getRandomColor();
  }
  return messageColors[name];
}

//HELPER: Scroll always to bottom
function scrollToBottom() {
  var element = document.getElementById("output");
  element.scrollTop = element.scrollHeight;
}