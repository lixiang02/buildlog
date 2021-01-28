import * as path from 'path'
import * as fs from 'fs'

export interface ICustomObj {
    [key:string]: any
}

export interface IConfig extends ICustomObj{
    _argv?: ICustomObj
    _env?: ICustomObj
}

export class ConfigBox {
    private _config: IConfig = {}
    private _defaultConfigFileName: string = 'buildlog.config.json'
    private _defaultConfigJsFileName: string = 'buildlog.config.js'
    public readonly root: string = process?.cwd() || process?.env?.PWD || ''

    get config (): IConfig {
        return this._config
    }
    set config (c: IConfig) {
        this._config = c
    }

    public setConfig(key: string, value: any) {
        this._config = Object.assign({}, this._config, { [key]: value })
    }

    public setProcessArgvToConfig(key:string = '_argv') {
        const args:Array<string> = (process && process.argv || []).map(e => e.trim()).filter(e => e)
        const data:ICustomObj = {}
        for (let i = 0; i < args.length; i++) {
            const value = args[i]
            const nextValue = !args[i+1] || /^--/.test(args[i + 1]) ? true : args[i + 1]
            if (/^--/.test(value)) {
                const key = value.replace(/^--/, '')
                data[key] = nextValue
            }
        }
        this.setConfig(key, data)
    }

    public setProcessEnvToConfig(key:string = '_env') {
        this.setConfig(key, process && process.env || {})
    }

    public setConfigFileToConfig() {
        if (!this.root) { return }
        const defaultConfigFilePath = path.resolve(this.root, this._defaultConfigFileName)
        const defaultConfigJSFilePath = path.resolve(this.root, this._defaultConfigJsFileName)
        try {
            this._setExistFile(defaultConfigFilePath)
            this._setExistFile(defaultConfigJSFilePath)
        } catch (error) {
            console.error('CONFIG FILE PARSE ERROR, ', error)
            return;
        }
    }
    private _setExistFile(filePath: string) {
        if (fs.existsSync(filePath)) {
            const result = require(filePath)
            this._config = Object.assign({}, this._config, result)
        }
    }
}

export default new ConfigBox()