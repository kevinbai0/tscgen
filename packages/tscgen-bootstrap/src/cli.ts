import chalk from 'chalk';
import yargs from 'yargs';
import { createProject } from './createProject';

// eslint-disable-next-line no-unused-expressions
yargs
  .scriptName('tscgen-bootstrap')
  .options({
    project: {
      type: 'string',
    },
  })
  .alias('p', 'project')
  .command(
    '$0',
    'the default command',
    () => {},
    (argv) => {
      const project = argv.project;

      if (!project) {
        console.log(chalk.red('No project specified!'));
        console.log(
          chalk.yellow(
            `Make sure to specify a project name: ${chalk.blue(
              'npx tscgen-bootstrap -p project-name'
            )}`
          )
        );
        process.exit(1);
      }

      return createProject({
        projectName: project,
      });
    }
  )
  .help().argv;
