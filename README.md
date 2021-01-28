### 构建日志

#### 使用说明

安装模块包命令：
```
npm install buildlog --save-dev
```

运行命令：
```
npm run buildlog
```

命令参数：
```
--outfile <path> 制定输出文件路径，默认值是 ./reportLog
--outfiletype <md|html> 制定输出文件类型，默认是 md, 可选类型 html
```
配置文件：
- 运行命令所在路径下的 `buildlog.config.json` 或者 `buildlog.config.js`

配置文件内容：
```
{
    outfile: '',
    outfiletype: '',
    templateData: {},
    outfileTemplatePath: '',
    handleTemplateData: (templateData, config) => { return templateData }
}
```
允许用户自定义模版，修改模版数据，生成自定义的构建日志或者添加日志数据等。
