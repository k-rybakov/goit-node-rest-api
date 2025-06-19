export async function up(queryInterface, Sequelize) {
  await queryInterface.addColumn('users', 'avatarURL', {
    type: Sequelize.STRING,
    allowNull: true,
    defaultValue: null,
  });
}

export async function down(queryInterface, Sequelize) {
  await queryInterface.removeColumn('users', 'avatarURL');
} 