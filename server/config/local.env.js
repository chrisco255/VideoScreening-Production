'use strict';

// Use local.env.js for environment variables that grunt will set when the server starts locally.
// Use for your api keys, secrets, etc. This file should not be tracked by git.
//
// You will need to set these on the server you deploy to.

module.exports = {
  DOMAIN: 'http://localhost:9000',
  SESSION_SECRET: "rotachat-secret",

  FACEBOOK_ID: 'app-id',
  FACEBOOK_SECRET: 'secret',

  TWITTER_ID: 'app-id',
  TWITTER_SECRET: 'secret',

  GOOGLE_ID: 'app-id',
  GOOGLE_SECRET: 'secret',

  AZURE_STORAGE_ACCOUNT: "roundtables",
  AZURE_STORAGE_ACCESS_KEY: "wBmYIJXvhZGaJe3GqjRzDUGL3fWc1Ni+nx8+LC9P8YqfKFLFmVlMdCt7BOPyp1Pl2aU5wMl922rCmD+pv7CuIw==",

  AZURE_MEDIA_ID: "rotavids",
  AZURE_MEDIA_SECRET: "xHjOO64PiMb/k0vG56015t5et0Nw2UmPeZTEFtHuftA=",

  AZURE_SERVICEBUS_NAMESPACE: "chriscotest",
  AZURE_SERVICEBUS_ACCESS_KEY: "dECFo6d6PpGvLjZ8xNYrUyr4mBiusOQiMN3UUnFYUJk=",

  // Control debug level for modules using visionmedia/debug
  DEBUG: ''
};
