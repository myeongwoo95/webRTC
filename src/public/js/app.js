const socket = io();

let myStream;
let muted = false;
let cameraOff = false;
let roomName;

const call = document.querySelector("#call"); // call div 태그
const myFace = document.querySelector("#myFace"); // video 태그
const muteBtn = document.querySelector("#mute"); // 오디오 on/off 버튼
const cameraBtn = document.querySelector("#camera"); // 카메라 on/off 버튼
const camerasSelect = document.querySelector("#cameras"); // select 태그

muteBtn.addEventListener("click", handleMuteClick); // 오디오 on/off 버튼
cameraBtn.addEventListener("click", handleCameraBtnClick); // 카메라 on/off 버튼
camerasSelect.addEventListener("input", handleCameraChange); // select option 선택 이벤트

call.hidden = true;

// 사용자의 모든 카메라 장치들을 HTML select로 그려주는 함수
async function getCameras() {
  try {
    // 장치의 모든 미디어 장치를 가져 온 후
    const devices = await navigator.mediaDevices.enumerateDevices();

    // 그 중 카메라들만 가져온다.
    const cameras = devices.filter((device) => device.kind === "videoinput");

    // 현재 사용중인 카메라의 이름(label)을 저장
    const currentCamera = myStream.getVideoTracks()[0];

    // 카메라 갯수만큼 option을 만들고 select에 추가한다.
    //  innerText에는 카메라의 장비의 이름을, value에는 카메라의 고유 ID를 넣는다.
    cameras.forEach((camera) => {
      const option = document.createElement("option");
      option.value = camera.deviceId;
      option.innerText = camera.label;
      if (currentCamera.label == camera.label) {
        option.selected = true;
      }
      camerasSelect.appendChild(option);
    });
  } catch (error) {
    console.log(error);
  }
}

// 파라미터 deviceId는 카메라 ID이다.
// 이 함수는 최초에 파라미터 값 deviceId 없이 바로 실행되는 함수이다.
async function getMedia(deviceId) {
  // 미디어 스트림을 요청할 때 사용하는 초기 제약 조건으로
  // 초기에 유저가 카메라를 선택하지 않은 상황에서 사용되고
  const initialConstrains = {
    audio: true,
    video: { facingMode: "user" },
  };

  // 유저가 특정 카메라를 선택한다면 이것을 사용하는데 특정 카메라를 사용한다는 의미이다.
  const cameraConstrains = {
    audio: true,
    video: { deviceId: { exact: "myExactCameraOrBustDeviceId" } },
  };

  try {
    // 스트림을 얻는다. (오디오와 비디오 트랙)
    // 브라우저가 사용자에게 카메라와 오디오의 접근 요구한다.
    myStream = await navigator.mediaDevices.getUserMedia(
      deviceId ? cameraConstrains : initialConstrains
    );

    // myFace는 HTML video인데 srcObject 속성에 스트림 객체 넣어줌으로써, video 태그와 스트림 객체를 연결한다.
    myFace.srcObject = myStream;

    // 사용자 카메라를 HTML에 select으로 그려주기
    // 최초의 한번만 그려주기 위해서 if문 처리
    if (!deviceId) {
      await getCameras();
    }
  } catch (error) {
    console.log(error);
  }
}

function handleMuteClick(event) {
  myStream.getAudioTracks().forEach((track) => {
    track.enabled = !track.enabled;
  });

  if (!muted) {
    muteBtn.innerText = "Unmute";
    muted = true;
  } else {
    muteBtn.innerText = "Mute";
    muted = false;
  }
}

function handleCameraBtnClick() {
  myStream.getVideoTracks().forEach((track) => {
    track.enabled = !track.enabled;
  });
  if (cameraOff) {
    cameraBtn.innerText = "Turn Camera Off";
    cameraOff = false;
  } else {
    cameraBtn.innerText = "Turn Camera On";
    cameraOff = true;
  }
}

async function handleCameraChange() {
  await getMedia(camerasSelect.value);
}

/** 방 생성 및 입장 */
const welcome = document.querySelector("#welcome");
const welcomeForm = welcome.querySelector("form");

async function startMedia() {
  welcome.hidden = true;
  call.hidden = false;
  await getMedia();
  makeConnection();
}

function handleWelcomeSubmit(event) {
  event.preventDefault();
  const input = welcomeForm.querySelector("input");
  socket.emit("join_room", { roomName: input.value }, startMedia);
  roomName = input.value;
  input.value = "";
}

welcomeForm.addEventListener("submit", handleWelcomeSubmit);

/**
 * B가 방 입장하면 A 브라우저에서 동작하는 함수
 * A유저가 이 방을 만들었고 B유저가 들어오면 A유저 브라우저에서만 동작되는 함수로
 * offer()와 setLocalDescription()가 여기서 실행된다.
 * */
socket.on("welcome", async () => {
  // offer를 출력해보면 sdp키의 value로 이상하고 긴 text가 잇는데 간단히 말하면 초대장같은것이다.
  const offer = await myPeerConnection.createOffer();
  myPeerConnection.setLocalDescription(offer);
  console.log("sent the offer");
  socket.emit("offer", {
    roomName,
    offer,
  });
});

/**
 * 위에서 A 브라우저가 weclome을 함수를 동작시키면서 offer를 emit하고 서버에서 emit함수를 구현하면서
 * socket.to(room).emit("offer")를 emit하고 브라우저에서 구현하고 이 구현된 offer는 B 브라우저에서만 동작함
 */

socket.on("offer", (data) => {
  console.log("receive an offer", data.offer);
});

/**
  WebRTC P2P 통신 시나리오
  1. 두 개의 웹 브라우저가 각각 서로 다른 브라우저 창에서 실행됩니다.
  2. 각 클라이언트는 WebRTC API를 사용하여 자신의 미디어 스트림(영상, 오디오 등)을 생성합니다
  3. 그리고 RTCPeerConnection 객체를 생성합니다.
  4. 그런 다음, 두 클라이언트 간에 Offer와 Answer를 교환하여 P2P 연결을 설정합니다. // SDP(Session Description Protocol)
  P2P 연결 설정 후, 두 클라이언트는 비디오, 오디오 및 데이터를 주고받을 수 있게 됩니다.
  5. 통신이 끝나면 연결을 종료하고 RTCPeerConnection을 닫습니다.
**/
let myPeerConnection;

// makeConnection() 함수를 호출하여 myStream에 있는 미디어 트랙들을 myPeerConnection 객체에 추가합니다.
function makeConnection() {
  // RTCPeerConnection은 두 개의 웹 브라우저(peer) 간에 통신을 설정하고 관리하는 중요한 객체입니다.
  // RTCPeerConnection은 비디오, 오디오 및 데이터 스트림을 주고받는 데 사용됩니다.
  // 이렇게 생성된 peerConnection 객체를 통해 Offers, Answers, IceCandidate, Data Channels 등을 설정하고
  // 관리하여 실제 P2P 통신을 구현할 수 있게 됩니다.
  myPeerConnection = new RTCPeerConnection();

  // myStream에 있는 각 미디어 트랙을(video, audio) myPeerConnection 객체에 추가합니다.
  myStream.getTracks().forEach((track) => {
    myPeerConnection.addTrack(track, myStream);
  });
}
