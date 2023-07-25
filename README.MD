# 메모

##### Stream

- playsinline은 모바일에서 video을 재생할 때 전체화면으로 커지는걸 방지
- stream은 비디오와 오디오가 결합된것
- stream은 track이라는 것을 제공한다. 오디오 track, 비디오 track, 자막 track, 그리고 각 track마다 코드로 핸들링이 가능하다.
- facingMode가 "user"이면 전면카메라, "environment"면 후면카메라이다. (휴대폰인 경우에만)

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

- 1. getUserMedia()
- 2. addStream()[deprecated]
     RTCPeerConnection() // 스트림에서 비디오 오디오 트랙을 RTCPeerConnection 객체에 넣어준다. 파라미터는 track과 stream
- 3. createOffer(), createAnswer() // 한쪽이 createOffer 하는데 주체가 누구냐면 방을 먼저 만든 A유저이다. B유저가 들어오면 A유저한테
     알람이 가는데 그 알람은 서버에서 emit한 "welcome"이다. 여기에다 createOffer()를 구현해준다. 참고로 여기에서 setLocalDescription()도 실행한다.
- 4. setLocalDescription()
     addStream()을 하기전에 양쪽 브라우저에 RTC 연결을 만들어야한다.
     중요한점은 이 연결들이 따로 설정이 이뤄지고, 그 설정들을 socket.IO를 통해서 이어준다.

- 정리하면
- 1. A유저가 하얀 방을 생성하고 그 방에 들어감
- 2. B유저가 하얀방에 들어감
- 3. A유저 브라우저에서 socket.on("welcome")이 실행됨, 거기서 offer를 emit하면서 offer를 서버에 보냄
- 4. 서버에서는 socket.on("offer")가 동작하고, 그 안에서 socket.to("하얀방").emit("offer")를 하면서 offer를 B 유저에게 보냄
- 5. B유저 브라우저에서는 socket.on("offer")가 동작하면서 A가 보낸 offer를 받게됨

##### TODO

- 영상, 오디오, 채팅을 구현하고 두 사람을 위한 임시 파일 서버에 파일업로드를 할수있게 한 후에
  유저간 연결이 끊어지면 파일은 날리는 방식으로 구현하면 재밋겟다.
