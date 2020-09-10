# t1-sma

# Como instalar
Para rodar o simulador e necessario ter node.js e yarn instalados em seu PC.

Instalar Node.js
- <a href='https://github.com/nvm-sh/nvm'>NVM</a> (recomendado)
- <a href='https://nodejs.org/en/download/'>Node.js</a>
- <a href='https://brew.sh'>Homebrew</a>

Instalar com nvm:
  ```nvm install node 14 && npm i -g yarn```

Instalar com Homebrew:
  ```brew install node && npm i -g yarn```

# Rodar o simulador
Depois de instalar o gerenciador de pacotes Yarn, entre na pasta do projeto e execute o comando para instalar as dependencias.
  ```cd t1-sma && yarn install```

Apos instalar as dependencias realize uma simulacao usando o comando yarn start:
  ```cd t1-sma && yarn start```

# Editar os parametros da simulacao
Dentro do simulador existe um arquivo chamado <i>app.ts</i>, dentro dele existe um construtor que recebe como parametro todos os dados necessarios para criar uma fila.
Para modificar os valores da simulacao, basta editar os valores que se encontram no construtor:

```
const queue = new Queue({
  minimumArrivalTime: 20,
  maximumArrivalTime: 40,
  minmumCapacity: 1,
  maximumCapacity: 5,
  minimumAttendanceTime: 10,
  maximumAttendanceTime: 12,
  servers: 1
});
```