defmodule PhoenixChannels.RoomChannel do
  use Phoenix.Channel
  alias PhoenixChannels.Tracker, as: Tracker

  def join("room:lobby", _message, socket) do
    # IO.puts "join/3 for room:lobby called"
    # send(self(), :after_join) # calls `handle_info(:after_join, socket)`
    {:ok, socket}
  end

  def join("room:" <> _private_room_id, _params, _socket) do
    {:error, %{reason: "unauthorized"}}
  end

  # called by `send` in `join("room:lobby", _message, socket)`
  # def handle_info(:after_join, socket) do
    # push socket, "feed", %{list: feed_items(socket)}
    # push socket, "user_joined", %{user_joined: "!!!!"} # message must be a Map
    # {:noreply, socket}
  # end

  def handle_in("new_user", %{"body" => _}, socket) do
    push socket, "new_user", %{body: generate_color(), history: Tracker.all}
    {:noreply, socket}
  end

  # notifies all joined clients on this `socket`'s topic and invoke their
  # `handle_out/3` callbacks
  def handle_in("new_msg", %{"username" => username,
                             "usernameColor" => usernameColor,
                             "body" => body},
                           socket) do
    # IO.puts "handle_in/3 called"
    broadcast! socket, "new_msg", %{username: username,
                                    usernameColor: usernameColor,
                                    body: body}
    Tracker.add(username: username, usernameColor: usernameColor, message: body)
    IO.inspect Tracker.all
    {:noreply, socket}
  end

  # web/channels/room_channel.ex:28: [warning] An intercept for event "new_msg"
  # has not yet been defined in Elixir.PhoenixChannels.RoomChannel.handle_out/3.
  # Add "new_msg" to your list of intercepted events with intercept/1
  # intercept ["new_msg"]

  # handle_out/3 isn't a required callback, but it allows us to
  # customize and filter broadcasts before they reach each client.
  # By default, handle_out/3 is implemented for us and simply pushes
  # the message on to the client, just like our definition.
  # We included it here because hooking into outgoing events allows for
  # powerful message customization and filtering.
  # def handle_out("new_msg", payload, socket) do
  #   IO.puts "handle_out/3 called"
  #   push socket, "new_msg", payload
  #   {:noreply, socket}
  # end

  def generate_color do
    v = "0123456789ABCDEF"
    c = String.codepoints(v)
    r = 1..6
    |> Enum.map(fn _ -> Enum.random(c) end)
    |> Enum.join
    "#" <> r
  end
end
