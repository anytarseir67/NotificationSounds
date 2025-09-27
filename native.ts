import { readFileSync } from "fs";

const base_path = "e:/test/vencord_server/"

export function readConfig(_) {
    let buf = readFileSync(`${base_path}sound_conf.json`, "utf8")
    let config = JSON.parse(buf)
    return config
}

export function readAudioFile(_, name: string): string {
    let config = readConfig(_);

    let data = "";
    if (config['allowed_sounds'].includes(name)) {
        let buf = readFileSync(`${base_path}${name}.mp3`)
        let dat = new Uint8Array(buf.buffer);
        let base64String = btoa(String.fromCharCode(...dat));
        data = `data:audio/mpeg;base64,${base64String}`
    }

    return data
}