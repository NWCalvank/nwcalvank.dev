build:
	cd app && npm run build

deploy:
	aws s3 sync --delete --cache-control 'max-age=604800' --exclude index.html ./app/public/ s3://nwcalvank.dev/
	aws s3 sync --cache-control 'no-cache' ./app/public/ s3://nwcalvank.dev/

run:
	cd app && npm run start

setup:
	cd app && npm install

test-unit:
	cd app && npm run test -- --watchAll=false
