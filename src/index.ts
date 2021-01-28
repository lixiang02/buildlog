import { render } from '@mcfed/cra-render'
import * as path from 'path'
import moment from 'moment'
import fs from './fs'
import conf, { IConfig, ICustomObj } from './config'
import shell from './shell'

export interface PConfig extends IConfig {
    outfile: string
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

async function main() {
    shell.checkGit()

    conf.config = Object.assign({}, conf.config, {
        outfile: path.resolve(conf.root, './reportLog.md'),
        outfileTemplatePath: path.resolve(__dirname, '../template/md'),
        templateData: {}
    }) as PConfig
    conf.setProcessArgvToConfig()
    conf.setProcessEnvToConfig()
    conf.setConfigFileToConfig()

    processArgs()

    conf.config.outfilePath = getOutfilePath()

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
function getOutfilePath() {
    if (!/\.\w+$/.test(conf.config.outfile)) {
        conf.config.outfile = conf.config.outfile + '.md'
    }
    return conf.config.outfile
}

function processTemplateData() {
    let list = [
        { title: 'Commit', value: conf.config.commit },
        { title: 'Author', value: conf.config.author },
        { title: 'CommitDate', value: moment(new Date(conf.config.date)).format(format) },
        { title: 'Time', value: moment(new Date()).format(format) },
    ]
    if (conf.config.merge) {
        list.push({ title: 'Merge', value: conf.config.merge })
    }
    if (conf.config.fix) {
        list.push({ title: 'Fix', value: conf.config.fix })
    }
    if (conf.config.feat) {
        list.push({ title: 'Feat', value: conf.config.feat })
    }
    if (conf.config.docs) {
        list.push({ title: 'Docs', value: conf.config.docs })
    }
    if (conf.config.templateData.list && Array.isArray(conf.config.templateData.list)) {
        list = list.concat(conf.config.templateData.list) 
    }
    conf.config.templateData.list = list
}

function getFileContent() {
    if (!/\.md$/.test(conf.config.outfile) && conf.config.outfileTemplatePath === path.resolve(conf.root, './template/md')) {
        conf.config.outfileTemplatePath = path.resolve(__dirname, '../template/html')
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
        } else if (/^feat:/.test(value)) {
            conf.config.feat = value.replace(/^feat:/, '').trim()
        } else if (/^docs:/.test(value)) {
            conf.config.docs = value.replace(/^docs:/, '').trim()
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
        console.log('--help\n')
        console.log('')
        process.exit(0)
    }
    if (conf?.config?._argv?.outfile) {
        conf.setConfig('outfile', conf?.config?._argv?.outfile)
    }
}

main()