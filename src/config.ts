import {str, cleanEnv} from "envalid"

export const config = cleanEnv(process.env, {
    GOOGLE_API_CLIENT_ID: str(),
    GOOGLE_API_SECRET: str(),
    GOOGLE_API_REDIR_URL: str(),
    SIGNAL_BACKUP_FILE: str(),
    SIGNAL_BACKUP_KEY: str(),
    NODE_ENV: str({
        choices: ["production", "development"],
        default: "development"
    })
}, {
    strict: true
})