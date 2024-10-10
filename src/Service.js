import BaseService from "./BaseService.js";
import inquirer from "inquirer";

export default class Service extends BaseService {
    constructor() {
        super();
        this.repository = "";
        this.directory = "";
    }

    getRepository(type) {
        if (type === "plugin") {
            return "git@github.com:jmucak/wp-plugin-template.git";
        }

        return "git@github.com:jmucak/wp-theme-template.git";
    }

    async run(type) {
        await this.promptForDetails();

        if (!this.repository || !this.directory) {
            console.error('Something went wrong');
            process.exit(1);
        }

        this.cloneRepository(this.getRepository(type), this.directory);

        this.removeGitRepositoryFile();

        this.addNewGitRepository(this.repository);

        this.installDependencies();

        console.log("Deploy changes: " + this.deployChanges);
        if (this.deployChanges) {
            this.pushInitialCommit();
        }

        console.log('Setup completed successfully!');
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
                type: 'confirm',
                name: 'deployChanges',
                message: 'Push changes to git repository(y/n):',
                default: true,
            }
        ]);

        this.repository = answers.repository;
        this.directory = answers.directory;
        this.deployChanges = answers.deployChanges;
    }
}