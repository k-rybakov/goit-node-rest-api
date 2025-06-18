import { DataTypes } from 'sequelize';

export async function up(queryInterface) {
  await queryInterface.addColumn('contacts', 'owner', {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    },
    onUpdate: 'CASCADE',
    onDelete: 'CASCADE'
  });
}

export async function down(queryInterface) {
  await queryInterface.removeColumn('contacts', 'owner');
} 