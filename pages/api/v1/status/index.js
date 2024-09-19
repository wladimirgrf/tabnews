import database from "infra/database";

async function status(request, response) {
  const updatedAt = new Date().toISOString();

  const maxConnectionsResult = await database.query('SHOW max_connections;');
  const maxConnections = maxConnectionsResult.rows[0].max_connections;

  const versionResult = await database.query('SHOW server_version;');
  const version = versionResult.rows[0].server_version;

  const openConnectionsResult = await database.query({
    text: 'SELECT numbackends as opened_connections FROM pg_stat_database where datname = $1',
    values: [process.env.POSTGRES_DB],
  });
  const openedConnections = openConnectionsResult.rows[0].opened_connections;

  response.status(200).json({
    updated_at: updatedAt,
    dependencies: {
      database: {
        max_connections: parseInt(maxConnections),
        opened_connections: openedConnections,
        version: version,
      },
    },
  });
}

export default status;
