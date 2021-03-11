# bmc2portal_build:
# 	@echo Building bmc2portal for deployment
# 	npm install && yarn build

# bmc2portal_start_fedev:
# 	@echo REACT_APP_SERVER_BASE_URL=FRONTEND > ./.env.development.local
# 	npm install && npm run start

bmc2server_start_smock:
	@echo REACT_APP_SERVER_BASE_URL=MOCK > ./.env.development.local
	go get . && go run main.go

bmc2server_start_smock-ni:
	@echo REACT_APP_SERVER_BASE_URL=MOCK > ./.env.development.local
	go run main.go
