
// Example links to files
// https://docs.google.com/document/d/{ID}/edit?usp=drive_link
// https://drive.google.com/file/d/15EZewxVKGSfNmfT73IUAHV7fN3HFv8ZC/view?usp=drive_link

// Example download link
// https://docs.google.com/uc?export=download&id=

function getIDfromFileLink(url = "") {
    const regex = /\/d\/([a-zA-Z0-9_-]{25,50})\//;
    const match = url.match(regex);

    if (match) {
        const id = match[1];
    }
}

function getDownloadLinkToID(id = "") {
    return `https://docs.google.com/uc?export=download&id=${id.trim()}`;
}

export { getIDfromFileLink, getDownloadLinkToID };