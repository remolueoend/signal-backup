import { GooglePhotosTarget, Target } from "../targets/google-photos";
import fs from "fs"
import { spawnSync, spawn } from "child_process";
import { config } from "../config";
import path, { resolve } from "path";
import { sql } from "googleapis/build/src/apis/sql";
const sqlite3 = require("sqlite3").verbose()

type Attachment = {
    _id: number,
    caption?: string,
    unique_id: number
}

const extractor_path = path.resolve(__dirname, config.isDev ?
    "../../build/signal-backup-decode" :
    "./signal-backup-decode"
)

async function run_proc(name: string, args: string[]) {
    return new Promise<void>((resolve, reject) => {
        const child = spawn(name, args, {stdio: "inherit"})
        child.on("error", reject)
        child.on("exit", (code, signal) => {
            if(code === 0) resolve()
            else reject(new Error("child exit with code " + code))
        })
    })
}

function resolve_attachment_files(extract_dir: string, attachments: Attachment[]) {
    const all_files = fs.readdirSync(path.resolve(extract_dir, "attachment"))
    return attachments.map(a => all_files.find(f => f.startsWith(`${a.unique_id}_${a._id}.`))!)
}

export async function backup(signal_recipient_id: number, google_photos_album_title: string) {
    const extract_dir = fs.mkdtempSync("/tmp/signal-backup")
    console.debug(`extract_dir is: ${extract_dir}`)
    await extract(extract_dir);
    
    const google_photos = new GooglePhotosTarget(google_photos_album_title)
    await google_photos.init()
    const file_list = await get_attachments_of_channel(extract_dir, signal_recipient_id)
    google_photos.upload_candidates(
        resolve_attachment_files(extract_dir, file_list),
        path.resolve(extract_dir, "attachment")
    )
}

async function get_attachments_of_channel(extract_dir: string, recipient_id: number) {
    const db = new sqlite3.Database(path.resolve(extract_dir, "signal_backup.db"))
    const query = db.prepare(`
    select _id, unique_id from part where sticker_pack_id is NULL and mid in (
        select _id from mms where thread_id = (
            select _id from thread where recipient_ids = ?
        )
    );`)
    return new Promise<Attachment[]>((resolve, reject) => {
        query.all(recipient_id, (err: Error | null, rows: Attachment[]) => {
            if(err) return reject(err)
            resolve(rows)
        })
    })

}

async function extract(target_dir: string) {
    const args = [
        "-o", target_dir,
        "-p", config.SIGNAL_BACKUP_KEY,
        "-f",
        path.resolve(config.SIGNAL_BACKUP_FILE)
    ]
    console.debug(args)
    await run_proc(extractor_path, args)
}
