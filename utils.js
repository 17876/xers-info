const { marked } = require("marked");
const sanitizeHtml = require("sanitize-html");

//replaces tabs with &nbsp; and adds two spaces after each line
function preprocessMarkdown(text) {
    return text
        .split("\n")
        .map((line) => {
            // Capture leading tabs or spaces
            const match = line.match(/^(\s+)/);

            let processedLine = line;

            if (match) {
                const indent = match[1];
                const nbspIndent = indent.replace(/\t/g, "&nbsp;");
                processedLine = nbspIndent + line.trimStart();
            }

            // Add two spaces at end for Markdown line break
            return processedLine + "  ";
        })
        .join("\n");
}

function safeMarkdown(text) {
    // Convert markdown to HTML
    const preprocessed = preprocessMarkdown(text);
    const rawHtml = marked.parse(preprocessed);

    // Sanitize the HTML
    return sanitizeHtml(rawHtml, {
        allowedTags: [
            "p",
            "br",
            "strong",
            "em",
            "ul",
            "ol",
            "li",
            "a",
            "h1",
            "h2",
            "h3",
        ],
        allowedAttributes: {
            a: ["href", "target", "rel"],
        },
    });
}

function applyMarkdownFields(obj, fields) {
    for (const path of fields) {
        applyToPath(obj, path.split("."));
    }
    return obj;
}

//example: applyToPath(project, ["description", "*"])
function applyToPath(current, pathParts) {
    if (!current) return;

    const part = pathParts[0];

    // Handle arrays
    if (part.endsWith("[]")) {
        const key = part.replace("[]", "");
        const array = current[key];
        if (Array.isArray(array)) {
            for (const item of array) {
                applyToPath(item, pathParts.slice(1));
            }
        }
        return;
    }

    // Handle wildcard '*'
    if (part === "*") {
        for (const key of Object.keys(current)) {
            if (pathParts.length === 1) {
                if (typeof current[key] === "string") {
                    current[key] = safeMarkdown(current[key]);
                }
            } else {
                applyToPath(current[key], pathParts.slice(1));
            }
        }
        return;
    }

    // Last field → apply markdown
    if (pathParts.length === 1) {
        if (typeof current[part] === "string") {
            current[part] = safeMarkdown(current[part]);
        }
        return;
    }

    // Go deeper
    applyToPath(current[part], pathParts.slice(1));
}

// function formatObject(obj) {
//     if (typeof obj === "string") {
//         return nl2br(safeFormat(obj));
//         // return safeMarkdown(obj);
//     }

//     if (Array.isArray(obj)) {
//         return obj.map((item) => formatObject(item));
//     }

//     if (obj !== null && typeof obj === "object") {
//         let newObj = {};
//         for (const key in obj) {
//             newObj[key] = formatObject(obj[key]);
//         }
//         return newObj;
//     }

//     return obj; // numbers, booleans, null
// }

module.exports = {
    applyMarkdownFields: applyMarkdownFields,
};
