# How to contribute

## Requirements

* NodeJs 14+
* Yarn

## Installation

1. Easy way: `make install`

2. Alternatively, you can install all the commands one by one:

Lerna as monorepo manager:

```
yarn global add lerna
```

Installation of dependencies:

```
lerna bootstrap
```

Build:

```
lerna run build
```

And, finally link

```
lerna run link
```
