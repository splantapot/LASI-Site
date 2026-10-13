import slugify from 'slugify';

/* Formats name like */
/* João Victor -> joão_victor */
function formatName(string = "") {
    return slugify(string, {lower: true, strict: true});
}

export { formatName }