const model = require('./model');
const {log, biglog, errorlog, colorize} = require('./out');

exports.helpCmd = rl => {
  log("Commandos:");
  log("  h|help - Muestra esta ayuda.");
  log("  list - Listar los quizzes existentes.");
  log("  show <id> - Muestra la pregunta y la respuesta el quiz indicado.");
  log("  add - Añadir un nuevo quiz interactivamente.");
  log("  delete <id> - Borrar el quiz indicado.");
  log("  edit <id> - Editar el quiz indicado.");
  log("  test <id> - Probar el quiz indicado.");
  log("  p|play - Jugar a preguntar aleatoriamente todos los quizzes.");
  log("  credits - Créditos.");
  log("  q|quit - Salir del programa.");
  rl.prompt();
};


exports.listCmd = rl => {
  model.getAll().forEach((quiz, id) => {
    log(`  [${colorize(id, 'magenta')}]: ${quiz.question} `);
  });

  rl.prompt();
};

exports.showCmd = (rl, id) => {

  if(typeof id === "undefined") {
    errorlog(`Falta el párametro id.`);
  }
  else {
    try {
      const quiz = model.getByIndex(id);
      log(`  [${colorize(id, 'magenta')}]: ${quiz.question} ${colorize('=>', 'magenta')}  ${quiz.answer}`);
    }
    catch(error) {
      errorlog(error.message)
    }
  }
  rl.prompt();
};

exports.addCmd = rl => {

  rl.question(colorize('Introduzca una pregunta:  ', 'red'), question => {
    rl.question(colorize('Introduzca la repuesta:  ', 'red'), answer => {
      model.add(question, answer);
      log(` ${colorize('Se ha añadido', 'magenta')}: ${question}  ${colorize('=>', 'magenta')} ${answer}`);
      rl.prompt();
    });
  });
};

exports.deleteCmd = (rl, id) => {

  if(typeof id === "undefined") {
    errorlog(`Falta el párametro id.`);
  }
  else {
    try {
      model.deleteByIndex(id);
    }
    catch(error) {
      errorlog(error.message)
    }
  }
  rl.prompt();
};

exports.editCmd = (rl, id) => {

  if(typeof id === "undefined") {
    errorlog(`Falta el párametro id.`);
  }
  else {
    try {

      const quiz = model.getByIndex(id);

      process.stdout.isTTY && setTimeout(() => {rl.write(quiz.question)},0);

      rl.question(colorize('Introduzca una pregunta:  ', 'red'), question => {

        process.stdout.isTTY && setTimeout(() => {rl.write(quiz.answer)},0);

        rl.question(colorize('Introduzca la repuesta:  ', 'red'), answer => {

          model.update(id, question, answer);
          log(` Se ha cambiado el quiz ${colorize(id, 'magenta')} por: ${question}  ${colorize('=>', 'magenta')} ${answer}`);
          rl.prompt();
        });
      });
    }

    catch(error) {
      errorlog(error.message);
      rl.prompt();
    }
  }
};

exports.testCmd = (rl, id) => {

  if(typeof id === "undefined") {
    errorlog(`Falta el párametro id.`);
  }
  else {
    try {
      const quiz = model.getByIndex(id);

      rl.question(colorize(quiz.question +  '? ', 'red'), (answer) => {

        log(`Su respuesta es:\n`);

        if(answer.trim().toUpperCase() === quiz.answer.toUpperCase()) {
          biglog('Correcta', 'green');
        }
        else {
          biglog('Incorrecta', 'red');
        }
        rl.prompt();
      });
    }

    catch(error) {
      errorlog(error.message);
      rl.prompt();
    }
  }
};

exports.playCmd = rl => {

  let score = 0;
  let numberOfQuestions = 0;
  let toBeResolved = [];

  model.getAll().forEach((quiz, id) => {
    toBeResolved[id] = id;
    numberOfQuestions++;
  });


  log(`numberOfQuestions: ${numberOfQuestions}\n`);

  //for meter id
  const playOne = () => {
    if (toBeResolved === undefined || toBeResolved.length == 0) {
      log(`No hay nada más que preguntar.`);
      log(`Fin del examen. Aciertos:\n`);
      biglog(score, 'magenta');
      rl.prompt();
    }
    else {
      let id = Math.floor(Math.random() * numberOfQuestions);

      let quiz = model.getByIndex(toBeResolved[id]);

      if (id > -1) {
      toBeResolved.splice(id, 1);
      numberOfQuestions--;
      }

      rl.question(colorize(quiz.question +  '? ', 'red'), (answer) => {

        if(answer.trim().toUpperCase() === quiz.answer.toUpperCase()) {
          score++;
          log(`CORRECTO - Lleva ${score} aciertos`);
          playOne();
        }
        else {
          log(`INCORRECTO.\nFin del examen. Aciertos:\n`);
          biglog(score, 'magenta');
          rl.prompt();
        }
      });

    }
  }

  playOne();
};

exports.creditsCmd = rl => {
  log('Autor de la práctica:');
  log('Matthias Killer','green');
  rl.prompt();
};

exports.quitCmd = rl => {
  rl.close();
};
