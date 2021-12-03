up:
	docker-compose up --build

down:
	docker-compose down

prod:
	docker-compose -f docker-compose-prod.yml up -d --build

prod-down:
	docker-compose -f docker-compose-prod.yml down
