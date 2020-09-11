build:
	cd app && npm run build

deploy:
	aws s3 sync ./app/public s3://nwcalvank.dev

run:
	cd app && npm run start

setup:
	cd app && npm install

test-unit:
	cd app && npm run test -- --watchAll=false
