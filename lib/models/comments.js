module.exports = function(sequelize, DataTypes) {
    var Comments = sequelize.define("comments", {
        CommentID: {
            type: DataTypes.INTEGER,
            primaryKey: true
        },
        BlogID: {
            type: DataTypes.INTEGER
        },
        CommentName: {
            type: DataTypes.STRING(255)
        },
        CommentContent: {
            type: DataTypes.STRING(255)
        },
        AdminID: {
            type: DataTypes.INTEGER
        },
        CommentCreatedDate: {
            type: DataTypes.DATE
        },
        CommentDeleted: {
            type: DataTypes.BOOLEAN
        }
    }, {
        freezeTableName: true,
        timestamps: false
    });
    return Comments;
};