# Signal Backup

A "very-much" work-in-progress service for backing up media files from Signal-chat groups to places such as Google Photos.

Requires a backup file to be present somewhere on disk. Provides a single command `backup`:

```sh
node ./build/index.js backup <SIGNAL_RECIPIENT_ID> <GOOGLE_PHOTOS_ALBUM_TITLE>
```
see `src/config.ts` for a list of required enviornment variables. `SIGNAL_RECIPIENT_ID` should be replaced by group name in the future.
