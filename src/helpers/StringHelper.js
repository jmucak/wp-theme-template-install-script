export default class StringHelper {
    constructor() {
    }

    getFormattedProjectName(projectName) {
        // Remove numbers from the project name
        const cleanedProjectName = this.removeNumbers(projectName);

        const className = this.toCamelCase(cleanedProjectName, true);   // First letter uppercase
        const fileName = this.toKebabCase(cleanedProjectName);          // Kebab-case (dashes)

        return {className, fileName};
    }

    toCamelCase(string, capitalizedFirstLetter = false) {
        // Replace spaces, underscores, and dashes with space and split into words
        const words = string
            .toLowerCase()
            .replace(/[_-]+/g, ' ')  // Replace underscores and dashes with space
            .split(' ')
            .filter(Boolean);        // Filter out any empty strings

        // Map words: capitalize if required and leave first letter lowercase otherwise
        const camelCasedWords = words.map((word, index) => {
            if (index === 0 && !capitalizedFirstLetter) {
                return word;  // Keep first word lowercase for camelCase
            }
            return word.charAt(0).toUpperCase() + word.slice(1);
        });

        return camelCasedWords.join('');
    }

    toKebabCase(string) {
        return string
            .toLowerCase()
            .replace(/[_\s]+/g, '-')  // Replace spaces and underscores with dashes
            .replace(/-+/g, '-');     // Ensure single dash between words
    }

    removeNumbers(str) {
        return str.replace(/[0-9]/g, '');  // Remove all digits from the string
    }
}