# Run the website

First you need to install [`node.js`](nodejs.org) and `npm`. Any recent version will do.

``` shell
$ node --version
v23.9.0
$ npm --version
10.9.2
```

## Development mode :

```bash
cd web/  # you must be inside the (repository-root)/web/ directory
npm install
npm install leaflet
npm install --save-dev @types/leaflet
npm install papaparse
npm run start
```

And open your browser at [http://localhost:8081](http://localhost:8081).

## Deploy the website to Github pages :

Ensure you have a "clean" working tree (no console errors, uncommited files, etc) :

```bash
cd web/  # you must be inside the (repository-root)/web/ directory
npm run deploy
```

**This may take a few minutes before you see the changes on the following URL !!**

And open your browser at [https://com-480-data-visualization.github.io/Dateam/](https://com-480-data-visualization.github.io/Dateam/).

If you don't see your new website version at the above URL after 10 minutes, something went wrong.
