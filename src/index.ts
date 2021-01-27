import { backup } from "./cmd/backup";

if(process.argv[2] === "backup") {
    backup(parseInt(process.argv[3]), process.argv[4]).catch(console.error)

}