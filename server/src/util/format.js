import slugify from 'slugify';

/* Formats name like */
/* João Victor -> joão_victor */
function formatName(string = "") {
    return slugify(string, {lower: true, strict: true});
}

/* Formates date like */
/* 27/10/2026 -> 27 OUT 2026 */
function formatDate(sate = "") {

}

export { formatName }