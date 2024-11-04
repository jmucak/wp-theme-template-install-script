import shell from 'shelljs';

export default class BaseService {
    cloneRepository(repository, directory) {
        // Clone the repo
        if (shell.exec(`git clone ${repository.ssh} ${directory}`).code !== 0) {
            if (shell.exec(`git clone ${repository.https} ${directory}`).code !== 0) {
                shell.echo('Error: Git clone failed');
                shell.exit(1);
            }
        }

        // Change to the cloned directory
        shell.cd(directory);
    }

    removeGitRepositoryFile() {
        // Remove the .git directory to erase the git history
        console.log('Removing .git directory to remove git history...');

        if (shell.rm('-rf', '.git').code !== 0) {
            shell.echo('Error: Failed to remove .git directory');
            shell.exit(1);
        }
    }

    addNewGitRepository(repository) {
        console.log(`Setting new remote origin to ${repository}...`);

        // Add the new Git remote
        if (shell.exec(`git init`).code !== 0) {
            shell.echo('Error: Git initialization failed');
            shell.exit(1);
        }

        // Add all files, commit, and push
        shell.exec('git add .');
        shell.exec('git commit -m "Initial commit without history"');

        if (shell.exec(`git remote add origin ${repository}`).code !== 0) {
            shell.echo('Error: Failed to add the new remote origin');
            shell.exit(1);
        }
    }

    installDependencies() {
        // Run composer install if composer.json exists
        if (shell.test('-f', 'composer.json')) {
            console.log('Running composer install...');
            if (shell.exec('composer install').code !== 0) {
                shell.echo('Error: composer install failed');
                shell.exit(1);
            }
        }

        // Run npm install if package.json exists
        if (shell.test('-f', 'package.json')) {
            console.log('Running npm install --include dev...');

            if (shell.exec('npm install --include dev').code !== 0) {
                shell.echo('Error: npm install failed');
                shell.exit(1);
            }

            console.log('Running npm build...');
            if (shell.exec('npm run build').code !== 0) {
                shell.echo('Error: npm build failed');
                shell.exit(1);
            }
        }
    }

    // pushInitialCommit() {
    //     // Add all files, commit, and push
    //     shell.exec('git add .');
    //     shell.exec('git commit -m "Initial commit without history"');
    //
    //     // Push the cloned repository to the new repository
    //     if (shell.exec('git push -u origin main').code !== 0) {
    //         shell.echo('Error: Git push failed');
    //         shell.exit(1);
    //     }
    // }

    getRepository(type) {
        if (type === "plugin") {
            return {
                ssh: "git@github.com:jmucak/wp-plugin-template.git",
                https: "https://github.com/jmucak/wp-plugin-template.git"
            }
        }

        return {
            ssh: "git@github.com:jmucak/wp-theme-template.git",
            https: "https://github.com/jmucak/wp-theme-template.git"
        }
    }
}