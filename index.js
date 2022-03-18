var fs = require('fs');
var chokidar = require("chokidar");
var Service, Characteristic;

module.exports = function(homebridge) {
  Service = homebridge.hap.Service;
  Characteristic = homebridge.hap.Characteristic;

  homebridge.registerAccessory("homebridge-temperature-file", "TemperatureFile", TemperatureFileAccessory);
}

function TemperatureFileAccessory(log, config) {
  this.log = log;
  this.name = config["name"];
  this.filePath = config["file_path"];

  var service = new Service.TemperatureSensor(this.name);

  var changeAction = function(data) {
    service
      .getCharacteristic(Characteristic.CurrentTemperature)
      .setProps({unit: Characteristic.Units.CELSIUS, minValue: -100})
      .setValue(data);
  }

  var changeHandler = function(path, stats) {
    fs.readFile(this.filePath, 'utf8', function(err, data) {
      changeAction(err ? null : parseFloat(data));
    })
  }.bind(this);

  var watcher = chokidar.watch(this.filePath, {alwaysStat: true, usePolling: true});
  watcher.on('add', changeHandler);
  watcher.on('change', changeHandler);
  watcher.on('unlink', changeHandler);

  this.service = service;
}

TemperatureFileAccessory.prototype.getServices = function() {
  return [this.service];
}
