function dbConnect(mongoose) {
  if (process.env.VCAP_SERVICES) {
    var env = JSON.parse(process.env.VCAP_SERVICES);
    var mongo = env['mongodb-1.8'][0]['credentials'];
  } else {
    var staticUrl = "mongodb://5acf8044-54a3-4a1b-b3db-a93e04928c9c:d25acfb8-720b-4cca-98b6-a20ff5ee2599@127.0.0.1:10000/db";
  }

  var generate_mongo_url = function(obj){
    if (!process.env.VCAP_SERVICES) {
      return staticUrl;
    }
    obj.hostname = (obj.hostname || 'localhost');
    obj.port = (obj.port || 27017);
    obj.db = (obj.db || 'test');
    if(obj.username && obj.password){
      return "mongodb://" + obj.username + ":" + obj.password + "@" + obj.hostname + ":" + obj.port + "/" + obj.db;
    } else {
      return "mongodb://" + obj.hostname + ":" + obj.port + "/" + obj.db;
    }
  }

  return mongoose.createConnection(generate_mongo_url(mongo));
}

module.exports.dbConnect = dbConnect;
