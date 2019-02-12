How to develop an extension using docker (theia-master)

To start the docker, run `docker-compose up`. Make sure that `dockerfile: dockerfile-dev` is set in the `docker-compose.yml`.


To launch the development app:
1. run `cd /home/theia/theia-master`
2. run `npx run watch` on desired package, i.e. `theia-master$ npx run watch hello-world` or `theia-master$ npx run watch @theia/python`
3. run `yarn` in `~/theia-master/examples/browser` then `yarn theia start --hostname=0.0.0.0 --startup-timeout 100000` to start the now updated app.

to be updated when more efficient means are found