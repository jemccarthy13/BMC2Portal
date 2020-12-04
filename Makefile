list:
	@echo !! 
	@echo !! Available 'make' commands
	@echo !! 
	@echo 
	@echo -e frontend-dev \t\t Build & serve bmc2portal for STANDALONE development
	@echo -e frontend-dev-ni \t\t Build & serve bmc2portal for STANDALONE development (no npm install)
	@echo -e server-mock \t\t Build bmc2portal/server for frontend integration -- no DB
	@echo -e server-mock-ni \t\t Build bmc2portal/server for frontend integration (no npm install && no go get)
	@echo -e frontend-deploy\t\t Builds bmc2portal for deployment-production

frontend-dev:
	@echo !!
	@echo !! MAKE FRONTEND-DEV
	@echo !!
	@echo !! Building bmc2portal for STANDALONE development.
	@echo !!
	@echo !! Any requests that pull data from the database are mocked on the FRONTEND and are self-contained for 	@echo !! STANDALONE local FRONTEND DEVELOPMENT and test.
	@echo !!
	${MAKE} -C ./bmc2portal bmc2portal_start_fedev

frontend-dev-ni:
	@echo !!
	@echo !! MAKE FRONTEND-DEV-NOINSTALL
	@echo !!
	@echo !! Building bmc2portal for STANDALONE development (no npm install).
	@echo !!
	@echo !! Any requests that pull data from the database are mocked on the FRONTEND and are self-contained for 
	@echo !! STANDALONE local FRONTEND DEVELOPMENT and test.
	@echo !!
	${MAKE} -C ./bmc2portal bmc2portal_start_fedev-noinstall

frontend-deploy:
	@echo !!
	@echo !! MAKE FRONTEND-DEPLOY 
	@echo !!
	@echo !! Building bmc2portal STANDALONE packaged for production.
	@echo !!
	${MAKE} -C ./bmc2portal bmc2portal_build

server-mock:
	@echo !!
	@echo !! BULDING SERVER-MOCK 
	@echo !!
	@echo !! Building bmc2server and bmc2portal for MOCKED SERVER INTEGRATION.
	@echo !!
	@echo !! Any requests that pull data from the database are mocked on the SERVER and are contained in this
	@echo !! subsystem for FRONTEND/SERVER local INTEGRATION and test.
	@echo !!
	${MAKE} -j2 _server-dev _frontend-smock

server-mock-ni:
	@echo !!
	@echo !! BULDING SERVER-MOCK 
	@echo !!
	@echo !! Building bmc2server and bmc2portal for MOCKED SERVER INTEGRATION. Skips npm install and skips go get.
	@echo !!
	@echo !! Any requests that pull data from the database are mocked on the SERVER and are contained in this
	@echo !! subsystem for FRONTEND/SERVER local INTEGRATION and test.
	@echo !!
	${MAKE} -j2 _server-dev-ni _frontend-smock-ni

_server-dev:
	${MAKE} -C ./bmc2server/src bmc2server_start_smock

_server-dev:
	${MAKE} -C ./bmc2server/src bmc2server_start_smock-noinstall

_frontend-smock:
	${MAKE} -C ./bmc2portal bmc2portal_start_smock

_frontend-smock-ni:
	${MAKE} -C ./bmc2portal bmc2portal_start_smock-noinstall
