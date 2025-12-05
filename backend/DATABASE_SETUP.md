# Database Setup Guide

## PostgreSQL Configuration

The Haunted Greenhouse backend now uses PostgreSQL for relational data (users, greenhouses, zones) in addition to InfluxDB for time-series sensor data.

## Quick Start with Docker

The easiest way to set up PostgreSQL is using Docker Compose:

```bash
# Start all services including PostgreSQL
docker-compose up -d postgres

# Verify PostgreSQL is running
docker ps | grep postgres
```

## Manual PostgreSQL Installation

If you prefer to install PostgreSQL manually:

### Windows
1. Download PostgreSQL from https://www.postgresql.org/download/windows/
2. Run the installer and follow the setup wizard
3. Set the password for the postgres user
4. Ensure PostgreSQL service is running

### macOS
```bash
brew install postgresql@16
brew services start postgresql@16
```

### Linux (Ubuntu/Debian)
```bash
sudo apt update
sudo apt install postgresql postgresql-contrib
sudo systemctl start postgresql
sudo systemctl enable postgresql
```

## Database Creation

If using manual installation, create the database:

```bash
# Connect to PostgreSQL
psql -U postgres

# Create database
CREATE DATABASE haunted_greenhouse;

# Exit psql
\q
```

## Environment Variables

Ensure the following environment variables are set in your `.env` file:

```env
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_USER=postgres
DATABASE_PASSWORD=postgres
DATABASE_NAME=haunted_greenhouse
```

## TypeORM Configuration

TypeORM is configured to:
- **Auto-sync in development**: Tables are automatically created/updated based on entities
- **Logging in development**: SQL queries are logged to console
- **SSL in production**: Secure connections are enforced in production

## Installing Dependencies

After updating package.json, install the new dependencies:

```bash
cd backend
npm install
```

## Verifying Setup

Start the backend server to verify the database connection:

```bash
npm run start:dev
```

You should see TypeORM connection logs in the console if everything is configured correctly.

## Troubleshooting

### Connection Refused
- Ensure PostgreSQL is running: `docker ps` or check service status
- Verify the port is correct (default: 5432)
- Check firewall settings

### Authentication Failed
- Verify DATABASE_USER and DATABASE_PASSWORD in .env
- For Docker setup, default credentials are postgres/postgres

### Database Does Not Exist
- Create the database manually using psql or pgAdmin
- Or let Docker Compose handle it automatically

## Next Steps

Once PostgreSQL is set up:
1. Install dependencies: `npm install`
2. Create User, Greenhouse, and Zone entities
3. Run migrations (if needed)
4. Start implementing the Auth module
