const fs = require('fs')

interface IConfig {
    [key:string]: any;
}
export class FsBox {
    config: IConfig
    constructor(config: IConfig) {
        this.config = config
    }
    removeFile(filePath: string) {
        fs.unlinkSync(filePath)
    }
    readFile(filePath: string) {
        return fs.readFileSync(filePath, 'utf-8')
    }
    writeFile(outfilePath: string, content: string|Buffer) {
        fs.writeFileSync(outfilePath, content)
    }
}

export default new FsBox({})