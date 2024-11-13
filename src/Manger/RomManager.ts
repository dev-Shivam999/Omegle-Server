import { User } from "./User";


let GLOBAL_ROOM_ID = 1;

interface Room {
    user1: User,
    user2: User,
}

export class RoomManager {
    private rooms: Map<string, Room>
    constructor() {
        this.rooms = new Map<string, Room>()
    }

    createRoom(user1: User, user2: User) {
        const roomId = this.generate().toString();
        this.rooms.set(roomId.toString(), {
            user1,
            user2,
        })

        user1.socket.send(JSON.stringify({
            event: "send-offer"
            , roomId: roomId

        }))

        user2.socket.send(JSON.stringify({
            event: "send-offer"
            , roomId: roomId

        }))
    }

    onOffer(roomId: string, sdp: string, senderSocketid: string) {
        const room = this.rooms.get(roomId);
        if (!room) {
            return;
        }
        const receivingUser = room.user1.socket.id === senderSocketid ? room.user2 : room.user1;
        receivingUser?.socket.send(JSON.stringify({
            event: "offer",
            sdp,
            roomId
        }))
    }

    onAnswer(roomId: string, sdp: string, senderSocketid: string) {
        const room = this.rooms.get(roomId);
        if (!room) {
            return;
        }
        const receivingUser = room.user1.socket.id === senderSocketid ? room.user2 : room.user1;

        receivingUser?.socket.send(JSON.stringify({
           event: "answer",
            sdp,
            roomId

        }));
    }

    onIceCandidates(roomId: string, senderSocketid: string, candidate: any, type: "sender" | "receiver") {
        const room = this.rooms.get(roomId);
        if (!room) {
            return;
        }
        const receivingUser = room.user1.socket.id === senderSocketid ? room.user2 : room.user1;
        receivingUser.socket.send(JSON.stringify({event:"add-ice-candidate",  candidate, type }));
    }

    generate() {
        return GLOBAL_ROOM_ID++;
    }

}