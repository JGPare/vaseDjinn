
## Docker 
To build the docker image use the command below. The ```-t``` option allows you to name the image.

```
docker build -t vase-djinn .
```

### Building with a Volume

You can build with a volume to sync your code during developments, so changes are reflected right away in your app running in a docker container. Do not do this in production. The  ```sh ```  options opens and runs a terminal in the container. Note that the port mapping maps local port 5001 to container port 5000. Port 5000 is used by airdrop on newer macbooks.

```
docker run -dp 5001:5000 -w /app -v "$(pwd):/app" vase-djinn sh -c "python app.py"
```

In production we use this instead to build our image:

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
