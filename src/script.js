const {argv} = require('yargs')
var checker = require('license-checker');
const { writeFile } = require('fs');
const { forEach, get , uniqBy }= require('lodash');
const json2md = require("json2md");

const dest = get(argv, 'dest', './');
const name = get(argv, 'name', 'third-party-libs');

checker.init({
    start: '.'
}, function(error, packages) {
    if (error) {
        console.log('error ', error);
    } else {
      let resume = [];
      var cleanRepositories = Object.keys(packages).map(index => {
        let repository = {
          name: index,
          repository: packages[index].repository,
          license: packages[index].licenses
        }
        return repository;
    });

      let cleanRepositoriesWithoutDuplicates = uniqBy(cleanRepositories, 'repository');

      var counts = {
        repositories: {},
        total: cleanRepositoriesWithoutDuplicates.length,
      };

      cleanRepositoriesWithoutDuplicates.forEach(repository => {
        counts.repositories[repository.license] = (counts.repositories[repository.license] || 0)+1;
      });

      resume.push({h1: `total -> ${counts.total}`});
      forEach(counts.repositories, function(obj, key) {
        resume.push({h1: `${key} - ${obj}`})
      });

      cleanRepositoriesWithoutDuplicates.forEach(repository => {
        resume.push({h1: repository.name});
        resume.push({ol: [ repository.repository || '', repository.license || ''] });
      });

      let md =json2md(resume);

      writeFile(`${dest}/${name}.md`, md, 'utf8', function (err) {
        if (error) {
            console.log("An error occured while writing Object to File.");
            return console.log(error);
        }
        console.log("File has been saved.");
      });
    }
});