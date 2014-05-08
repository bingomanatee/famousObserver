# Writing Tests workflow

Although each test is unique, the workflow for testing is fairly consistent.

## 1. Write a yo-famous scenario to test

The scenario should have

### A. an initial layout with detectable surfaces

the surfaces should have data or class property that wd or famousObserver can use to identify the key dom elements
to be observed

### B. a famousObserver that polls the relevant surfaces over time

### C. a "kickoff" button that tells the famousObserver to start logging one or more surfaces' key properties

These are the changing properties -- position, opacity, size, or any other things you expect to change (as well as
the properties you hope DON'T change).

famousObserver's

### D. An end point

This can be a timeout, the end of a transform (i.e., its callback), or any other condition (surface A covers surface B).
At this endpoint, the famousObserver dumps the observed output(s) to the logs so that the wd can harvest the data.

## 2. Write a wd script to kick off the scenario

This includes:

### A. Starting the node-static server for the yo-famous directory under test

The `wd_tests/util/nodeStaticServer.js` script is a node module that returns a function `nss(cb, serverPath, port)` that will
engage a static server for any arbitrary directory in port 1337 (or any other port you designate as a param).

the callback receives `(err, server)`; to stop serving static files, call `server.close()`;

### B. Survey the initial state (optional)

You can send manual calls to `window.$famousObserver` to survey the surface state at the beginning if you wish. Or call
a macro to do it for you.

### C. Kick off the animation

Call whatever trigger you have set up in 1.A. This is easily accomplished by creating a surface button that you can
click with wd, as is shown in the testScroll scenario.

1. Call `observer.startWatching(getInfoFromDom, argsOrBase, frequency, broadcastMessage)`.
2. When you are ready to start recording call `observer.startLogging('resultName');`

### D. Receive the data from `window.$famousObserver`

When the action has run its course call from the wd script:
``` javascript
state.eval(
  'JSON.stringify(window.$famousObserver.publish("rows"))',
  function (err, result) {...}
  )
```

### E. Record the raw data into levelDB.
the LevelModel_Test suite shows how LevelModel works. you can write keys, retrieve selected keys,
write into sub-databases, etc.
