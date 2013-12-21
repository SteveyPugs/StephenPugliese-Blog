module.exports = function(sequelize, DataTypes) {
    var Users = sequelize.define("blogadmin", {
        adminid: {
            type: DataTypes.INTEGER,
            primaryKey: true
        },
        adminemail: {
            type: DataTypes.STRING(255)
        },
        adminpassword: {
            type: DataTypes.STRING(255)
        },
        admindeleted: {
            type: DataTypes.BOOLEAN
        },
        verifyhash: {
            type: DataTypes.STRING
        }
    }, {
        freezeTableName: true,
        timestamps: false
    });
    return Users;
};