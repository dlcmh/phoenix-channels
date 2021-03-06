// NOTE: The contents of this file will only be executed if
// you uncomment its entry in "web/static/js/app.js".

// To use Phoenix channels, the first step is to import Socket
// and connect at the socket path in "lib/my_app/endpoint.ex":
import {Socket} from "phoenix"

let socket = new Socket("/socket", {params: {token: window.userToken}})

// When you connect, you'll often need to authenticate the client.
// For example, imagine you have an authentication plug, `MyAuth`,
// which authenticates the session and assigns a `:current_user`.
// If the current user exists you can assign the user's token in
// the connection for use in the layout.
//
// In your "web/router.ex":
//
//     pipeline :browser do
//       ...
//       plug MyAuth
//       plug :put_user_token
//     end
//
//     defp put_user_token(conn, _) do
//       if current_user = conn.assigns[:current_user] do
//         token = Phoenix.Token.sign(conn, "user socket", current_user.id)
//         assign(conn, :user_token, token)
//       else
//         conn
//       end
//     end
//
// Now you need to pass this token to JavaScript. You can do so
// inside a script tag in "web/templates/layout/app.html.eex":
//
//     <script>window.userToken = "<%= assigns[:user_token] %>";</script>
//
// You will need to verify the user token in the "connect/2" function
// in "web/channels/user_socket.ex":
//
//     def connect(%{"token" => token}, socket) do
//       # max_age: 1209600 is equivalent to two weeks in seconds
//       case Phoenix.Token.verify(socket, "user socket", token, max_age: 1209600) do
//         {:ok, user_id} ->
//           {:ok, assign(socket, :user, user_id)}
//         {:error, reason} ->
//           :error
//       end
//     end
//
// Finally, pass the token on connect as below. Or remove it
// from connect if you don't care about authentication.

socket.connect()

// Now that you are connected, you can join channels with a topic:
// let channel = socket.channel("topic:subtopic", {})
let channel = socket.channel("room:lobby", {})

/*
 * Start: Event listeners
 */

let nameIsAssigned = false
let username = ""
let usernameColor = ""
const chatUsername = document.querySelector('#chat-username')
const chatInput = document.querySelector('#chat-input')
const messageContainer = document.querySelector('#messages')

// listen for enter keypress
chatInput.addEventListener('keypress', event => {
  if (event.keyCode === 13 && chatInput.value.length > 0 && !nameIsAssigned) {
    channel.push('new_user', {username: chatInput.value}) // event is named 'new_user'
    username = chatInput.value
    nameIsAssigned = true
    chatInput.value = ''
    chatInput.placeholder = "Enter message"
    return
  }
  if (event.keyCode === 13 && chatInput.value.length > 0) {
    channel.push(
      'new_msg', {
        username: username,
        usernameColor: usernameColor,
        message: chatInput.value
      }
    ) // event is named 'new_msg'
    chatInput.value = ''
    chatInput.placeholder = "Enter message"
  }
})

function constructChatMessageHTML(chat) {
  let userEl = document.createElement('span')
  userEl.style.color = chat.usernameColor
  userEl.appendChild(document.createTextNode(chat.username))
  let datetimestringEl = document.createElement('span')
  datetimestringEl.style.color = "lightgray"
  datetimestringEl.appendChild(document.createTextNode(` (${chat.datetimestring})`))
  let msgEl = document.createElement('li')
  msgEl.style.listStyleType = "none"
  msgEl.appendChild(userEl)
  msgEl.appendChild(datetimestringEl)
  msgEl.appendChild(document.createTextNode(": " + chat.message))
  messageContainer.appendChild(msgEl)
}

// listen for acknowledgement of successful user_join
channel.on('new_user', payload => {
  // console.log(JSON.stringify(payload))
  usernameColor = payload.color
  chatUsername.style.color = usernameColor
  chatUsername.appendChild(document.createTextNode(payload.username))
  for (let chat of payload.history) {
    // let userEl = document.createElement('span')
    // userEl.style.color = chat.usernameColor
    // userEl.appendChild(document.createTextNode(chat.username))
    // let msgEl = document.createElement('li')
    // msgEl.style.listStyleType = "none"
    // msgEl.appendChild(userEl)
    // msgEl.appendChild(document.createTextNode(": " + chat.message))
    // messageContainer.appendChild(msgEl)
    constructChatMessageHTML(chat)
  }
})

// listen for arrival of new messages and append to container
channel.on('new_msg', chat => {
  // let userEl = document.createElement('span')
  // userEl.style.color = chat.usernameColor
  // userEl.appendChild(document.createTextNode(chat.username))
  // let msgEl = document.createElement('li')
  // msgEl.style.listStyleType = "none"
  // msgEl.appendChild(userEl)
  // msgEl.appendChild(document.createTextNode(": " + chat.message))
  // messageContainer.appendChild(msgEl)
  constructChatMessageHTML(chat)
})
/* End: Event Listeners */

channel.join()
  .receive("ok", resp => { console.log("Joined successfully", resp) })
  .receive("error", resp => { console.log("Unable to join", resp) })

export default socket
