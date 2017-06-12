// API for e.g. Mobile application
// This API uses the website
var fs = require('fs');

exports.install = function() {
	// COMMON
	F.route('/api/ping/',        json_ping);
	
	F.route('/api/products/upload',                  upload,        ['post', 'upload', 10000], 3084); // 3 MB
	F.route('/api/products/upload/base64',           upload_base64, ['post', 10000], 2048); // 2 MB

	//       URL                  Handler   Flags                    Method
	F.route('/api/posts',      	    query,  ['*Post']);          // GET (default)
	F.route('/api/posts/{id}', 	    get,    ['*Post']);          // GET (default)
	//F.route('/api/products',      save,   ['*Product', 'post']);  // POST
	//F.route('/api/products/{id}', remove, ['*Product', 'delete']);// DELETE

	F.route('/api/products',      	    query,  ['*Product']);          // GET (default)
	F.route('/api/products/{id}', 	    get,    ['*Product']);          // GET (default)
	F.route('/api/products',            save,   ['*Product', 'post']);  // POST
	

	F.route('/api/vitrini',            query,  ['*Vitrini']);          // GET (default)
    F.route('/api/vitrini/{id}',       get,    ['*Vitrini']);          // GET (default)
    F.route('/api/vitrini',            save,   ['*Vitrini', 'post']);  // POST

	//F.route('/download/',   query);

	//F.restful('/api/products/', ['*Product'], json_query, json_read, json_save, json_delete);
	// NEWSLETTER
	//F.route('/api/newsletter/',  json_save, ['post', '*Newsletter']);

	F.restful('/api/newsletter/', ['*Newsletter'], json_query, json_read, json_save, json_delete);

	// CONTACTFORM
	F.route('/api/contact/',     json_save, ['post', '*Contact']);
};

// ==========================================================================
// COMMON
// ==========================================================================

function json_ping() {
	var self = this;
	self.plain('null');
}

// Upload (multiple) pictures
function upload() {

	var self = this;
	var id = [];

	self.files.wait(function(file, next) {
		file.read(function(err, data) {

			// Store current file into the HDD
			file.extension = U.getExtension(file.filename);
			id.push(NOSQL('files').binary.insert(file.filename, data) + '.' + file.extension);

			// Next file
			setTimeout(next, 100);
		});

	}, () => self.json(id));
}

// Upload base64
function upload_base64() {
	var self = this;

	if (!self.body.file) {
		self.json(null);
		return;
	}

	var type = self.body.file.base64ContentType();
	var ext;

	switch (type) {
		case 'image/png':
			ext = '.png';
			break;
		case 'image/jpeg':
			ext = '.jpg';
			break;
		case 'image/gif':
			ext = '.gif';
			break;
		default:
			self.json(null);
			return;
	}

	var data = self.body.file.base64ToBuffer();
	var id = NOSQL('files').binary.insert('base64' + ext, data);
	self.json('public/download/' + id + ext);
}


//products
function query() {
    // `this` is an instance of Controller
    // https://docs.totaljs.com/latest/en.html#api~FrameworkController
    var self = this;
    // $query is Schema method that we defined using `schema.setQuery(...)`
    //self.$query(self.query, self.callback());
    // instead of self.callback you can supply your own callback function
    self.$query(self.query, function(err, result){
         self.json(result);
    });
}

function get(id) {
    // the id is parsed by framework from url `/api/products/{id}`
    var self = this;
    // $get is Schema method that we defined using `schema.setGet(...)`
    this.$get(id, self.callback());    
}

function save() {
    var self = this;
    // $save is Schema method that we defined using `schema.setSave(...)`
    // the $save method is available on this.body for POST request
    this.body.$save(self.callback());
    // another way to use it is
    // this.$save(this.body, self.callback());

}

function remove(id) {
    var self = this;
    // $remove is Schema method that we defined using `schema.setRemove(...)`
    this.$remove(id, self.callback());
}
// ==========================================================================
// NEWSLETTER & CONTACT
// ==========================================================================

function json_save() {
	var self = this;
	self.body.$save(self.callback());
}



function json_query() {
	var self = this;
	var options = {};

	options.search = self.query.search;

	self.$query(options, self.callback());
}

function json_read(id) {
	var self = this;
	var options = {};

	options.id = id;

	self.$get(options, self.callback());
}

function json_create() {
	var self = this;
	self.$save(self.callback());
}

function json_save(id) {
	var self = this;

	if (id)
		self.body.id = id;

	self.$save(self.callback());
}

function json_delete(id) {
	var self = this;
	var options = {};

	options.id = id;

	self.$remove(options, self.callback());
}