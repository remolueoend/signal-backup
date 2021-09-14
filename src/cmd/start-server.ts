import http from "http";
import path from "path";
import fs from "fs";
import { backup } from "./backup";
import { config } from "../config";

function is_authenticated(req: http.IncomingMessage) {
    if(req.headers.authorization) {
        const auth = Buffer.from(req.headers.authorization.split(' ')[1], 'base64').toString().split(':')
        const username = auth[0]
        const password = auth[1]
        
        return username === config.UPLOAD_USER && password === config.UPLOAD_PASSWORD
    }
    return false
}

function handle_upload(req: http.IncomingMessage, res: http.ServerResponse, signal_recipient_id: number, google_photos_album_title: string) {
    let content_buffers: any[] = []
    let total_size = 0;
    req.on("data", chunk => {
        content_buffers.push(chunk)
        total_size += chunk.length
    })
    
    req.on("end", () => {
        const file_content = Buffer.concat(content_buffers, total_size)
        const target_dir = fs.mkdtempSync("/tmp/signal-backup")
        const backup_path = path.resolve(target_dir, "newest.backup")
        fs.writeFileSync(backup_path, file_content, {encoding: "binary"})
        
        res.statusCode = 200;
        res.end();
        
        backup(backup_path, signal_recipient_id, google_photos_album_title)
            .catch(console.log)
            .finally(() => fs.rmSync(target_dir, {recursive: true, force: true}))
    })
    req.on("error", err => {
        console.error("upload failed", err)
        res.statusCode = 400;
        res.end();
    })
}

export function start_server(signal_recipient_id: number, google_photos_album_title: string ) {
    const server = http.createServer((req, res) => {
        if(req.url !== "/upload" || req.method?.toLowerCase() !== "put") {
            res.statusCode = 404;
            return res.end()
        }
        if(!is_authenticated(req)) {
            res.setHeader('WWW-Authenticate','Basic');
            res.statusCode = 401;
            return res.end()
        }
        
        if(req.headers["content-type"] !== "application/octet-stream") {
            res.statusCode = 400
            return res.end()
        }

        handle_upload(req, res, signal_recipient_id, google_photos_album_title)
    })
    
    server.listen(config.UPLOAD_PORT)
    console.log("server listening on port " + config.UPLOAD_PORT)
}