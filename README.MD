# 메모

- laysinline은 모바일에서 video을 재생할 때 전체화면으로 커지는걸 방지

##### Stream

- WebRTC에서 "stream"은 실시간으로 미디어 데이터(예: 오디오, 비디오)를 교환하는 데 사용되는 개념입니다.
- stream은 track이라는 것을 제공한다. 오디오 track, 비디오 track, 자막 track, 그리고 각 track마다 코드로 핸들링이 가능하다.
- WebRTC를 사용하여 두 피어가 미디어 스트림을 교환할 수 있습니다.

##### webRTC

- webRTC는 peer to peer이다.
- signaling -> 서버를 통해서 peer to peer가 된다. (시그널링을 위해서 webSocket을 사용한다.)
- 사용자는 서버에게 위치, settings, configuration(방화벽, 라우터등등) 등을 보낸다.
- 서버는 그 정보를 다른 브라우저에게 전달해준다.
- webRTC로 보낼 수 있는 정보는 영상, 오디오, 텍스트이다.
- webRTC 개념들: Rooms, Offers, Answers, IceCandidate, Senders, STUN, Data Channels

##### room

- room은 socket.io의 그 room이다.
- socket.io의 room이 필요한 이유는 시그널링을 하기 위해 즉 유저가 offer를 보내고 offer를 받고 answer를 보내기위한 용도이다.
- A가 방을 만들고 B가 그 방을 들어가면 A가 신호를 받고 거기서부터 시그널링이 시작된다.

##### offer

- 1. getUserMedia() // 방을 create/join 하는 순간
- 2. addStream()[deprecated] -> makeConnectino() {new RTCPeerConnection() ...}
     RTCPeerConnection() // 스트림에서 비디오 오디오 트랙을 RTCPeerConnection 객체에 넣어준다. 파라미터는 track과 stream

- 3. createOffer(), createAnswer() // 한쪽이 createOffer 하는데 주체가 누구냐면 방을 먼저 만든 A유저이다. B유저가 들어오면 A유저한테
     알람이 가는데 그 알람은 서버에서 emit한 "welcome"이다. 여기에다 createOffer()를 구현해준다. 참고로 여기에서 setLocalDescription()도 실행한다.
- 4. setLocalDescription()
     addStream()을 하기전에 양쪽 브라우저에 RTC 연결을 만들어야한다.
     중요한점은 이 연결들이 따로 설정이 이뤄지고, 그 설정들을 socket.IO를 통해서 이어준다.

- room과 offer 배운 내용을 간단하게 요약하면
- 1. A유저가 하얀 방을 생성하고 그 방에 들어감
- 2. B유저가 하얀방에 들어감
- 3. A유저 브라우저에서 socket.on("welcome")이 실행됨, 거기서 offer를 emit하면서 offer를 서버에 보냄
- 4. 서버에서는 socket.on("offer")가 동작하고, 그 안에서 socket.to("하얀방").emit("offer")를 하면서 offer를 B 유저에게 보냄
- 5. B유저 브라우저에서는 socket.on("offer")가 동작하면서 A가 보낸 offer를 받게됨

##### answer

- 1. setRemoteDescription()
- 2. getUserMedia
- 3. addStream()
- 4. CreateAnswer()
- 5. setLocalDescription()

- B유저는 A유저의 offer를 받으면 A의 setRemoteDescription()를 통해 A유저의 description을 설정한다.
- 2,3 은 당연히 방에 들어가면서 햇을테고
- answer를 만들고 그것을 다시 A유저에게 보낸다
- A유저는 그것을 받고 setRemoteDescription을 해준다.
- 이렇게 되면 A와 B는 서로 setLocalDescription과 setRemoteDesction 을 한 상태이다.

##### iceCandidate

- iceCandidate란 인터넷 다연결 생성에 필요한 즉, webRTC에 필요한 프로토콜들을 의미한다. 즉 브라우저가 서로 소통하는 방법을 선택하는데 어떤 소통 방법이 가장 좋은지를 제안할때 사용한다. 다수의 후보들이 각각의 연결에서 제안되고 그들은 서로의 동의하에 하나의 방식을 선택한다.

- 시나리오는 다음과 같다.
  양쪽에서 실행되는 함수인 makeConnection에서 RTCPeerConnection에 이벤트 리스너를 2개 등록한다.
  하나는 candiate를 찾을때마다 상대 브라우저에게 "icecandidate" 보내는 이벤트와
  하나는 상대 브라우저부터 stream받아서 등록하는"addStream" 이벤트이다.

  icecandidate 이벤트 설명
  (data) => { socket.emit("ice", { candidate: data.candidate, roomName }); }
  그러면 방에 입장할 때 makeConnection가 호출되면 RTCPeerConnection는 연결에 적합한
  candidate를 하나씩 찾는데 candidate를 찾을때마다 소켓서버를 통해서 상대 브라우저에게 보낸다. 이런식으로 각 브라우저는 서로 candidate를 공유하게 된다.

  addStream 이벤트 설명
  (data) => { data.stream}은 상대 유저의 stream이다.
  이젠 이걸 새로운 video 태그에 그려주면된다.

##### Senders

-

##### TODO

- 영상, 오디오, 채팅을 구현하고 두 사람을 위한 임시 파일 서버에 파일업로드를 할수있게 한 후에
  유저간 연결이 끊어지면 파일은 날리는 방식으로 구현하면 재밋겟다.
