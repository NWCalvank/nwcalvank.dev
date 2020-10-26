build:
	cd app && npm run build

run:
	cd app && npm run start

setup:
	cd app && npm install

test-unit:
	cd app && npm run test -- --watchAll=false
