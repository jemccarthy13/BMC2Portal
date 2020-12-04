bmc2portal_build:
	@echo Building bmc2portal for deployment
	npm install && npm run build

bmc2portal_start_fedev:
	@echo REACT_APP_SERVER_BASE_URL=FRONTEND > ./.env.development.local
	npm install && npm run start

bmc2portal_start_fedev-noinstall:
	@echo REACT_APP_SERVER_BASE_URL=FRONTEND > ./.env.development.local
	npm run start

bmc2portal_start_smock:
	@echo REACT_APP_SERVER_BASE_URL=http://localhost:8080 > ./.env.development.local
	npm install && npm run start

bmc2portal_start_smock-noinstall:
	@echo REACT_APP_SERVER_BASE_URL=http://localhost:8080 > ./.env.development.local
	npm run start