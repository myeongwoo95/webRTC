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
- room은 소켓에서 배웟던 방 개념이다
- room은 시그널링을 하기 위해 유저간 서로의 존재를 알려주기 위해 존재한다.
- 누군가 방을 만들고 누군가 그 방을 들어가면 시그널링이 시작된다.

<pre>
Rooms: WebRTC에서 여러 사용자가 실시간으로 연결되는 단위를 나타냅니다. 각 방(Room)은 특정 주제 또는 목적에 따라 사용자들이 모여 있는 공간으로 생각할 수 있습니다. 방을 통해 특정 그룹 간의 통신을 구성할 수 있습니다.

Offers: WebRTC 통신을 시작하기 위해 발신측(peer)이 수신측(peer)에게 통신을 시작하고자 하는 의도와 기능(비디오, 오디오 등)에 대한 제안을 보내는 메시지입니다.

Answers: 수신측(peer)이 발신측(peer)에게 Offer에 대한 응답으로 보내는 메시지입니다. Offer에서 제안된 기능을 수락하거나 추가 제안을 할 수 있습니다.

IceCandidate: WebRTC에서 피어 간의 연결을 설정하는 데 사용되는 네트워크 정보입니다. 브라우저들은 서로의 주소 및 포트 정보를 수집하고 교환하여 연결을 수립하게 됩니다.

Senders: WebRTC에서 비디오, 오디오 등의 미디어 스트림을 전송하는 객체를 나타냅니다. Senders를 사용하여 미디어 스트림을 다른 피어에게 전송합니다.

STUN (Session Traversal Utilities for NAT): WebRTC에서 P2P 통신을 위해 사용되는 네트워크 주소 변환(NAT)과 방화벽 트래버설을 지원하는 서버입니다. 이 서버를 통해 브라우저는 자신의 공인 IP 주소와 포트를 확인하여 연결을 수립하는데 도움을 받습니다.

Data Channels: WebRTC에서 피어 간에 데이터를 교환하기 위한 양방향 데이터 채널을 말합니다. Data Channels은 비디오/오디오 스트림과는 별도로 사용되며, 실시간 채팅이나 파일 전송과 같은 데이터 교환에 사용됩니다.

</pre>

##### TODO

- 영상, 오디오, 채팅을 구현하고 두 사람을 위한 임시 파일 서버에 파일업로드를 할수있게 한 후에
  유저간 연결이 끊어지면 파일은 날리는 방식으로 구현하면 재밋겟다.
