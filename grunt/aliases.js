
module.exports = function (grunt) {
  'use strict';

  grunt.registerTask('build', [
    'copy:dist',
  ]);
  
  grunt.registerTask('test', [
    'lint'
  ]);

  grunt.registerTask('default', [
    'build'
  ]);
};
