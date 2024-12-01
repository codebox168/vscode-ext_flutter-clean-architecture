import * as fs from "fs";

export function appendMethodToClass(filePath: string, methodToAppend: string, strReplace?: string) {
    try {
        // Read the file contents
        let fileContent = fs.readFileSync(filePath, 'utf8');

        // Find the last closing brace of the class
        const lastClosingBraceIndex = fileContent.lastIndexOf(strReplace ?? '}');

        // Insert the new method just before the last closing brace
        const modifiedContent = fileContent.slice(0, lastClosingBraceIndex) +
            methodToAppend +
            fileContent.slice(lastClosingBraceIndex);
        return modifiedContent;
    } catch (error) {
        console.error('Error modifying the file:', error);
    }
}