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
Example sql 
```sql
SELECT table_name, column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_schema = 'b25'
ORDER BY table_name, ordinal_position;
```
