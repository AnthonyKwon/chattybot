import fs from 'node:fs';
export default { read };

function read(file: string): Object {
    /**
     * Read JSON from file and return to Object
     * 
     * @param file - Path of the file
     * @returns The converted object of the JSON file.
     */
    const fileRawData: Buffer = fs.readFileSync(file);  // read file from location
    const fileObject: Object = JSON.parse(fileRawData.toString());  // convert buffer to object
    return fileObject;
}