/*
Script: request.js
        Abstracts OpenSocial asynchronous data and network requests.

License:
        MIT-style license.
*/

if (typeof window.Osnap === 'undefined') window.Osnap = {};

Osnap.oObjects = {
  owner: opensocial.DataRequest.PersonId.OWNER,
  viewer: opensocial.DataRequest.PersonId.VIEWER,
  owner_friends: opensocial.DataRequest.Group.OWNER_FRIENDS,
  owner_data: opensocial.DataRequest.PersonId.OWNER,
  viewer_data: opensocial.DataRequest.PersonId.VIEWER,
  update: opensocial.DataRequest.PersonId.VIEWER,
  first: opensocial.DataRequest.PeopleRequestFields.FIRST,
  max: opensocial.DataRequest.PeopleRequestFields.MAX,
  profile: opensocial.DataRequest.PeopleRequestFields.PROFILE_DETAILS,
  content: gadgets.io.RequestParameters.CONTENT_TYPE,
  json: gadgets.io.ContentType.JSON,
  feed: gadgets.io.ContentType.FEED,
  dom: gadgets.io.ContentType.DOM,
  text: gadgets.io.ContentType.TEXT,
  method: gadgets.io.RequestParameters.METHOD,
  get: gadgets.io.MethodType.GET,
  post: gadgets.io.MethodType.POST,
  post_data: gadgets.io.RequestParameters.POST_DATA,
  auth: gadgets.io.RequestParameters.AUTHORIZATION,
  authenticated: gadgets.io.AuthorizationType.AUTHENTICATED,
  signed: gadgets.io.AuthorizationType.SIGNED
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
Function: Osnap.request
        Abstracts OpenSocial DataRequest objects.

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
  oArgs.callback = oArgs.callback || function() {};
  
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
        // JSON-encode objects
        Osnap.encode(oArgs[sKey]);
        // update requests
        for (var sDataKey in oArgs[sKey])
        {
          oReq.add(fnMethod.call(oReq, sArg, sDataKey, oArgs[sKey][sDataKey]), sDataKey);
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

/*
Function: Osnap.params
        Maps simple parameters to OpenSocial parameters.
*/

Osnap.params = function (oArgs)
{
  if (!oArgs) return;
  
  var oParams = {}

  for (var sKey in oArgs)
  {
    if (Osnap.oObjects[sKey])
    {
      oParams[Osnap.oObjects[sKey]] = Osnap.oObjects[oArgs[sKey]] || oArgs[sKey];
    }
  }
  
  return oParams;
}

/*
Function: Osnap.encode
        Encode object values as strings for serialization (in-place).
        Specify obj.no_json=1 to avoid JSON encoding for obj.
*/

Osnap.encode = function (oVars)
{
  for (sKey in oVars)
  {
    // JSON-encode objects (if available)
    if (window.JSON && typeof oVars[sKey] == 'object' && !oVars[sKey].no_json)
    {
      oVars[sKey] = JSON.stringify(oVars[sKey]);
    }
  }
  return oVars;
}

/*
Function: Osnap.vars
        Maps objects to query strings, but lets strings pass through.
*/

Osnap.vars = function (oVars)
{
  return typeof oVars == 'string' ? oVars : gadgets.io.encodeValues(Osnap.encode(oVars));
}

/*
Function: Osnap.post
        Abstracts OpenSocial POST requests.
*/

Osnap.post = function (oArgs)
{
  oArgs.method = 'post';
  oArgs.post_data = Osnap.vars(oArgs.vars);
  Osnap.net(oArgs);
}

/*
Function: Osnap.get
        Abstracts OpenSocial GET requests.
*/

Osnap.get = function (oArgs)
{
  var sVars = Osnap.vars(oArgs.vars);
  oArgs.method = 'get';
  oArgs.url += sVars ? '?'+sVars : '';
  Osnap.net(oArgs);
}

/*
Function: Osnap.net
        Abstracts generic OpenSocial network requests.
*/

Osnap.net = function (oArgs)
{ 
  if (!oArgs) return;
  oArgs.callback = oArgs.callback || function() {};
  
  var oParams = Osnap.params(oArgs);
  
  gadgets.io.makeRequest(
    oArgs.url,
    oArgs.callback,
    oParams
  );
}
