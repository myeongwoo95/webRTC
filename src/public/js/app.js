const socket = io();

let myStream;
let muted = false;
let cameraOff = false;

const myFace = document.querySelector("#myFace"); // video 태그
const muteBtn = document.querySelector("#mute"); // 오디오 on/off 버튼
const cameraBtn = document.querySelector("#camera"); // 카메라 on/off 버튼
const camerasSelect = document.querySelector("#cameras"); // select 태그

muteBtn.addEventListener("click", handleMuteClick); // 오디오 on/off 버튼
cameraBtn.addEventListener("click", handleCameraBtnClick); // 카메라 on/off 버튼
camerasSelect.addEventListener("input", handleCameraChange); // select option 선택 이벤트

// 사용자의 모든 카메라 장치들을 HTML select로 그려주는 함수
async function getCameras() {
  try {
    // 장치의 모든 미디어 장치를 가져 온 후
    const devices = await navigator.mediaDevices.enumerateDevices();

    // 그 중 카메라들만 가져온다.
    const cameras = devices.filter((device) => device.kind === "videoinput");

    // 카메라 갯수만큼 option을 만들고 select에 추가한다.
    //  innerText에는 카메라의 장비의 이름을, value에는 카메라의 고유 ID를 넣는다.
    cameras.forEach((camera) => {
      const option = document.createElement("option");
      option.value = camera.deviceId;
      option.innerText = camera.label;
      camerasSelect.appendChild(option);
    });
  } catch (error) {
    console.log(error);
  }
}

// 최초에는 cameraDeviceId없이 로딩하고,
async function getMedia(cameraDeviceId) {
  const initialConstrains = {};

  try {
    // 스트림을 얻는다. (오디오와 비디오 트랙)
    // 브라우저가 사용자에게 카메라와 오디오의 접근 요구한다.
    myStream = await navigator.mediaDevices.getUserMedia({
      audio: true,
      video: true,
    });

    // myFace는 HTML video인데 srcObject 속성에 스트림 객체 넣어줌으로써, video 태그와 스트림 객체를 연결한다.
    myFace.srcObject = myStream;

    // 사용자 카메라를 HTML에 select으로 그려주기
    await getCameras();
  } catch (error) {
    console.log(error);
  }
}
getMedia();

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
