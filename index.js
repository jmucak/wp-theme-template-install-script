#!/usr/bin/env node

const shell = require('shelljs');
const path = require('path');

// Function to clone repo, run composer install, and npm install
const runSetup = (repoUrl, directory) => {
    if (!repoUrl) {
        console.error('Please provide a repository URL.');
        process.exit(1);
    }

    const repoName = path.basename(repoUrl, '.git');
    const targetDir = directory || repoName;

    // Clone the repo
    if (shell.exec(`git clone git@github.com:jmucak/wp-theme-template.git ${targetDir}`).code !== 0) {
        shell.echo('Error: Git clone failed');
        shell.exit(1);
    }

    // Change to the cloned directory
    shell.cd(targetDir);

    console.log('Removing .git directory to remove git history...');
    // Remove the .git directory to erase the git history
    if (shell.rm('-rf', '.git').code !== 0) {
        shell.echo('Error: Failed to remove .git directory');
        shell.exit(1);
    }

    console.log(`Setting new remote origin to ${repoUrl}...`);

    // Change to the cloned directory
    shell.cd(targetDir);

    // Remove the old origin and add the new one
    if (shell.exec('git remote remove origin').code !== 0) {
        shell.echo('Error: Failed to remove the old remote origin');
        shell.exit(1);
    }
    if (shell.exec(`git remote add origin ${repoUrl}`).code !== 0) {
        shell.echo('Error: Failed to add the new remote origin');
        shell.exit(1);
    }

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
        console.log('Running npm install...');
        if (shell.exec('npm install').code !== 0) {
            shell.echo('Error: npm install failed');
            shell.exit(1);
        }

        if (shell.exec('npm run build').code !== 0) {
            shell.echo('Error: npm build failed');
            shell.exit(1);
        }
    }

    console.log(`Pushing changes to ${repoUrl}...`);

    // Push the cloned repository to the new repository
    if (shell.exec('git push -u origin main').code !== 0) {
        shell.echo('Error: Git push failed');
        shell.exit(1);
    }

    console.log('Setup completed successfully!');
};

// Get the repo URL from the command-line arguments
const repoUrl = process.argv[2];
const directory = process.argv[3]; // Optional: provide a directory name
runSetup(repoUrl, directory);
