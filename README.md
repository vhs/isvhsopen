# IsVHSOpen.com

Is VHS open?

This application pretty much serves one purpose, tell you if VHS is open. It's also overly complicated for what it does.
Why? Why not!?

## Installing

```bash
$ npm install -g gulp  #May require sudo
$ npm install
$ gulp build
```

This will install glup globally and then install all package requirements locally. 'gulp build' will then
generate relevant css and javascript.

## Running

```bash
export INFLUX_HOST=<your influx host>
export DEBUG=isvhsopen:*
npm start
```

This will launch a default server but you'll need to give it access to a influx server to be useful. A full list of
config options are found in controller/config.js

If you want a quick easy influx setup I recommend starting one via docker

```bash
docker run -d -p 8083:8083 -p 8086:8086 tutum/influxdb
```

This will start a clean influxdb container, from there you just have to create the database using the web UI:

```sql
CREATE DATABASE api;
```

## Development

If you are developing then you will want the javascript/css generated while you make changes.

```bash
gulp watch
```

When you make a change it will auto build anything that is needed.

## Testing

```bash
gulp test
```

## Running from docker

```bash
docker run -d --env-file=<env file> -p <port>:3000 vanhack/isvhsopen
```

This will pull down the app from docker hub and start it.

The env file is used to hold a list of application variables, see controller/config.js for a list of options that
can be set. The contents of the file should be in the format of VARNAME=value

If you don't want the version from docker you can build it yourself:

```bash
docker build -t vanhack/isvhsopen ./
```