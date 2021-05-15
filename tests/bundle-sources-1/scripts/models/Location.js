define([], function () {
    function Location(entity) {
        var self = this;

        if (!entity) {
            entity = {};
        }

        self.description = entity.description;
    }

    return Location;
});