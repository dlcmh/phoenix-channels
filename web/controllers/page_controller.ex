defmodule PhoenixChannels.PageController do
  use PhoenixChannels.Web, :controller

  def index(conn, _params) do
    render conn, "index.html"
  end
end
