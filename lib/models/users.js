module.exports = function(sequelize, DataTypes) {
    var Users = sequelize.define("blogadmin", {
        AdminID: {
            type: DataTypes.INTEGER,
            primaryKey: true
        },
        AdminEmail: {
            type: DataTypes.STRING(255)
        },
        AdminPassword: {
            type: DataTypes.STRING(255)
        },
        AdminDeleted: {
            type: DataTypes.BOOLEAN
        },
        VerifyHash: {
            type: DataTypes.STRING
        }
    }, {
        freezeTableName: true,
        timestamps: false
    });
    return Users;
};