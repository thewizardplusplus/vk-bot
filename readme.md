# VK Bot

Extendable [VK](http://vk.com/) group bot.

## Features

* listen inbox messages via [the long polling technology](https://vk.com/dev/using_longpoll);
* process messages by the specified outer command;
* serialize a message object (see below for details) to the JSON format.

## Installation

Clone this repository:

```
$ git clone https://github.com/thewizardplusplus/vk-bot.git
$ cd vk-bot
```

Install dependencies and build the project:

```
$ npm install
```

Symlink the package folder:

```
$ sudo npm link
```

## Usage

```
$ vk-bot --version
$ vk-bot --help
```

Options:

* `--version` &mdash; show version number;
* `--help` &mdash; show help.

Environment variables:

* `VK_BOT_TOKEN` &mdash; VK API access token;
* `VK_BOT_COMMAND` &mdash; messages process command.

Environment variables can be specified in a `.env` file in the project folder in the format:

```
NAME_1=value_1
NAME_2=value_2
...
```

See details about the format: https://github.com/motdotla/dotenv#rules.

A `.env` file will never modify any environment variables that have already been set.

## Message object

Message object in the JSON Schema format: [docs/message.json](docs/message.json).

## License

The MIT License (MIT)

Copyright &copy; 2017 thewizardplusplus
