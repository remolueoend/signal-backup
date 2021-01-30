import {str, cleanEnv} from "envalid"

export const config = cleanEnv(process.env, {
    GOOGLE_API_CLIENT_ID: str(),
    GOOGLE_API_SECRET: str(),
    GOOGLE_API_REDIR_URL: str({default: "http://localhost:3001/auth-callback"}),
    GOOGLE_API_TOKENS: str({default: undefined as any}),
    SIGNAL_BACKUP_KEY: str(),
    NODE_ENV: str({
        choices: ["production", "development"],
        default: "development"
    })
}, {
    strict: true
})