define([], function () {
    function Activity(entity) {
        var self = this;

        if (!entity) {
            entity = {};
        }

        self.name = entity.name;
        self.difficulty = entity.difficulty;
        self.stickynessFactor = entity.stickynessFactor;
        self.startDate = entity.startDate;
    }

    return Activity;
});