/*
Script: core.js
        Contains the core functionality for Osnap.

License:
        MIT-style license.
*/

/*
Class: Osnap
        The base class for the Osnap library, containing the bootstrap and
        initialization code.

Arguments:
        sRootId - string; HTML id of the root element of the Osnap application
        urlStart - string; URL to which Osnap will make its first call and
        derive the base URL for future calls from
*/

var Osnap = new Class({
    initialize: function (sRootId, urlStart) {
        // TODO: implement
    }
 });

Osnap.oObjects = {
  owner: opensocial.DataRequest.PersonId.OWNER,
  viewer: opensocial.DataRequest.PersonId.VIEWER,
  owner_friends: opensocial.DataRequest.Group.OWNER_FRIENDS,
  owner_data: opensocial.DataRequest.PersonId.OWNER,
  viewer_data: opensocial.DataRequest.PersonId.VIEWER,
  update: opensocial.DataRequest.PersonId.VIEWER,
  first: opensocial.DataRequest.PeopleRequestFields.FIRST,
  max: opensocial.DataRequest.PeopleRequestFields.MAX,
  profile: opensocial.DataRequest.PeopleRequestFields.PROFILE_DETAILS
};

Osnap.oMethods = {
  owner: opensocial.DataRequest.prototype.newFetchPersonRequest,
  viewer: opensocial.DataRequest.prototype.newFetchPersonRequest,
  owner_friends: opensocial.DataRequest.prototype.newFetchPeopleRequest,
  owner_data: opensocial.DataRequest.prototype.newFetchPersonAppDataRequest,
  viewer_data: opensocial.DataRequest.prototype.newFetchPersonAppDataRequest,
  update: opensocial.DataRequest.prototype.newUpdatePersonAppDataRequest,
  people: opensocial.DataRequest.prototype.newFetchPeopleRequest
};

/*
Osnap.request - easy requests

Example 1. Get owner, viewer, friends, owner data.

  Osnap.request({
    owner: 'owner',
    viewer: 'viewer',
    owner_friends: 'friends',
    owner_data: 'data',
    callback: handler
  });

Example 2. Update viewer data.

  Osnap.request({
    update: {foo: ['pirate', 'ninja'], bar: ['zombie', 'robot']},
    callback: handler
  });

Example 3. Extended and parameterized requests.

  Osnap.request({
    people: {
      arg: 'owner_friends',
      params: {
        first: 1
      },
      key: 'friends'
    },
    owner: {
      params: {
        profile: ['POSTALCODE', 'CITY']
      },
      key: 'owner'
    },
    callback: handlers
  });

PLEASE NOTE: AppData is stored in JSON. Depends on
Crockford's JSON.parse() and JSON.stringify().

*/

Osnap.request = function (oArgs)
{
  if (!oArgs) return;
  
  var oReq = opensocial.newDataRequest();
  
  for (var sKey in oArgs)
  {
    // the OpenSocial object we want, given explicitly by 'arg' or implicitly by the key
    var sArg = Osnap.oObjects[oArgs[sKey].arg] || oArgs[sKey].arg || Osnap.oObjects[sKey];
    // the OpenSocial request method, given implicitly by the key
    var fnMethod = Osnap.oMethods[sKey];
    
    if (fnMethod && sArg)
    {
      if (sKey == 'update')
      {
        // update requests
        for (var sDataKey in oArgs[sKey])
        {
          var sDataValue = JSON.stringify(oArgs[sKey][sDataKey]);
          oReq.add(fnMethod.call(oReq, sArg, sDataKey, sDataValue), sDataKey);
        }
      } else if (typeof oArgs[sKey] == 'object')
      {
        // extended request
        var oParams = Osnap.params(oArgs[sKey].params); // pass params through our mapper
        oReq.add(fnMethod.call(oReq, sArg, oParams), oArgs[sKey].key);
      } else if (typeof oArgs[sKey] == 'string')
      {
        // simple request
        oReq.add(fnMethod.call(oReq, sArg), oArgs[sKey]);
      }
    }
  }
  
  oReq.send(oArgs.callback);
}

Osnap.params = function (oArgs)
{
  if (!oArgs) return;
  
  var oParams = {}

  for (sKey in oArgs)
  {
    if (Osnap.oObjects[sKey])
    {
      oParams[Osnap.oObjects[sKey]] = oArgs[sKey]
    }
  }
  
  return oParams;
}
