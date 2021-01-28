import shelljs from 'shelljs';

export class ShellBox {
    checkGit() {
        if (!shelljs.which('git')) {
            shelljs.echo('Sorry, this script requires git');
            shelljs.exit(1);
        }
    }
    generationGitLog(tmpFilePath: string) {
        if (shelljs.exec('git log -n 1 > '+ tmpFilePath).code !== 0) {
            shelljs.echo('Error: GET GIT LOG FAILED');
            shelljs.exit(1);
        }
    }
}

export default new ShellBox()