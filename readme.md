# VK Bot

Extendable [VK](http://vk.com/) group bot.

## Features

* listen inbox messages via [the long polling technology](https://vk.com/dev/using_longpoll);
* process messages by the specified outer command:
    * serialize a message object (see below for details) to the JSON format;
* special responses:
    * request of a join to the group;
    * preliminary response about a receiving of a message for a processing;
* attachments:
    * support attachments in a response (see below for details);
    * automatically load attachments from a command response;
    * cache loaded attachments:
        * search in a cache by:
            * attachment path;
            * attachment basename.

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
* `VK_BOT_GROUP` &mdash; ID or screen name of the group;
* `VK_BOT_COMMAND` &mdash; messages process command;
* `VK_BOT_CACHE` &mdash; file where to persist cached attachments (default: `~/.vk-bot/attachments.json`);
* `VK_BOT_INEXACT_CACHE` &mdash; search attachments in a cache only by its basenames (allowed: `TRUE`);
* `VK_BOT_LOG` &mdash; file where to persist a log (default: `~/.vk-bot/logs/app.log`);
* `VK_BOT_PRELIMINARILY` &mdash; preliminary response about a receiving of a message for a processing (default: `Hello! Your message is being processed. Please, wait.`);
* `VK_BOT_REQUIRE_JOIN` &mdash; require join to the group before start a conversation (allowed: `TRUE`);
* `VK_BOT_JOIN_REQUEST` &mdash; request of a join to the group (default: `Hello! To talk to me, please, join my group.`).

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

## Attachments

```regex
/\${file:\/\/(?P<path>[^{}]+)}/
```

Path may be:

* absolute;
* relative to a current working directory.

## Screenshots

![Help message](screenshots/screenshot_00.png)

Help message

![Messages processing](screenshots/screenshot_01.png)

Messages processing

![Conversation with the bot](screenshots/screenshot_02.png)

Conversation with the bot

## License

The MIT License (MIT)

Copyright &copy; 2017 thewizardplusplus
