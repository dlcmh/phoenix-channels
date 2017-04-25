defmodule PhoenixChannels.Tracker do
  @moduledoc """
  Tracks messages, based on `Agent`.
  """

  @doc """
  Starts a new tracker.
  """
  def start_link do
    IO.puts "PhoenixChannels.Tracker start_link/0 called"
    Agent.start_link(fn -> [] end, name: __MODULE__)
  end

  @doc """
  List all entries.
  """
  def all do
    Agent.get(__MODULE__,
      fn(list) ->
        list |> Enum.sort_by(fn map -> map[:timestamp] end, &<=/2)
      end
    )
  end

  @doc """
  Adds `[user: "user1", message: "a message"]` `map` to the head of the list.
  """
  def add(map) do
    IO.puts "PhoenixChannels.Tracker add/1 called"
    Agent.update(__MODULE__, fn(list) -> [map | list] end)
  end
end
