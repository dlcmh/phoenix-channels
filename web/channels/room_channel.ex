defmodule PhoenixChannels.RoomChannel do
  use Phoenix.Channel

  def join("room:lobby", _message, socket) do
    {:ok, socket}
  end

  def join("room:" <> _private_room_id, _params, _socket) do
    {:error, %{reason: "unauthorized"}}
  end

  # notifies all joined clients on this `socket`'s topic and invoke their
  # `handle_out/3` callbacks
  def handle_in("new_msg", %{"body" => body}, socket) do
    broadcast! socket, "new_msg", %{body: body}
    {:noreply, socket}
  end

  # handle_out/3 isn't a required callback, but it allows us to
  # customize and filter broadcasts before they reach each client.
  # By default, handle_out/3 is implemented for us and simply pushes
  # the message on to the client, just like our definition.
  # We included it here because hooking into outgoing events allows for
  # powerful message customization and filtering.
  def handle_out("new_msg", payload, socket) do
    push socket, "new_msg", payload
    {:noreply, socket}
  end
end
