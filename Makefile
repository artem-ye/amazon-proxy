run_mongo:
	docker run --rm -d --name mongodb -p 27027:27017 -v oauth-db-vol:/data/db mongodb/mongodb-community-server:latest

start: 
	docker compose up -d --build



	
	 
