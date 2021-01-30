import http from "http"
import {google} from "googleapis"
import { config } from "../config"
import { Credentials } from "google-auth-library"
import { parseUrl} from "query-string"
const GooglePhotos = require("googlephotos")
const { createHttpTerminator } = require("http-terminator")


const get_auth_code = (): Promise<string> => {
    return new Promise((resolve, reject) => {
        let terminator: any = undefined
        const server = http.createServer((req, res) => {
            if (req.url!.startsWith("/auth-callback?code=")) {
                res.end("you can close this window now")
                const parsed_url = parseUrl(req.url!)
                terminator.terminate()
                resolve(parsed_url.query["code"] as string)
            } else {
                // TODO: reject?
                res.statusCode = 404
                res.end()
            }
        })
        server.listen(3001)
        
        terminator = createHttpTerminator({server})
    })
}

export interface Target {
    init(): Promise<void>
    upload_candidates(files: string[], base_dir: string): Promise<void>
}

export class GooglePhotosTarget implements Target {

    private tokens?: Credentials = undefined

    private oauthClient = new google.auth.OAuth2(
        config.GOOGLE_API_CLIENT_ID,
        config.GOOGLE_API_SECRET,
        config.GOOGLE_API_REDIR_URL
    )
    
    constructor(protected album_title: string) {
        this.oauthClient.on("tokens", tokens => {
            this.update_tokens(tokens)
        })
        if(config.GOOGLE_API_TOKENS) {
            this.tokens = JSON.parse(config.GOOGLE_API_TOKENS)
        }
    }
    
    private update_tokens(tokens: Credentials) {
        this.tokens = tokens
    }

    async init() {
        if(!this.tokens) {
            const auth_url = this.oauthClient.generateAuthUrl({
                access_type: "offline",
                scope: ["https://www.googleapis.com/auth/photoslibrary"]
            })
            console.log("AUTHENTICATION REQUIRED:")
            console.log("open following URL in a browser:")
            console.log(auth_url)
            const code = await get_auth_code()
            
            const tokens = (await this.oauthClient.getToken(code)).tokens
            this.update_tokens(tokens)
        }

        this.oauthClient.setCredentials(this.tokens!)
        await this.oauthClient.getAccessToken()
    }
    
    async upload_candidates(files: string[], base_dir: string) {
        console.log("upload_candidates:", files)
        const photos = new GooglePhotos(this.tokens?.access_token)
        const all_albums: Album[] = (await photos.albums.list()).albums;
        let album = all_albums.find(a => a.title == this.album_title)
        if(!album) {
            album = await photos.albums.create(this.album_title)
        }
        
        const existing_items: MediaItem[] = (await photos.mediaItems.search(album!.id)).mediaItems || []
        const missing_files = files.filter(f => !existing_items.some(e => e.filename === f))
        
        
        if(missing_files.length) {
            console.log("uploading to album", album)
            console.log("uploading following files", missing_files)
            await photos.mediaItems.uploadMultiple(
                album!.id,
                missing_files.map(f => ({name: f})),
                base_dir,
                10000,
                60 * 1000 * 5
            )
        } else {
            console.log("nothing to upload")
        }
    }
    
    async get_valid_tokens() {
        await this.init()
        return this.tokens
    }
}

type Album = {
    title: string,
    id: string
}
type MediaItem = {
    id: string,
    filename: string
}