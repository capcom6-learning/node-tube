up:
	docker-compose -f docker-compose-prod.yml up -d --build

stop:
	docker-compose -f docker-compose-prod.yml stop

down:
	docker-compose -f docker-compose-prod.yml down

dev:
	docker-compose up -d --build

dev-stop:
	docker-compose -f docker-compose-prod.yml stop

dev-down:
	docker-compose -f docker-compose-prod.yml down