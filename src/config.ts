import {str, cleanEnv, port} from "envalid"

export const config = cleanEnv(process.env, {
    GOOGLE_API_CLIENT_ID: str(),
    GOOGLE_API_SECRET: str(),
    GOOGLE_API_TOKENS: str({default: undefined as any}),
    SIGNAL_BACKUP_KEY: str(),
    UPLOAD_USER: str({default: undefined as any}),
    UPLOAD_PASSWORD: str({default: undefined as any}),
    UPLOAD_PORT: port({default: 3204}),
    NODE_ENV: str({
        choices: ["production", "development"],
        default: "development"
    }),
}, {
    strict: true
})