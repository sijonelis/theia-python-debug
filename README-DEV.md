How to develop an extension using docker (theia-master)

To start the docker, run `docker-compose up`. Make sure that `dockerfile: dockerfile-dev` is set in the `docker-compose.yml`.


To launch the development app:
1. run `cd /home/theia/theia-master`
2. run `npx run watch` on desired package, i.e. `theia-master$ npx run watch hello-world` or `theia-master$ npx run watch @theia/python`
3. run `yarn` in `~/theia-master/examples/browser` then `yarn theia start --hostname=0.0.0.0 --startup-timeout 100000` to start the now updated app.

to be updated when more efficient means are found.

theia: java debug: `~/packages/java-debug`
python: `~/packages/python`
python debug: `~/packages/python-debug`

References: 
theia development guide: https://github.com/theia-ide/theia/blob/master/doc/Developing.md

VS python debugging: https://github.com/Microsoft/vscode-recipes/tree/master/debugging%20python
language server guide: https://code.visualstudio.com/api/language-extensions/language-server-extension-guide
currently implemented language server (no debug): https://github.com/palantir/python-language-server
visual studio LS (with debug func): https://github.com/Microsoft/vscode-python