import WebSocket from "ws";
import { RoomManager } from "./RomManager";


export interface User {
    socket: socket;
    name: string;
}
export interface  socket extends WebSocket {
id: string;
}

export class UserManager {
    private users: User[];
    private queue: string[];
    private roomManager: RoomManager;

    constructor() {
        this.users = [];
        this.queue = [];
        this.roomManager = new RoomManager();
    }

    addUser(name: string, socket: socket) {
        this.users.push({
            name, socket
        })
        this.queue.push(socket.id);
        socket.send(JSON.stringify({ event: "lobby" }));
        this.clearQueue()
        this.initHandlers(socket);
    }

    removeUser(socketId: string) {
        const user = this.users.find(x => x.socket.id === socketId);

        this.users = this.users.filter(x => x.socket.id !== socketId);
        this.queue = this.queue.filter(x => x === socketId);
    }

    clearQueue() {
        console.log("inside clear queues")
        console.log(this.queue.length);
        if (this.queue.length < 2) {
            return;
        }

        const id1 = this.queue.pop();
        const id2 = this.queue.pop();
        console.log("id is " + id1 + " " + id2);
        const user1 = this.users.find(x => x.socket.id === id1);
        const user2 = this.users.find(x => x.socket.id === id2);

        if (!user1 || !user2) {
            return;
        }
        console.log("creating roonm");

        const room = this.roomManager.createRoom(user1, user2);
        this.clearQueue();
    }

    initHandlers(socket: socket) {
        socket.on("message",(message)=>{
            const data=JSON.parse(message.toLocaleString())
            if (data.event =="offer") {
                const { sdp, roomId }=data
                this.roomManager.onOffer(roomId, sdp, socket.id);
            } else if (data.event =="answer"){
                const { sdp, roomId }=data
                this.roomManager.onAnswer(roomId, sdp, socket.id);

            } else if (data.event =="add-ice-candidate"){
                const { candidate, roomId, type }=data
                this.roomManager.onIceCandidates(roomId, socket.id, candidate, type);

            }
        })
    }

}