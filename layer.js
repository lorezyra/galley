/**
 * @fileoverview Examples of layer creation and styling for GME.
 * @author jlivni@google.com (Josh Livni).
 */

/**
 * Creates a layer.
 * @param {string} table the GME endpoint (such as 'table').
 */
GME.createLayer = function(table) {
  // TODO(jlivni): Switch to v1 url when launched.
  var url = 'https://www.googleapis.com/mapsengine/exp2/layers?process=true';
  var request = {
    name: table.name, // Layer name perhaps should be prompted for instead.
    projectId: GME.projectId,
    draftAccessList: 'Map Editors',
    publishedAccessList: 'Map Viewers',
    tags: ['galley'], // Similarly, user could be prompted for tags.
    datasourceType: 'table',
    datasources: [{id: table.id}] // table layers have a single datasource.
  };

  $.ajax({
    type: 'POST',
    url: url,
    data: window.JSON.stringify(request),
    dataType: 'json',
    headers: {
      Authorization: 'Bearer ' + GME.token,
      'content-type': 'application/json'
    },
    success: function(response, newValue) {
      GME.notify('Created new Layer'),
      console.log(response);
    },
    error: function(response) {
      GME.notify('Error creating layer');
      console.log('Create error', response.responseText);
    }
  });
};
