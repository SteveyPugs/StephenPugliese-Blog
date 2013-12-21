module.exports = function(sequelize, DataTypes) {
    var BlogEntries = sequelize.define("blogs", {
        BlogID: {
            type: DataTypes.INTEGER,
            primaryKey: true
        },
        BlogTitle: {
            type: DataTypes.STRING(255)
        },
        BlogContent: {
            type: DataTypes.STRING(255)
        },
        BlogCreateDate: {
            type: DataTypes.DATE
        },
        BlogDeleted: {
            type: DataTypes.BOOLEAN
        },
        AdminID: {
            type: DataTypes.INTEGER
        },
        TagID: {
            type: DataTypes.INTEGER
        },
        Draft: {
            type: DataTypes.INTEGER
        },
    }, {
        timestamps: false
    });
    return BlogEntries;
};
