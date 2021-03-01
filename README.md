# COLIGO back
COLIGO backend part
COLIGO is a platform for research and referencing of new projects
## How to use it
1. Have postgresql database installed and started
2. Configure .env file
3. Have a redis database installed and started
4. Have SSL certificat installed

  Create local SSL certificat : 

        openssl req -x509 -newkey rsa:2048 -keyout key.pem -out cert.pem -days 365

  In case of troubles wich asked password : 

        openssl rsa -in key.pem -out newkey.pem

  and replace key.pem with newkey.pem.

5. Run command line :

        yarn
        yarn start
