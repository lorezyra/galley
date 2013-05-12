/**
 * Copyright (C) 2013 Google Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 *  Unless required by applicable law or agreed to in writing, software
 *  distributed under the License is distributed on an "AS IS" BASIS,
 *  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *  See the License for the specific language governing permissions and
 *  limitations under the License.
 *
 * @fileoverview OAuth related methods for Google Maps Engine / Galley
 * @author jmcgill@google.com (James McGill)
 * @author jlivni@google.com (Josh Livni)
 */


// Set the client_id with your own info from developers.google.com/console
var authConfig = {
  client_id: '388484394775.apps.googleusercontent.com',
  scopes: ['https://www.googleapis.com/auth/mapsengine',
           'https://www.googleapis.com/auth/earthbuilder.readonly',
           'https://www.googleapis.com/auth/fusiontables.readonly']
};

// The application follows the following flow:
// 1. When first loaded, the application checks if the user has already
//    authorized this application. If so, a function is called to display
//    the requested layer. This check is asynchronous, so uses callbacks in
//    JavaScript. If the user has authorized the application, an access_token
//    is granted by oauth, which can be used to authenticate when displaying
//    a Maps Engine Layer.
//
// 2. If the user has not authorized this application, an 'Authorize' button
//    is shown in the UI. An oauth flow is started when the user clicks this
//    button. Within this flow, the user is asked if they will grant permission
//    for this application to be able to read their Maps Engine data so that
//    it can be displayed on a Map.
//
// 3. If the user grants authorization to the application, the 'Authorize'
//    button is hidden and the Layer is shown. If not the 'Authorize' button
//    remains visible.
//
// 4. Periodically, the access_token is refreshed by making another call to the
//    oauth library.


/**
 * A shared function which checks if the user has previously authorized this
 * application, and if so calls the supplied callback.
 * This function should always be called before calling a function which
 * requires an oauth access_token.
 *
 * If promptUser is true, the user will be prompted to provide access. This
 * should not be set to true unless this function was triggered by a user
 * action (e.g. clicking a button).
 *
 * If promptUser is false, and the user is not authorized, the callback
 * will be called with null.
 *
 * @param {promptUser} boolean.
 * @param {callback} the callback method.
 */
function checkAuth(promptUser, callback) {
  var options = {
    client_id: authConfig.client_id,
    scope: authConfig.scopes,
    // Setting immediate to 'true' will avoid prompting the user for
    // authorization if they have already granted it in the past.
    immediate: !promptUser
  };

  // Check to see if the current user has authorized this application.
  window.setTimeout(function() {
    gapi.auth.authorize(options, callback);
  }, 1);
}

/**
 * A callback run after checking if the user has authorized this application.
 * If they have not, then authResult will be null, and a button will be
 * displayed which the user can click to begin authorization.
 *
 * Authorization can only be started in response to a user action (such as
 * clicking a button) in order to avoid triggering popup blockers.
 *
 * @param {Object} authResult the authorization result (or null if unauthorized).
*/
function handleAuthResult(authResult) {
  var authorizeButton = $('#authorize-button');
  authorizeButton.on('click', handleAuthClick);
  // Has the user authorized this application?
  if (authResult && !authResult.error) {
    GME.token = authResult.access_token;
    authorizeButton.hide();
    $('#instructions').html('Select a project from above.');
    // The access_token provided by the oauth flow is only valid for a certain
    // amount of time. Add a timer which will refresh the access_token after the
    // amount of time has elapsed, so that the Layer will continue to work.
    window.setTimeout(refreshToken, authResult.expires_in * 1000);
    GME.initializeMap();
  } else {
    // The application has not been authorized. Start the authorization flow.
    authorizeButton.show();
  }
}

/**
 * This function is called once the oauth token has expired. It starts an
 * oauth flow in the background which obtains a new token. The user will not
 * be prompted to do anything, because we set the 'immediate' property on the
 * gapi.auth.authorize request to true.
*/
function refreshToken() {
  checkAuth(false, refreshLayer);
}

/**
 * This function is called once an expired access_token has been refreshed, and
 * a new access_token is available.
 * @param {Object} authResult the authorization result.
*/
function refreshLayer(authResult) {
  // TODO: Update the token provided to any existing MapsEngineLayers.
  GME.token = authResult.access_token;
  // This token will also expire after some time, so create a timer which will
  // refresh it again.
  window.setTimeout(refreshToken, authResult.expires_in * 1000);
}

/**
 * This function is called when the user clicks the Authorization button. It
 * starts the authorization flow.
*/
function handleAuthClick() {
  checkAuth(true, handleAuthResult);
  return false;
}
