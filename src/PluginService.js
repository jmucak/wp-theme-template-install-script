import BaseService from "./BaseService.js";
import inquirer from "inquirer";
import * as fs from "fs";
import {join} from 'path';

export default class PluginService extends BaseService {
    constructor() {
        super();
        this.repository = "";
        this.directory = "";
        this.namespace = "";
        this.deployChanges = false;
    }

    async run() {
        await this.promptForDetails();

        if (!this.repository || !this.directory || !this.namespace) {
            console.error('Something went wrong');
            process.exit(1);
        }

        this.cloneRepository(this.getRepository("plugin"), this.directory);

        this.removeGitRepositoryFile();

        this.processFiles(this.getFiles(process.cwd()));

        this.addNewGitRepository(this.repository);

        this.installDependencies();

        console.log("Deploy changes: " + this.deployChanges);
        if (this.deployChanges) {
            this.pushInitialCommit();
        }

        console.log('Setup completed successfully!');
    }

    getFiles(currentDir, arrayOfFiles = []) {
        let excludeFiles = ["README.md", "composer.lock", "readme.txt", "webpack.config.js", "package-lock.json"];
        let files = fs.readdirSync(currentDir);
        files = files.filter(file => !file.startsWith('.') && !excludeFiles.includes(file));

        files.forEach((file) => {
            const fullPath = join(currentDir, file);
            if (fs.statSync(fullPath).isDirectory()) {
                arrayOfFiles = this.getFiles(fullPath, arrayOfFiles);
            } else {
                arrayOfFiles.push(fullPath);
            }
        });

        return arrayOfFiles;
    }

    // Modify the namespace in the content of the file
    modifyNamespace(content) {
        const placeholder = /wpPluginTemplate/g;  // Regex to match the placeholder {{new-namespace}}

        // Replace all instances of {{new-namespace}} with the new namespace
        return content.replace(placeholder, this.namespace);
    }

    // Process all files in the template directory
    processFiles(files) {
        if (!files) {
            return;
        }
        files.forEach((filePath) => {
            let fileContent = fs.readFileSync(filePath, 'utf-8');
            const modifiedContent = this.modifyNamespace(fileContent);

            // Save the modified content back to the file
            fs.writeFileSync(filePath, modifiedContent, 'utf-8');
            console.log(`Processed file: ${filePath}`);
        });

        console.log('Namespace replaced in all files successfully!');
    }

    async promptForDetails() {
        const answers = await inquirer.prompt([
            {
                type: 'input',
                name: 'repository',
                message: 'Enter the repository URL:',
                validate: (input) => (input ? true : 'Repository URL is required'),
            },
            {
                type: 'input',
                name: 'directory',
                message: 'Enter the destination directory name:',
                validate: (input) => (input ? true : 'Destination directory name is required'),
            },
            {
                type: 'input',
                name: 'namespace',
                message: 'Enter new namespace:',
                validate: (input) => (input ? true : 'Namespace is required'),
            },
            {
                type: 'confirm',
                name: 'deployChanges',
                message: 'Push changes to git repository(y/n):',
                default: true,
            }
        ]);

        this.repository = answers.repository;
        this.directory = answers.directory;
        this.deployChanges = answers.deployChanges;
        this.namespace = answers.namespace;
    }
}