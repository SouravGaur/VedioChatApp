import React, { useCallback, useEffect, useState } from "react";
import ReactPlayer from "react-player";
import { useSocket } from "../context/SockerProvider";
import peerService from "../service/peer.service";
import CallIcon from "@mui/icons-material/Call";

export default function Room() {
  const socket = useSocket();
  const [remoteSocketId, setRemoteSocketId] = useState(null);
  const [myStream, setMyStream] = useState(null);
  const [remoteStream, setRemoteStream] = useState();
  const [tracksSent, setTracksSent] = useState(false);

  const handleUserJoined = useCallback(({ email, id }) => {
    console.log(`Email ${email} joined room`);
    setRemoteSocketId(id);
  });
  const handelNegoNeedFinal = useCallback(async ({ from, ans }) => {
    if (!ans) console.log("we will got any ans");

    await peerService.setLocalDescription(ans);
  }, []);

  const handleCallUser = useCallback(async () => {
    const stream = await navigator.mediaDevices.getUserMedia({
      audio: true,
      video: true,
    });
    setMyStream(stream);
    const offer = await peerService.getOffer();
    socket.emit("user:call", { to: remoteSocketId, offer });
  }, [remoteSocketId, socket]);
  const handleIncomingCall = useCallback(
    async ({ from, offer }) => {
      setRemoteSocketId(from);
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: true,
        video: true,
      });
      setMyStream(stream);
      console.log(`Incoming Call`, from, offer);

      const ans = await peerService.getAnswer(offer);

      socket.emit("call:accepted", { to: from, ans });
    },
    [socket]
  );
  // const sendStreams = useCallback(() => {
  //   for (const track of myStream.getTracks()) {
  //     peerService.peer.addTrack(track, myStream);
  //   }
  // }, [myStream]);
  const sendStreams = useCallback(() => {
    if (myStream && !tracksSent) {
      for (const track of myStream.getTracks()) {
        peerService.peer.addTrack(track, myStream);
      }
      setTracksSent(true);
    }
  }, [myStream, tracksSent]);

  const handelCallAccepted = useCallback(
    ({ from, ans }) => {
      peerService.setLocalDescription(ans);
      console.log("Call Accepted");
      sendStreams();
    },
    [sendStreams]
  );
  const handelNegoNeeded = useCallback(async () => {
    const offer = await peerService.getOffer();
    socket.emit("peer:nego:needed", { offer, to: remoteSocketId });
  }, [remoteSocketId, socket]);
  useEffect(() => {
    peerService.peer.addEventListener("negotiationneeded", handelNegoNeeded);
    return () => {
      peerService.peer.removeEventListener(
        "negotiationneeded",
        handelNegoNeeded
      );
    };
  }, [handelNegoNeeded]);

  const handleNegoNeedIncoming = useCallback(
    async ({ from, offer }) => {
      const ans = await peerService.getAnswer(offer);
      socket.emit("peer:nego:done", { to: from, ans });
    },
    [socket]
  );
  useEffect(() => {
    try {
      peerService.peer.addEventListener("track", async (ev) => {
        const remoteStream = ev.streams;
        console.log("got tracks");

        setRemoteStream(remoteStream[0]);
        console.log("your stream", remoteStream);
      });
    } catch (error) {
      console.log(error);
    }
  }, []);
  useEffect(() => {
    peerService.peer.oniceconnectionstatechange = () => {
      console.log("ICE connection state:", peerService.peer.iceConnectionState);
    };
  }, []);

  useEffect(() => {
    socket.on("user:joined", handleUserJoined);
    socket.on("incoming:call", handleIncomingCall);
    socket.on("call:accepted", handelCallAccepted);
    socket.on("peer:nego:needed", handleNegoNeedIncoming);
    socket.on("peer:nego:final", handelNegoNeedFinal);

    return () => {
      socket.off("user:joined", handleUserJoined);
      socket.off("incoming:call", handleIncomingCall);
      socket.off("call:accepted", handelCallAccepted);
      socket.off("peer:nego:needed", handleNegoNeedIncoming);
      socket.off("peer:nego:final", handelNegoNeedFinal);
    };
  }, [socket, handleUserJoined, handleIncomingCall, handelCallAccepted]);
  return (
    <div style={{ textAlign: "center", fontSize: "2rem" }}>
      <h1 style={{ textAlign: "center", fontSize: "2rem" }}>
        Room Page:The Room
      </h1>
      <h4>{remoteSocketId ? "Connected" : "No one in room"}</h4>
      {myStream && (
        <button
          type="button"
          className="btn btn-outline-success"
          onClick={sendStreams}
        >
          Send Stream
        </button>
      )}
      {remoteSocketId && (
        <button
          type="button"
          className="btn btn-outline-success"
          onClick={handleCallUser}
        >
          <CallIcon />
        </button>
      )}
      {/* {myStream && (
        <ReactPlayer playing height="300px" width="500px" url={myStream} />
      )} */}
      {myStream && (
        <>
          {" "}
          <h1>your Vedio</h1>
          <video
            ref={(video) => {
              if (video) video.srcObject = myStream;
            }}
            autoPlay
            playsInline
            muted
            height="300px"
            width="500px"
            style={{ display: "block", margin: "auto" }}
          />
        </>
      )}

      {remoteStream && (
        <>
          {" "}
          <h1>Remote Vedio</h1>
          <video
            ref={(video) => {
              if (video) video.srcObject = remoteStream;
            }}
            autoPlay
            playsInline
            muted
            height="300px"
            width="500px"
            style={{ display: "block", margin: "auto" }}
          />
        </>
      )}
    </div>
  );
}
