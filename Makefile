install:
	yarn global add lerna
	lerna bootstrap
	lerna run build
	lerna run link
	lerna run test
