# Maharashtra POS System - Local Development Setup

## Prerequisites

Before setting up the project locally in VS Code, ensure you have the following installed:

1. **Node.js** (v20 or higher)
   - Download from [nodejs.org](https://nodejs.org/)
   - Verify installation: `node --version` and `npm --version`

2. **PostgreSQL** (v16 or higher)
   - Download from [postgresql.org](https://www.postgresql.org/download/)
   - Or use Docker: `docker run --name postgres-pos -e POSTGRES_PASSWORD=password -p 5432:5432 -d postgres:16`

3. **Git**
   - Download from [git-scm.com](https://git-scm.com/)

4. **VS Code**
   - Download from [code.visualstudio.com](https://code.visualstudio.com/)

## VS Code Extensions (Recommended)

Install these extensions for the best development experience:

- **ES7+ React/Redux/React-Native snippets** - React code snippets
- **TypeScript Importer** - Auto import TypeScript modules
- **Prettier - Code formatter** - Code formatting
- **ESLint** - JavaScript/TypeScript linting
- **Tailwind CSS IntelliSense** - Tailwind CSS autocomplete
- **PostgreSQL** - Database management
- **Thunder Client** - API testing (alternative to Postman)
- **Auto Rename Tag** - HTML/JSX tag renaming
- **Bracket Pair Colorizer** - Better bracket visualization

## Project Setup

### 1. Clone or Download the Project

If you have Git access to the repository:
```bash
git clone <repository-url>
cd maharashtra-pos-system
```

Or download the project files and extract them to your desired folder.

### 2. Install Dependencies

Open terminal in VS Code (`Ctrl+` ` or `Cmd+` `) and run:

```bash
npm install
```

This will install all required dependencies for both frontend and backend.

### 3. Database Setup

#### Option A: Local PostgreSQL
1. Create a new database:
```sql
CREATE DATABASE maharashtra_pos;
CREATE USER pos_user WITH PASSWORD 'pos_password';
GRANT ALL PRIVILEGES ON DATABASE maharashtra_pos TO pos_user;
```

#### Option B: Using Docker
```bash
docker run --name postgres-pos \
  -e POSTGRES_DB=maharashtra_pos \
  -e POSTGRES_USER=pos_user \
  -e POSTGRES_PASSWORD=pos_password \
  -p 5432:5432 \
  -d postgres:16
```

### 4. Environment Variables

Create a `.env` file in the project root:

```env
# Database Configuration
DATABASE_URL=postgresql://pos_user:pos_password@localhost:5432/maharashtra_pos

# Session Configuration
SESSION_SECRET=your-super-secret-session-key-change-this-in-production

# Replit Environment (for local development)
REPL_ID=local-development
REPLIT_DOMAINS=localhost:5000
NODE_ENV=development

# Optional: For production deployment
ISSUER_URL=https://replit.com/oidc
```

**Important:** Never commit the `.env` file to version control. Add it to `.gitignore`.

### 5. Database Migration

Run the database migration to create all necessary tables:

```bash
npm run db:push
```

This uses Drizzle ORM to create the database schema.

### 6. Start Development Server

```bash
npm run dev
```

This will start:
- Backend server on `http://localhost:5000`
- Frontend development server with hot reload
- Vite dev server for fast development

## VS Code Configuration

### Recommended Settings

Create `.vscode/settings.json` in your project:

```json
{
  "typescript.preferences.importModuleSpecifier": "relative",
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  },
  "tailwindCSS.includeLanguages": {
    "typescript": "javascript",
    "typescriptreact": "javascript"
  },
  "files.associations": {
    "*.css": "tailwindcss"
  }
}
```

### Launch Configuration

Create `.vscode/launch.json` for debugging:

```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "name": "Launch POS Server",
      "type": "node",
      "request": "launch",
      "program": "${workspaceFolder}/server/index.ts",
      "env": {
        "NODE_ENV": "development"
      },
      "runtimeArgs": ["--loader", "tsx/esm"],
      "console": "integratedTerminal",
      "internalConsoleOptions": "neverOpen"
    }
  ]
}
```

### Tasks Configuration

Create `.vscode/tasks.json` for build tasks:

```json
{
  "version": "2.0.0",
  "tasks": [
    {
      "label": "Start Dev Server",
      "type": "shell",
      "command": "npm run dev",
      "group": "build",
      "presentation": {
        "echo": true,
        "reveal": "always",
        "focus": false,
        "panel": "shared"
      },
      "problemMatcher": []
    },
    {
      "label": "Build Project",
      "type": "shell",
      "command": "npm run build",
      "group": "build",
      "presentation": {
        "echo": true,
        "reveal": "always",
        "focus": false,
        "panel": "shared"
      }
    }
  ]
}
```

## Project Structure

```
maharashtra-pos-system/
├── client/                 # Frontend React application
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── contexts/       # React contexts for state management
│   │   ├── hooks/          # Custom React hooks
│   │   ├── pages/          # Page components
│   │   ├── lib/            # Utility functions
│   │   └── main.tsx        # App entry point
│   ├── index.html          # HTML template
│   └── public/             # Static assets
├── server/                 # Backend Express server
│   ├── db.ts              # Database connection
│   ├── index.ts           # Server entry point
│   ├── routes.ts          # API routes
│   ├── storage.ts         # Data access layer
│   ├── replitAuth.ts      # Authentication setup
│   └── vite.ts            # Vite integration
├── shared/                 # Shared types and schemas
│   └── schema.ts          # Database schema and types
├── package.json           # Dependencies and scripts
├── vite.config.ts         # Vite configuration
├── tailwind.config.ts     # Tailwind CSS configuration
├── drizzle.config.ts      # Database ORM configuration
└── tsconfig.json          # TypeScript configuration
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run db:push` - Push database schema changes
- `npm run check` - TypeScript type checking

## Development Workflow

1. **Start the development server:**
   ```bash
   npm run dev
   ```

2. **Open your browser to:**
   ```
   http://localhost:5000
   ```

3. **For database changes:**
   - Modify `shared/schema.ts`
   - Update `server/storage.ts` if needed
   - Run `npm run db:push`

4. **For new features:**
   - Add components in `client/src/components/`
   - Add pages in `client/src/pages/`
   - Add API routes in `server/routes.ts`

## Troubleshooting

### Common Issues

1. **Database Connection Errors:**
   - Verify PostgreSQL is running
   - Check DATABASE_URL in `.env`
   - Ensure database exists and user has permissions

2. **Port Already in Use:**
   - Kill process using port 5000: `lsof -ti:5000 | xargs kill -9`
   - Or use a different port by modifying `server/index.ts`

3. **Module Not Found Errors:**
   - Run `npm install` to ensure all dependencies are installed
   - Clear node_modules and reinstall if issues persist

4. **TypeScript Errors:**
   - Run `npm run check` to see all type errors
   - Ensure all imports use correct paths

### Debugging Tips

1. **Use VS Code debugger:**
   - Set breakpoints in TypeScript files
   - Use F5 to start debugging
   - Inspect variables and call stack

2. **Check browser console:**
   - Open DevTools (F12)
   - Check Console and Network tabs for errors

3. **Check server logs:**
   - Server logs appear in VS Code terminal
   - Look for database connection and API errors

## Production Build

To build for production:

```bash
npm run build
npm run start
```

The built files will be in the `dist/` directory.

## Contributing

1. Create a feature branch
2. Make your changes
3. Test thoroughly
4. Submit a pull request

## Support

For issues and questions:
- Check the troubleshooting section above
- Review error messages in browser console and server logs
- Ensure all prerequisites are properly installed