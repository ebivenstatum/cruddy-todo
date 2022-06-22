const fs = require('fs');
const path = require('path');
const _ = require('underscore');
const counter = require('./counter');
const Promise = require('bluebird');

var items = {};

// Public API - Fix these CRUD functions ///////////////////////////////////////

exports.create = (text, callback) => {

  counter.getNextUniqueId((err, id) => {
    if (err) {
      console.log(err);
    } else {
      items[id] = text;
      fs.writeFile(`${exports.dataDir}/${id}.txt`, text, (err, data) => {
        if (err) {
          console.log('err creating file');
        } else {
          callback(null, { id, text });
        }
      });
    }
  });

};

exports.createAsync = Promise.promisify(exports.create);

exports.readAll = (callback) => {

  fs.readdir(exports.dataDir, (err, files) => {
    if (err) {
      callback(err)
    } else {

      var data = _.map(files, (file) => {
        return new Promise((resolve, reject) => {
          let id = file.slice(0, 5);
          let text = fs.readFile(`${exports.dataDir}/${id}.txt`, 'utf8', (err, fileData) => {
            if (err) {
              reject(err)
            } else {
              resolve({ 'id': id, 'text': fileData });
            }
          });

        });
      });

      Promise.all(data).then((value) => {
        callback(null, value);
      });

    }

  });

};

exports.readOne = (id, callback) => {

  fs.readFile(`${exports.dataDir}/${id}.txt`, 'utf8', (err, data) => {
    if (err) {
      callback(err);
    } else {
      callback(null, { 'id': id, 'text': data });
    }
  });

};

exports.update = (id, text, callback) => {
  var item = items[id];

  fs.readFile(`${exports.dataDir}/${id}.txt`, 'utf8', (err, data) => {
    if (err) {
      callback(err);
    } else {
      fs.writeFile(`${exports.dataDir}/${id}.txt`, text, (err, data) => {
        if (!item) {
          callback(new Error(`No item with id: ${id}`));
        } else {
          items[id] = text;
          callback(null, { id, text });
        }
      });
    }
  });

};

exports.delete = (id, callback) => {
  //var item = items[id];
  //delete items[id];
  // if (!item) {
  //   // report an error if item not found
  //   callback(new Error(`No item with id: ${id}`));
  // } else {
  //   callback();
  // }

  fs.readFile(`${exports.dataDir}/${id}.txt`, 'utf8', (err, data) => {
    if (err) {
      callback(err);
    } else {
      fs.unlink(`${exports.dataDir}/${id}.txt`, (err) => {
        if (err) {
          // report an error if item not found
          callback(new Error(`No item with id: ${id}`));
        } else {
          callback();
        }
      });
    }
  });
}

// Config+Initialization code -- DO NOT MODIFY /////////////////////////////////

exports.dataDir = path.join(__dirname, 'data');

exports.initialize = () => {
  if (!fs.existsSync(exports.dataDir)) {
    fs.mkdirSync(exports.dataDir);
  }
};
