import definePlugin from "@utils/types";
import { Message } from "@vencord/discord-types";
import { PluginNative } from "@utils/types";

import { ApplicationCommandInputType, sendBotMessage } from "@api/Commands";

const Native = VencordNative.pluginHelpers.NotificationSounds as PluginNative<typeof import("./native")>;

let config: Object;
Native.readConfig().then((dat: Object) => {
    config = dat;
})

let sounds = {}

let typing_flags = {};

var streamer_mode_flag = false;

async function getSound(name: string): Promise<string> {
    let sound = sounds[name] ?? null;
    if (sound == null) {
        let data = await Native.readAudioFile(name)
        sound = data
        sounds[name] = data
    }
    console.log(sound)
    return sound
}

function play(sounds: Array<Object>): void {
    let sound_data = sounds[Math.floor(Math.random() * sounds.length)];
    getSound(sound_data['sound']).then((sound_string) => {
        let sound = new Audio(sound_string);
        sound.volume = parseFloat(sound_data['vol']);
        sound.play();
    })
}

function handleEvent(user_id, channel_id, event): void {
    if (streamer_mode_flag) return

    let override = config['overrides'][`${user_id}+${channel_id}`] ?? null
    if (override != null) {
        let sounds = config['overrides'][`${user_id}+${channel_id}`][event] ?? null
        if (sounds != null) {
            play(sounds);
            return;
        }
    }

    let user_sound = config['defaults']['users'][user_id] ?? null
    if (user_sound != null) {
        let sounds = user_sound[event] ?? null;
        if (sounds != null) {
            play(sounds);
            return;
        }
    }

    let channel_sound = config['defaults']['channels'][channel_id] ?? null
    if (channel_sound != null) {
        let sounds = channel_sound[event] ?? null;
        if (sounds != null) {
            play(sounds);
            return;
        }
    }
}

export default definePlugin({
    name: "NotificationSounds",
    description: "custom sounds :3",
    authors: [{name: "CallMeAnny", id: 326056456602255360n}],

    commands: [{
        name: "reload",
        description: "Reload the notification config",
        inputType: ApplicationCommandInputType.BUILT_IN,
        execute: async (args, ctx) => {
            config = await Native.readConfig()
            sendBotMessage(ctx.channel.id, {
                content: "Config reloaded",
            });
        },
    },
    // was planning on adding a command to modify the config, but it seems like you can't actually use attachments, which means you would need to open the folder with the config anyway, so...
    //
    // {
    //     name: "notification",
    //     description: "Update notification sound",
    //     inputType: ApplicationCommandInputType.BUILT_IN,
    //     options: [
    //         {
    //             name: "sound",
    //             description: "",
    //             required: true,
    //             type: ApplicationCommandOptionType.ATTACHMENT,
    //         },
    //         {
    //             name: "channel",
    //             description: "",
    //             required: false,
    //             type: ApplicationCommandOptionType.CHANNEL,
    //         },
    //         {
    //             name: "user",
    //             description: "",
    //             required: false,
    //             type: ApplicationCommandOptionType.USER,
    //         }
    //     ],
    //     execute: async (args, ctx) => {
    //         const sound = findOption(args, "sound")
    //         const channel = findOption(args, "channel")
    //         const user = findOption(args, "user")

    //         console.log(sound)

    //         sendBotMessage(ctx.channel.id, {
    //             content: ``,
    //         });
    //     },
    // }
    ],


    flux: {
        MESSAGE_CREATE: data => {
            if (data.optimistic == true) {
                return
            }
            console.log("message data", data)
            let message = data.message as Message;

            handleEvent(message.author.id, message.channel_id, "message")
            typing_flags[message.author.id] = true

        },

        TYPING_START: data => {
            console.log("start data", data)
            let channel_id = data.channelId;
            let user_id = data.userId;

            if ((typing_flags[user_id] ?? true) == true) {
                handleEvent(user_id, channel_id, "typing")
                typing_flags[user_id] = false;
            }

        },

        TYPING_STOP: data => {
            console.log("stop data", data)
            let user_id = data.userId;

            typing_flags[user_id] = true;

        },

        STREAMER_MODE_UPDATE: data => {
            streamer_mode_flag = data.value;
        }
    },
});
