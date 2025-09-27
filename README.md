# NotificationSounds
vencord plugin for custom notification sounds

## Installing

firstly, follow the [vencord custom plugin documentation](https://docs.vencord.dev/installing/custom-plugins/).

once you have created the userplugins folder, clone this repository into it (resulting path should be `/src/userplugins/NotificationSounds`), and rebuild vencord.

## Configuring

### Base path:
edit the `base_path` variable in `native.ts` to point to a directory where you will store config and sound files. (you must rebuild vencord to update this path)

create a `sound_conf.json` file in that directory, and place any sound files there (only tested with mp3)

### Example sound_conf.json:

```json
{
    "defaults": {
        "users": {
            "326056456602255360": {
                "typing": [
                    {"sound": "soft_notification_rev2", "vol": "0.1"}
                ],
                "message": [
                    {"sound": "soft_notification_rev2", "vol": "0.4"}
                ]
            }
        },
        "channels": {}
    },
    "overrides": {
        "326056456602255360+891851684400205904": {
                "typing": [
                    {"sound": "soft_notification_rev2", "vol": "0.1"}
                ],
                "message": [
                    {"sound": "soft_notification_rev2", "vol": "0.4"}
                ]
        }
    },
    "allowed_sounds": ["soft_notification_rev2"]
}
```

only one sound can be triggered per event, and are checked in the order of overrides -> users -> channels

