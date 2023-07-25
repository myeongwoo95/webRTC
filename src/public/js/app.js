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

function startMedia() {
  welcome.hidden = true;
  call.hidden = false;
  getMedia();
}

function handleWelcomeSubmit(event) {
  event.preventDefault();
  const input = welcomeForm.querySelector("input");
  socket.emit("join_room", { roomName: input.value }, startMedia);
  roomName = input.value;
  input.value = "";
}

welcomeForm.addEventListener("submit", handleWelcomeSubmit);

/** 누군가 방 입장 */
socket.on("welcome", () => {
  console.log("somebody join");
});
