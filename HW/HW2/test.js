var subject = require('./subject.js')
var mock = require('mock-fs');
subject.inc('',undefined);
subject.weird('','','',"strict");
mock({"path/fileExists":{},"pathContent":{"file1":"text content"}});
	subject.fileTest('path/fileExists','pathContent/file1');
mock.restore();
subject.normalize('');
subject.format('','','');
subject.blackListNumber('');
