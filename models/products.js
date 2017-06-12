NEWSCHEMA('Product').make(function(schema) {

    schema.define('name', String, true);
    schema.define('price', Number, true);
    schema.define('description', String);
    schema.define('picture', 'Object');
 //  schema.define('pictures', '[String]')               // URL addresses for first 5 pictures


    // Query products
    schema.setQuery(function(error, options, callback) {

        // pagination
        options.page = U.parseInt(options.page) - 1;
        options.max = U.parseInt(options.max, 20);

        // if page not specified set it to 0
        if (options.page < 0)
            options.page = 0;

        // number of items to return
        var take = U.parseInt(options.max);

        // number of items to skip
        var skip = U.parseInt(options.page * options.max);

        // NOSQL is total.js embedded database
        // https://docs.totaljs.com/latest/en.html#api~Database
        var filter = NOSQL('products').find();

        filter.take(take);
        filter.skip(skip);

        if(options.sort) filter.sort(options.sort);

        filter.callback(function(err, docs, count) {

            // let's create object which will be returned
            var data = {};
            data.count = count;
            data.items = docs;
            data.limit = options.max;
            data.pages = Math.ceil(data.count / options.max) || 1;
            data.page = options.page + 1;

            callback(data);
        });

    });

    // Get single product by id
    schema.setGet(function(error, model, id, callback) {

        NOSQL('products')
            .one()
            .where('id', id)
            .callback(function(err, product){

                callback({success: !!product, data: product});

            });

    });

    // Save the product into the database
    schema.setSave(function(error, model, options, callback) {

        // if there's no id then it's an insert otherwise update
        var isNew = model.id ? false : true;

        // create id if it's new
        if(isNew) model.id = UID(); //UID returns string such as 16042321110001yfg

        NOSQL('products')
            .upsert(model) // update or insert
            .where('id', model.id)
            .callback(function() {

                callback({success: true, id: model.id});

            });
    });

    // Remove a specific product
    schema.setRemove(function(error, id, callback) {

        NOSQL('products')
            .remove()
            .where('id', id)
            .callback(function(){

                callback({success: true});

            });

    });
});
