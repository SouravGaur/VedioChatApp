import React, { useState, useCallback, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useSocket } from "../context/SockerProvider";

export default function Lobby() {
  const [email, setEmail] = useState("");
  const [room, setRoom] = useState("");

  const socket = useSocket();
  const navigate = useNavigate();
  console.log(socket);

  const handleSubmitForm = useCallback(
    (e) => {
      e.preventDefault();
      socket.emit("room:join", { email, room });

      console.log({ email, room });
    },
    [email, room, socket]
  );
  const handleJoinRoom = useCallback(
    (data) => {
      const { email, room } = data;
      navigate(`/room/${room}`);
      console.log(email, room);
    },
    [navigate]
  );
  useEffect(() => {
    socket.on("room:join", handleJoinRoom);
    return () => {
      socket.off("room:join");
    };
  }, [socket, handleJoinRoom]);

  return (
    <div>
      <form
        style={{ width: "40vw", marginLeft: "30%", marginTop: "20%" }}
        onSubmit={handleSubmitForm}
      >
        <h1 style={{ textAlign: "center" }}>Lobby</h1>
        <div className="mb-3">
          <label htmlFor="email" className="form-label">
            Email
          </label>
          <input
            type="email"
            className="form-control"
            id="email"
            value={email}
            placeholder="Example email id"
            onChange={(e) => {
              setEmail(e.target.value);
            }}
          />
        </div>
        <div className="mb-3">
          <label htmlFor="room" className="form-label">
            Room Number
          </label>
          <input
            type="text"
            className="form-control"
            id="room"
            placeholder="Another input placeholder"
            value={room}
            onChange={(e) => {
              setRoom(e.target.value);
            }}
          />
        </div>

        <button type="submit" className="btn btn-light">
          Join
        </button>
      </form>
    </div>
  );
}
