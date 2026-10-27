import fs from 'fs';
import axios from 'axios';

/* Uses a Download link */
async function fetchImage(config = {output: "", url: ""}) {
    if (!config || !config.output || !config.url) return false;

    try {
        const response = await axios.get(config.url, {responseType: 'arraybuffer'});
        fs.writeFileSync(config.output, Buffer.from(response.data));
        return true;
    } catch (err) {
        console.error(`#### FetchImgError: url=${config.url}`);
        console.error(err);
        return false;
    }
}

export default fetchImage;