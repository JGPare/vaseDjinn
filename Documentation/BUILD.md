
## Docker 

This project uses docker compose. During development, compose is used to create two continers, one for the flask dev server and one for a node dev server. The node dev server is used to hot reload files. During production, vite is used to bundle the frontend and only a gunicorn flask server is run. 

## Development

You will need docker installed. With docker running, navigate to the root directory of the project `(~./vaseDjinn)` and run the command

```
docker compose up
```

This should start both services. Exit with `cmd + c` in the terminal. It is then best practice to use 

```
docker-compose down --rmi all --volumes
```

This will remove all images and associated volumes, leaving a clean slate for next time. All changes on the flask side and all changes in the `static` directory on the node side should hot reload, so you should only need to do this occasionally.

## Production

In production we won't need the node server, as we will be using the bundled build created by vite. We will therfore use this instead to build our image:

```
docker run -dp 5000:5000 image-name
```

### Database Migrations

First, enter the virtual enviroment local to the flask app. Next, set the database key in the .env file to match the desired database.

Migrations should be run with a message, which is written into a migration history file. This and the ```upgrade``` CLI command must be run each time a schema change takes place (ie. a change to ```models.py```). 

NOTE:
SQLalchemy requires the addition of the letter 'ql' into the postgres database address. 

FROM
```
postgres://restofaddress...
```

TO
```
postgresql://restofaddress...
```

Once the changes to the models file are committed, they can be migrated and the database remotely upgraded with the following commands.

``` 
flask db migrate -m "your message here" 
```

``` 
flask db upgrade
```
