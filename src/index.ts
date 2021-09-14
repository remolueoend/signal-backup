import { backup } from "./cmd/backup";
import { start_server } from "./cmd/start-server";
import { GooglePhotosTarget } from "./targets/google-photos";

switch(process.argv[2]) {
    case "backup":
        backup(
            process.argv[3],
            parseInt(process.argv[4]),
            process.argv[5]
        ).catch(console.error)
        break
    
    case "start-server":
        start_server(parseInt(process.argv[3]), process.argv[4]);
        break;
    
    case "get-google-tokens":
        const google = new GooglePhotosTarget("")
        google.get_valid_tokens().then(r => console.log(JSON.stringify(r))).catch(console.error)
        break
    
    default:
        console.log("no valid command provided")
}
