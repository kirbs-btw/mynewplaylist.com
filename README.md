# mynewplaylist.com
This repo is deploying a recommendation model. onto a frontend with fastapi, postgres + vectorpg and react 


The architecture will look like that: 
taking the CBOW model vectors and transfering them into a vector database
--> faster access and additional information on spot

Having a PostgreSQL + pgvector as a database

Then having a frontend build up with 
React there


## setup 
Composing up everything connectedto the project
```bash
docker compose up -d
```

connecting to the database (wip password secret) 
```bash
psql -h localhost -U postgres -d vectordemo
```


## numbers 
rows: 2.7m 
index build time: 25min - hnsw
recall: ? 
