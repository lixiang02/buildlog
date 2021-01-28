import { render } from '@mcfed/cra-render'
import * as path from 'path'
import moment from 'moment'
import fs from './fs'
import conf, { IConfig, ICustomObj } from './config'
import shell from './shell'

export interface PConfig extends IConfig {
    outfile: string
    outfiletype: string
    outfileTemplatePath: string
    templateData: ITemplateData
    handleTemplateData: (templateData: ITemplateData, config?: PConfig) => ITemplateData
}

export interface ITemplateData extends ICustomObj {
    list?: Array<ITemplateDataItem>
}
export interface ITemplateDataItem {
    title: string
    value: string
}

const format = 'YYYY-MM-DD HH:mm:ss'

const OUT_FILE_TYPE: ICustomObj = {
    'md': 'md', 
    'html': 'html' 
}

async function main() {
    shell.checkGit()

    conf.config = Object.assign({}, conf.config, {
        outfile: path.resolve(conf.root, './reportLog'),
        outfiletype: 'md',
        outfileTemplatePath: path.resolve(conf.root, './template/md')
    }) as PConfig
    conf.setProcessArgvToConfig()
    conf.setProcessEnvToConfig()
    conf.setConfigFileToConfig()

    processArgs()

    conf.config.outfilePath = conf.config.outfile + '.' + conf.config.outfiletype

    conf.config.tmpFilePath = conf.config.outfile + '-tmp'

    shell.generationGitLog(conf.config.tmpFilePath)

    processGitLogMessage(fs.readFile(conf.config.tmpFilePath))

    fs.removeFile(conf.config.tmpFilePath)

    processTemplateData()

    if (conf.config.handleTemplateData) {
        conf.config.templateData = conf.config.handleTemplateData(conf.config.templateData, conf.config)
    }

    getFileContent()
    
    fs.writeFile(conf.config.outfilePath, conf.config.content)

    console.log('git log file ouput success, ' + conf.config.outfilePath)
}
function processTemplateData() {
    conf.config.templateData = Object.assign({}, {list:[
        { title: 'Commit', value: conf.config.commit },
        { title: 'Merge', value: conf.config.merge },
        { title: 'Author', value: conf.config.author },
        { title: 'CommitDate', value: moment(conf.config.date).format(format) },
        { title: 'Fix', value: conf.config.fix },
        { title: 'Time', value: moment(new Date()).format(format) },
    ]}, conf.config.templateData)
}

function getFileContent() {
    if (OUT_FILE_TYPE[conf.config.outfiletype] !== 'md' && conf.config.outfileTemplatePath === path.resolve(conf.root, './template/md')) {
        conf.config.outfileTemplatePath = path.resolve(conf.root, './template/' + OUT_FILE_TYPE[conf.config.outfiletype])
    }
    conf.config.content = getContent()

}

function getContent() {
    return render(fs.readFile(conf.config.outfileTemplatePath), conf.config.templateData)
}

function processGitLogMessage (result: string) {
    if (typeof result !== 'string') { return }
    const arr = result.split('\n').filter(e => e).map(e => e.trim())
    for (const value of arr) {
        if (/^commit/.test(value)) {
            conf.config.commit = value.replace(/^commit/, '').trim()
        } else if (/^Merge:/.test(value)) {
            conf.config.merge = value.replace(/^Merge:/, '').trim()
        } else if (/^Author:/.test(value)) {
            conf.config.author = value.replace(/^Author:/, '').trim()
        } else if (/^Date:/.test(value)) {
            conf.config.date = value.replace(/^Date:/, '').trim()
        } else if (/^fix:/.test(value)) {
            conf.config.fix = value.replace(/^fix:/, '').trim()
        }
    }
}

function processArgs() {
    if (!conf?.config?._argv) {
        return;
    }
    if (conf?.config?._argv?.help) {
        console.log('command [options] \n')
        console.log('')
        console.log('--outfile <path> ,defaultValue: ./reportLog \n')
        console.log('')
        console.log('--outfiletype <md|html> ,defaultValue: md \n')
        console.log('')
        process.exit(0)
    }
    if (conf?.config?._argv?.outfile) {
        conf.setConfig('outfile', conf?.config?._argv?.outfile)
    }
    if (conf?.config?._argv?.outfiletype && OUT_FILE_TYPE[conf?.config?._argv?.outfiletype]) {
        conf.setConfig('outfiletype', conf?.config?._argv?.outfiletype)
    }
}

main()