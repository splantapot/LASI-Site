import fetchImage from "./src/fetch/fetchImage.js";
import { getDownloadLinkToID } from "./src/util/links.js";

const success = await fetchImage({
    output: "./here.png",
    url: getDownloadLinkToID("1Jzfg-LNR1i_sGnHVkRl4Rja5m5owL8fw")
});
console.log(success);