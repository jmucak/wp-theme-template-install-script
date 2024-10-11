import BaseService from "./BaseService.js";
import inquirer from "inquirer";
import * as fs from "fs";
import {join} from 'path';
import StringHelper from "./helpers/StringHelper.js";

export default class PluginService extends BaseService {
    constructor() {
        super();
        this.repository = "";
        this.projectName = "";
        this.deployChanges = false;
        this.formattedProjectName = {}; // namespace, className, fileName
    }

    async run() {
        await this.promptForDetails();

        if (!this.repository || !this.projectName) {
            console.error('Repository or project name is missing');
            process.exit(1);
        }

        const stringHelper = new StringHelper();
        this.formattedProjectName = stringHelper.getFormattedProjectName(this.projectName);

        if (!this.formattedProjectName.namespace || !this.formattedProjectName.className || !this.formattedProjectName.fileName) {
            console.error('Something went wrong with formatting project name, try different project name');
            process.exit(1);
        }

        this.cloneRepository(this.getRepository("plugin"), this.formattedProjectName.fileName);

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

    getFilteredFiles(files) {
        let excludedFiles = ["README.md", "composer.lock", "readme.txt", "webpack.config.mjs", "eslint.config.mjs", "package-lock.json", "static"];

        // exclude all hidden files and all special files
        return files.filter(file => !file.startsWith('.') && !excludedFiles.includes(file))
    }

    getFiles(currentDir, arrayOfFiles = []) {
        let files = fs.readdirSync(currentDir);
        files = this.getFilteredFiles(files);

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
    modifyFileNamespace(content) {
        // Replace namespace
        const namespace = /WpPluginTemplate/g;  // Regex to match the placeholder wpPluginTemplate

        return content.replace(namespace, this.formattedProjectName.namespace);
    }

    modifyMainClassName(content) {
        const placeholder = "WPPluginTemplate";

        // Replace all instances of {{new-namespace}} with the new namespace
        return content.replaceAll(placeholder, this.formattedProjectName.className);
    }

    modifyPluginSlug(content) {
        const placeholder = "PLUGIN_URL";

        return content.replace(placeholder, this.formattedProjectName.fileName);
    }

    modifyPluginName(content) {
        const placeholder = "WP Plugin Template";

        return content.replaceAll(placeholder, this.projectName);
    }

    modifyComposerName(content) {
        const placeholder = "wsytes/wp-plugin-template";

        return content.replace(placeholder, "wsytes/" + this.formattedProjectName.fileName);
    }

    modifyData(filePath, type) {
        let fileContent = fs.readFileSync(filePath, 'utf-8');
        let modifiedContent = "";
        switch (type) {
            case "modifyMainClassName":
                modifiedContent = this.modifyMainClassName(fileContent);
                break;
            case "modifyFileNamespace":
                modifiedContent = this.modifyFileNamespace(fileContent);
                break;
            case "modifyPluginSlug":
                modifiedContent = this.modifyPluginSlug(fileContent);
                break;
            case "modifyPluginName":
                modifiedContent = this.modifyPluginName(fileContent);
                break;
            case "modifyComposerName":
                modifiedContent = this.modifyComposerName(fileContent);
                break;
        }

        // Save the modified content back to the file
        fs.writeFileSync(filePath, modifiedContent, 'utf-8');
    }

    // Process all files in the template directory
    processFiles(files) {
        if (!files) {
            return;
        }
        files.forEach((filePath) => {
            // Modify namespace
            this.modifyData(filePath, "modifyFileNamespace");

            // Rename main plugin class
            if (filePath.includes("WPPluginTemplate")) {
                let newFilePath = filePath.replace("WPPluginTemplate", this.formattedProjectName.className);
                fs.rename(filePath, newFilePath, (err) => {
                    if (err) {
                        console.error(`Error renaming file ${filePath}:`, err);
                    } else {
                        console.log(`File renamed: ${filePath} -> ${newFilePath}`);

                        this.modifyData(newFilePath, "modifyMainClassName");
                    }
                });
            }

            // rename main plugin file
            if (filePath.includes("wp-plugin-name")) {
                let newFilePath = filePath.replace("wp-plugin-name", this.formattedProjectName.fileName);
                fs.rename(filePath, newFilePath, (err) => {
                    if (err) {
                        console.error(`Error renaming file ${filePath}:`, err);
                    } else {
                        console.log(`File renamed: ${filePath} -> ${newFilePath}`);

                        this.modifyData(newFilePath, "modifyMainClassName");
                        this.modifyData(newFilePath, "modifyPluginName");
                    }
                });
            }

            // rename plugin slug
            if (filePath.includes("ConfigProvider")) {
                this.modifyData(filePath, "modifyPluginSlug");
            }

            // rename composer name
            if (filePath.includes("composer.json")) {
                this.modifyData(filePath, "modifyComposerName");
            }

            console.log(`Processed file: ${filePath}`);
        });

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
                name: 'projectName',
                message: 'Enter project name:',
                validate: (input) => (input ? true : 'Project name is required'),
            },
            {
                type: 'confirm',
                name: 'deployChanges',
                message: 'Push changes to git repository(y/n):',
                default: true,
            }
        ]);

        this.repository = answers.repository;
        this.deployChanges = answers.deployChanges;
        this.projectName = answers.projectName;
    }
}