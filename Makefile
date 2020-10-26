build:
	cd app && npm run build

clean:
	cd app && npm run clean

run:
	cd app && npm run start

setup:
	cd app && npm ci

test-unit:
	cd app && npm run test -- --watchAll=false
