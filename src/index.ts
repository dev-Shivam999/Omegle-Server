import WebSocket, { WebSocketServer } from "ws";
import express, { json } from "express";
import http from "http";
import cors from "cors";
import { socket, UserManager } from "./Manger/User";
const app = express();
app.use(express.json());

const server = http.createServer(app)
app.get('/', (req, res) => {
    res.json({ success: true });
})


const userManager=new UserManager()

const wss = new WebSocketServer({ server: server })

wss.on('connection', (socket: socket) => {

    console.log("client connected");

    socket.on("message", (message) => {
        const data = JSON.parse(message.toLocaleString())
        socket.id=data.UserId

        userManager.addUser("randomName", socket);
        socket.send(JSON.stringify(message));
    })
    socket.on("close", () => {

        userManager.removeUser(socket.id);
        console.log("client disconnected");

    });
}
)




server.listen(3000, () => {
    console.log("server listening on 3000");

})